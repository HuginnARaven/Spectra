import { useState, useEffect } from "react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Circle, AlertTriangleIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { cancelSubscription } from "@/features/account/accountSlice";
import type { UserSubscription } from "@/features/account/types";
import { formatPrice } from "@/features/pricing/utils";
import { toast } from "sonner";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

export interface CancelSubscriptionDialogProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    subscription: UserSubscription;
    planFeatures?: string[];
}

export function CancelSubscriptionDialog({
    isOpen,
    setOpen,
    subscription,
    planFeatures = [],
}: CancelSubscriptionDialogProps) {
    const dispatch = useAppDispatch();
    const { isSubscriptionLoading } = useAppSelector((state) => state.account);
    const [step, setStep] = useState<1 | 2>(1);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
        }
    }, [isOpen]);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "the end of your billing cycle";
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

    const periodEndDate = formatDate(subscription.currentPeriodEnd);

    const priceText =
        subscription.amount > 0
            ? `${formatPrice(subscription.amount, subscription.currencyCode)}/${subscription.interval || "month"}`
            : "Free";

    const handleConfirmCancellation = async () => {
        try {
            await dispatch(cancelSubscription({ immediate: false })).unwrap();
            toast.success("Subscription scheduled for cancellation at period end.");
            setOpen(false);
        } catch (err: any) {
            toast.error(err || "Failed to cancel subscription.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                {
                    step === 1 ?
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Change Plan
                                </DialogTitle>
                                <DialogDescription>
                                    We're sorry to see you go. Please review what will change when your subscription
                                    ends.
                                </DialogDescription>
                            </DialogHeader>
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {subscription.planName} Plan
                                    </CardTitle>
                                    <CardDescription>
                                        Current active subscription
                                    </CardDescription>
                                    <CardAction>
                                        <Badge variant="secondary" className="text-sm font-semibold px-3 py-1 rounded-full">
                                            {priceText}
                                        </Badge>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="-mb-(--card-spacing)">
                                    <Separator className="mb-6"/>
                                    <div className="flex flex-col gap-2">
                                        {planFeatures.length > 0 && (
                                            planFeatures.slice(0, 4).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Circle className="fill-primary text-primary h-2 w-2"/>
                                                    <span className="text-sm text-muted-foreground">
                                                        {feature}
                                                    </span>
                                                </div>
                                                )
                                            ))
                                        }
                                        {planFeatures.length > 4 && (
                                            <div key="and-more-bullet-point" className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                And more ...
                                            </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Alert
                                className=" border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                                <AlertTriangleIcon/>
                                <AlertTitle>Cancellation details</AlertTitle>
                                <AlertDescription>
                                    Your access will remain active until {periodEndDate}. After this date, you will be
                                    downgraded
                                    to the Free plan and will not be charged again.
                                </AlertDescription>
                            </Alert>

                            <DialogFooter>
                                <DialogClose>
                                    <Button 
                                        variant="outline" 
                                        disabled={isSubscriptionLoading}
                                    >
                                        Keep My Subscription
                                    </Button>
                                </DialogClose>
                                <Button 
                                    variant="destructive" 
                                    disabled={isSubscriptionLoading} 
                                    onClick={() => setStep(2)}
                                >
                                    Continue Cancellation
                                </Button>
                            </DialogFooter>
                        </>
                        :
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangleIcon />
                                    Final Confirmation
                                </DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to cancel your {subscription.planName} subscription?
                                </DialogDescription>
                            </DialogHeader>
                            <Card className="bg-muted/40 border border-destructive/20">
                                <CardHeader className="text-center">
                                    <CardTitle>
                                        Auto-renewal will be turned off
                                    </CardTitle>
                                    <CardDescription>
                                        We listed what will happen after {periodEndDate}
                                    </CardDescription>
                                </CardHeader>
                                <Separator/>
                                <CardContent className="space-y-2">
                                    <div key="consiquences-bullet-point-1" className="flex items-center gap-2">
                                        <Circle className="fill-primary text-primary h-2 w-2 shrink-0"/>
                                        <span>
                                            You  will be granted to the Free plan and will not be charged again.
                                        </span>
                                    </div>
                                    <div key="consiquences-bullet-point-2" className="flex items-center gap-2">
                                        <Circle className="fill-primary text-primary h-2 w-2 shrink-0"/>
                                        <span>
                                            Some of your urls will be turned off to meet limits of default plan.
                                        </span>
                                    </div>
                                    <div key="consiquences-bullet-point-3" className="flex items-center gap-2">
                                        <Circle className="fill-primary text-primary h-2 w-2 shrink-0"/>
                                        <span>
                                            Url visit logs past time specified in default plan will be deleted, but we will keep url statistics for you
                                        </span>
                                    </div>
                                </CardContent>
                                <Separator/>
                                <CardFooter className="text-sm text-destructive font-semibold text-center">
                                    This action cannot be undone once your billing period ends.
                                </CardFooter>
                            </Card>
                            <DialogFooter>
                                <DialogClose>
                                    <Button variant="outline" disabled={isSubscriptionLoading}>Go back</Button>
                                </DialogClose>
                                <Button variant="destructive" disabled={isSubscriptionLoading} onClick={handleConfirmCancellation}>{isSubscriptionLoading ? (<><Spinner className="mr-2" />Cancelling...</>) : ("Yes, Cancel Subscription")}</Button>
                            </DialogFooter>
                        </>
                }
            </DialogContent>
        </Dialog>
    );
}
