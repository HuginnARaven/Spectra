import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from "@/components/ui/field.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useState, useEffect, useMemo} from "react";
import {Collapsible, CollapsibleContent} from "@/components/ui/collapsible.tsx";
import {Toggle} from "@/components/ui/toggle.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {fetchSubscriptionPlans} from "@/features/pricing/pricingSlice.ts";
import type {UserSubscription} from "@/features/account/types.ts";
import {
    ALLOWED_INTERVALS,
    formatIntervalLabel,
    formatPrice,
    getPlanFeatures,
    INTERVAL_PRIORITY
} from "@/features/pricing/utils.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import type {SubscriptionPlan, SubscriptionPrice} from "@/features/pricing/types.ts";
import { InfoIcon } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import {changePlan} from "@/features/account/accountSlice.ts";
import { toast } from "sonner";

export interface UpdatePlanDialogProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    currentSubscription: UserSubscription | null;
}

export function UpdatePlanDialog({isOpen, setOpen, currentSubscription}: UpdatePlanDialogProps) {
    const dispatch = useAppDispatch();
    const { plans, isLoading: isPlansLoading } = useAppSelector((state) => state.pricing);
    const { isSubscriptionLoading } = useAppSelector((state) => state.account);
    const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
    
    useEffect(() => {
        if (isOpen && plans.length === 0) {
            dispatch(fetchSubscriptionPlans());
        }
    }, [isOpen, plans.length, dispatch]);

    const availableIntervals = useMemo(() => {
        const intervalsSet = new Set<string>();
        plans.forEach((plan) => {
            plan.prices?.forEach((price) => {
                if (price && price.isActive && price.interval) {
                    const lowerInterval = price.interval.toLowerCase();
                    if (ALLOWED_INTERVALS.includes(lowerInterval as (typeof ALLOWED_INTERVALS)[number])) {
                        intervalsSet.add(lowerInterval);
                    }
                }
            });
        });
        return Array.from(intervalsSet).sort((a, b) => {
            const indexA = INTERVAL_PRIORITY.indexOf(a);
            const indexB = INTERVAL_PRIORITY.indexOf(b);
            return (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99);
        });
    }, [plans]);

    const [selectedInterval, setSelectedInterval] = useState<string>(
        () => currentSubscription?.interval?.toLowerCase() || availableIntervals[0] || "month"
    );

    useEffect(() => {
        if (availableIntervals.length > 0 && !availableIntervals.includes(selectedInterval)) {
            setSelectedInterval(availableIntervals[0]);
        }
    }, [availableIntervals, selectedInterval]);

    useEffect(() => {
        if (isOpen) {
            if (currentSubscription?.interval) {
                setSelectedInterval(currentSubscription.interval.toLowerCase());
            }
            if (currentSubscription?.subscriptionPlanPriceId) {
                setSelectedPriceId(currentSubscription.subscriptionPlanPriceId);
            }
        }
    }, [isOpen, currentSubscription]);

    const paidPlans = useMemo(() => {
        return plans.filter((plan) => !plan.isDefault);
    }, [plans]);

    const handleSelectPrice = (priceId: string) => {
        setSelectedPriceId(priceId);
    };
    
    const handleOpenChange = (open: boolean) => {
        if (currentSubscription?.subscriptionPlanPriceId !== undefined) {
            setSelectedPriceId(currentSubscription?.subscriptionPlanPriceId);
        }
        setOpen(open);
    }

    const handleConfirmChangePlan = async (priceId: string) => {
        try {
            await dispatch(changePlan({ newPriceId: priceId })).unwrap();
            toast.success("Subscription plan updated successfully!");
            setOpen(false);
        } catch (err: any) {
            toast.error(err || "Failed to update subscription plan.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-2xl max-h-[65vh] overflow-hidden flex flex-col shrink-0">
                <DialogHeader className="flex flex-row justify-between items-center">
                    <DialogTitle>
                        Update Plan
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        {
                            availableIntervals.length <= 2 ?
                                availableIntervals.map((interval, index) => (
                                    <Toggle variant="outline" key={`${index}-${interval}`} aria-label={`Select ${interval} billing`}
                                            pressed={selectedInterval === interval}
                                            onPressedChange={() => setSelectedInterval(interval)}>
                                        {formatIntervalLabel(interval)}
                                    </Toggle>
                                ))
                                :
                                <>
                                    <Select value={selectedInterval} onValueChange={setSelectedInterval}>
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {availableIntervals.map((interval, index) => (
                                                    <SelectItem key={`${index}-${interval}`} id={interval} value={interval}>
                                                        {formatIntervalLabel(interval)}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </>
                        }
                    </div>
                </DialogHeader>
                {isPlansLoading && plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                        <Spinner className="h-6 w-6" />
                        <p className="text-sm">Loading available plans...</p>
                    </div>
                ) : paidPlans.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        No upgrade plans available at this moment.
                    </div>
                ) : (
                    <RadioGroup value={selectedPriceId} onValueChange={handleSelectPrice} className="flex-1 min-h-0 overflow-y-auto py-2 mask-[linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)]">
                        {paidPlans.map((plan: SubscriptionPlan, index) => {
                            const activePrice = plan.prices?.find(
                                (p): p is SubscriptionPrice => Boolean(p && p.isActive && p.interval.toLowerCase() === selectedInterval.toLowerCase())
                            );
                            
                            if (!activePrice) return null;

                            const isCurrentPrice = currentSubscription?.subscriptionPlanPriceId === activePrice.id;
                            const features = getPlanFeatures(plan);
                            
                            return (
                                <FieldLabel htmlFor={`price-${activePrice.id}`} key={`${activePrice.id}-${index}`} className="hover:border-primary duration-100 ease-linear">
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <div className="flex flex-row justify-between gap-2">
                                                <FieldTitle>
                                                    <RadioGroupItem value={activePrice.id} id={`price-${activePrice.id}`}/>
                                                    {plan.name}
                                                </FieldTitle>
                                                <span>{formatPrice(activePrice.amount, activePrice.currencyCode)}/{selectedInterval}</span>
                                            </div>
                                            <FieldDescription>
                                                {plan.description}
                                            </FieldDescription>
                                            <div className="flex flex-wrap gap-2">
                                                {features.map((feature, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="group border-border/80 hover:border-primary/30 hover:bg-primary/5 flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-normal transition-colors"
                                                    >
                                                        <span className="bg-primary h-1.5 w-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125"/>
                                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <Collapsible open={selectedPriceId === activePrice.id}>
                                                <CollapsibleContent
                                                    className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                                    {isCurrentPrice ? 
                                                        <Button className="mt-2 w-full" disabled={isCurrentPrice}>
                                                            Current
                                                        </Button> 
                                                        :
                                                        <Button className="mt-2 w-full" disabled={isSubscriptionLoading} onClick={(e) => {e.stopPropagation(); handleConfirmChangePlan(activePrice.id);}}>
                                                            {isSubscriptionLoading ? <><Spinner className="mr-1.5" />Switching...</> : "Switch"}
                                                        </Button>
                                                    }
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </FieldContent>
                                    </Field>
                                </FieldLabel>
                            )
                        })}
                    </RadioGroup>
                )}
                <Alert className="shrink-0 bg-muted/50">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>What will happen after switch?</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                        Your plan changes immediately with prorated billing. Price adjustments are applied to your next invoice, or charged right away if switching billing intervals.
                        {currentSubscription?.cancelAtPeriodEnd && (
                            <span className="block mt-1 font-medium text-foreground">
                                Note: Updating your plan will also resume automatic renewal for your subscription.
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            </DialogContent>
        </Dialog>
    );
}
