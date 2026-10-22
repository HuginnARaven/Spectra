import { useState, useEffect } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
    AlertCircle,
    Calendar,
    CreditCard,
    RotateCcw,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loadSubscription, resumeSubscription } from "@/features/account/accountSlice";
import { formatPrice, getPlanFeatures } from "@/features/pricing/utils";
import { CancelSubscriptionDialog } from "@/features/account/components/cancel-subscription-dialog.tsx";
import { UpdatePlanDialog } from "@/features/account/components/update-plan-dialog";
import { toast } from "sonner";
import {useNavigate} from "react-router-dom"

export interface BillingFormProps {
    isOpen: boolean;
    setOpen: (value: boolean) => void;
}

export function BillingForm(props: BillingFormProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, subscription, isSubscriptionLoading } = useAppSelector((state) => state.account);

    const [isUpdatePlanDialogOpen, setIsUpdatePlanDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    useEffect(() => {
        if (props.isOpen) {
            dispatch(loadSubscription());
        }
    }, [props.isOpen, dispatch]);

    const handleOpenChange = (isOpen: boolean) => {
        props.setOpen(isOpen);
    };

    const hasPaidSubscription = Boolean(subscription && subscription.status !== "Canceled");
    const isDefaultPlan = user?.subscriptionPlan?.isDefault ?? !hasPaidSubscription;

    const planName = subscription?.planName || user?.subscriptionPlan?.name || "Free";
    const planDescription =
        user?.subscriptionPlan?.description ||
        (hasPaidSubscription
            ? "Access to premium features, extended limits and advanced analytics."
            : "Free plan with essential link shortening and basic analytics.");

    const priceFormatted =
        hasPaidSubscription && subscription && subscription.amount > 0
            ? `${formatPrice(subscription.amount, subscription.currencyCode)}/${subscription.interval || "month"}`
            : "Free";

    const statusText = hasPaidSubscription && subscription
        ? subscription.status
        : "Active";

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const features = user?.subscriptionPlan
        ? getPlanFeatures(user.subscriptionPlan)
        : [
            "Unlimited active URLs",
            "General dashboard analytics",
            "Detailed per-URL analytics",
            "30-day analytics retention",
            "Custom URL aliases",
            "Early access to beta features",
        ];

    const handleResumeSubscription = async () => {
        try {
            await dispatch(resumeSubscription()).unwrap();
            toast.success("Subscription resumed successfully!");
        } catch (err: any) {
            toast.error(err || "Failed to resume subscription.");
        }
    };
    
    const handleUpdateSubscriptionClick = () => {
        if(hasPaidSubscription) {
            setIsUpdatePlanDialogOpen(true)
        }
        props.setOpen(false);
        navigate("/pricing")
    }

    return (
        <>
            <Sheet open={props.isOpen} onOpenChange={handleOpenChange}>
                <SheetContent className="flex flex-col w-full sm:max-w-md md:max-w-lg p-0 gap-0">
                    <SheetHeader className="p-6 pb-4 border-b border-border/40">
                        <SheetTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
                            <div className="bg-primary/10 ring-primary/20 rounded-lg p-2 ring-1">
                                <CreditCard className="text-primary h-5 w-5" />
                            </div>
                            Current Subscription
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            Manage your billing and subscription settings
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        {isSubscriptionLoading && !subscription && !user ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                                <Spinner className="h-7 w-7" />
                                <p className="text-sm">Loading subscription details...</p>
                            </div>
                        ) : (
                            <>
                                <Card className="from-muted/40 via-muted/20 to-muted/40 border-border/60 relative overflow-hidden bg-gradient-to-r py-4 gap-3 shadow-none">
                                    <CardContent className="px-4 py-0 sm:px-5 space-y-2">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <CardTitle className="text-lg font-semibold sm:text-xl flex items-center gap-2">
                                                {planName} Plan
                                                {isDefaultPlan && (
                                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                                        Default
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant={hasPaidSubscription ? "default" : "secondary"}
                                                    className="text-xs font-semibold"
                                                >
                                                    {priceFormatted}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {statusText}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardDescription className="text-xs sm:text-sm leading-relaxed">
                                            {planDescription}
                                        </CardDescription>

                                        {subscription?.cancelAtPeriodEnd && (
                                            <div className="flex items-center gap-2 pt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                <span>
                                                    Subscription will end on {formatDate(subscription.currentPeriodEnd)}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Separator className="bg-border/60" />
                                
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <div className="bg-muted ring-border/50 rounded-md p-1.5 ring-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        Billing Information
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Card className="bg-muted/20 border-border/40 py-3 gap-1 shadow-none transition-colors hover:border-border/70">
                                            <CardHeader className="px-4 py-0 gap-1">
                                                <CardDescription className="text-xs font-normal">
                                                    {subscription?.cancelAtPeriodEnd
                                                        ? "Access expires on"
                                                        : hasPaidSubscription
                                                        ? "Next billing date"
                                                        : "Billing status"}
                                                </CardDescription>
                                                <CardTitle className="text-sm font-semibold sm:text-base">
                                                    {hasPaidSubscription && subscription?.currentPeriodEnd
                                                        ? formatDate(subscription.currentPeriodEnd)
                                                        : "No renewal (Free plan)"}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>

                                        <Card className="bg-muted/20 border-border/40 py-3 gap-1 shadow-none transition-colors hover:border-border/70">
                                            <CardHeader className="px-4 py-0 gap-1">
                                                <CardDescription className="text-xs font-normal">
                                                    Payment method
                                                </CardDescription>
                                                <CardTitle className="text-sm font-semibold sm:text-base flex items-center gap-2">
                                                    {hasPaidSubscription ? (
                                                        <>
                                                            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <span>Credit Card</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <span>None required</span>
                                                        </>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                    </div>
                                </div>

                                <Separator className="bg-border/60" />
                                
                                <div className="flex flex-col gap-2.5 sm:flex-row">
                                    <Button
                                        className="w-full sm:flex-1 shadow-sm"
                                        onClick={handleUpdateSubscriptionClick}
                                    >
                                        <Sparkles className="h-4 w-4 mr-1.5" />
                                        {hasPaidSubscription ? "Update Plan" : "Upgrade Plan"}
                                    </Button>

                                    {hasPaidSubscription && (
                                        subscription?.cancelAtPeriodEnd ? (
                                            <Button
                                                variant="outline"
                                                className="w-full sm:flex-1 shadow-sm"
                                                disabled={isSubscriptionLoading}
                                                onClick={handleResumeSubscription}
                                            >
                                                {isSubscriptionLoading ? (
                                                    <Spinner className="mr-1.5" />
                                                ) : (
                                                    <RotateCcw className="h-4 w-4 mr-1.5" />
                                                )}
                                                Resume Subscription
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full sm:flex-1 shadow-sm hover:text-destructive hover:border-destructive/40"
                                                onClick={() => setIsCancelDialogOpen(true)}
                                            >
                                                Cancel Subscription
                                            </Button>
                                        )
                                    )}
                                </div>

                                <Separator className="bg-border/60" />
                                
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">
                                        Current Plan Features
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {features.map((feature, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="group border-border/80 hover:border-primary/30 hover:bg-primary/5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-normal transition-colors"
                                            >
                                                <span className="bg-primary h-1.5 w-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125" />
                                                <span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
                                                    {feature}
                                                </span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <SheetFooter className="mt-auto border-t border-border/40 px-6 py-4">
                        <SheetClose asChild>
                            <Button variant="outline" className="w-full">
                                Close
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            
            {subscription && (<CancelSubscriptionDialog isOpen={isCancelDialogOpen} setOpen={setIsCancelDialogOpen} subscription={subscription} planFeatures={features}/>)}
            <UpdatePlanDialog isOpen={isUpdatePlanDialogOpen} setOpen={setIsUpdatePlanDialogOpen} currentSubscription={subscription}/>
        </>
    );
}
