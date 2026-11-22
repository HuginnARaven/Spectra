import { useState, useMemo } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CircleCheck, CircleX, PlusIcon } from 'lucide-react'
import * as z from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
    addPriceToAdminSubscriptionPlan,
    updateAdminSubscriptionPrice,
    clearErrors,
} from '@/features/admin/adminSlice'
import type { SubscriptionPlan, SubscriptionPrice } from '@/features/admin/types'
import {
    ALLOWED_INTERVALS,
    INTERVAL_PRIORITY,
    formatIntervalLabel,
    formatIntervalPeriod,
    formatPrice,
} from '@/features/pricing/utils'

export interface ManagePlanPricesDialogProps {
    plan: SubscriptionPlan
    isOpen: boolean
    setOpen: (value: boolean) => void
}

const CURRENCY_OPTIONS = [
    { value: 'usd', label: 'USD ($)' },
    { value: 'eur', label: 'EUR (€)' },
    { value: 'gbp', label: 'GBP (£)' },
    { value: 'uah', label: 'UAH (₴)' },
    { value: 'pln', label: 'PLN (zł)' },
    { value: 'cad', label: 'CAD ($)' },
    { value: 'aud', label: 'AUD ($)' },
] as const

const addPriceFormSchema = z.object({
    amount: z
        .number({ error: 'Amount in cents is required' })
        .int('Amount must be a whole number in cents')
        .min(1, 'Amount must be greater than 0'),
    currencyCode: z.string().trim().min(1, 'Currency is required'),
    interval: z.string().trim().min(1, 'Interval is required'),
    isActive: z.boolean(),
})

type AddPriceFormData = z.infer<typeof addPriceFormSchema>

export function ManagePlanPricesDialog({ plan, isOpen, setOpen }: ManagePlanPricesDialogProps) {
    const dispatch = useAppDispatch()
    const { isPlansLoading, error } = useAppSelector(state => state.admin)
    const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null)

    const form = useForm<AddPriceFormData>({
        resolver: zodResolver(addPriceFormSchema),
        defaultValues: {
            amount: 999,
            currencyCode: 'usd',
            interval: 'month',
            isActive: true,
        },
    })

    const watchedAmount = useWatch({ control: form.control, name: 'amount' })
    const watchedCurrency = useWatch({ control: form.control, name: 'currencyCode' })

    const sortedPrices = useMemo(() => {
        const validPrices = (plan.prices ?? []).filter(
            (p): p is SubscriptionPrice => p !== null && p !== undefined
        )
        return [...validPrices].sort((a, b) => {
            if (a.isActive !== b.isActive) {
                return a.isActive ? -1 : 1
            }
            const indexA = INTERVAL_PRIORITY.indexOf(a.interval.toLowerCase())
            const indexB = INTERVAL_PRIORITY.indexOf(b.interval.toLowerCase())
            const priorityDiff =
                (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99)
            if (priorityDiff !== 0) return priorityDiff
            return a.amount - b.amount
        })
    }, [plan.prices])

    const handleTogglePriceStatus = async (price: SubscriptionPrice) => {
        setUpdatingPriceId(price.id)
        try {
            await dispatch(
                updateAdminSubscriptionPrice({
                    id: price.id,
                    data: { isActive: !price.isActive },
                })
            ).unwrap()
            toast.success(
                `Price ${!price.isActive ? 'activated' : 'deactivated'} successfully`
            )
        } catch (err) {
            console.error('Failed to update price status:', err)
            toast.error(
                typeof err === 'string' ? err : 'Failed to update price status'
            )
        } finally {
            setUpdatingPriceId(null)
        }
    }

    const onAddPriceSubmit = async (data: AddPriceFormData) => {
        try {
            await dispatch(
                addPriceToAdminSubscriptionPlan({
                    planId: plan.id,
                    data: {
                        amount: data.amount,
                        currencyCode: data.currencyCode.toLowerCase(),
                        interval: data.interval.toLowerCase(),
                        isActive: data.isActive,
                    },
                })
            ).unwrap()
            toast.success('New price added to plan')
            form.reset({
                amount: 999,
                currencyCode: data.currencyCode,
                interval: data.interval,
                isActive: true,
            })
        } catch (err) {
            console.error('Failed to add price:', err)
            toast.error(
                typeof err === 'string' ? err : 'Failed to add price to plan'
            )
        }
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            form.reset()
            dispatch(clearErrors())
        }
    }

    const previewPrice = formatPrice(
        typeof watchedAmount === 'number' && !Number.isNaN(watchedAmount) ? watchedAmount : 0,
        watchedCurrency || 'usd'
    )

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Prices: {plan.name}</DialogTitle>
                    <DialogDescription>
                        View and toggle existing billing prices or add a new price option for this plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                            Existing Prices ({sortedPrices.length})
                        </span>
                    </div>

                    {sortedPrices.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No prices configured for this plan yet.
                        </div>
                    ) : (
                        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                            {sortedPrices.map(price => {
                                const isUpdatingThis = updatingPriceId === price.id

                                return (
                                    <div
                                        key={price.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-base text-foreground">
                                                    {formatPrice(price.amount, price.currencyCode)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatIntervalPeriod(price.interval)}
                                                </span>
                                                {price.isActive ? (
                                                    <Badge className="h-auto rounded-sm border-none capitalize bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400">
                                                        <CircleCheck />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="h-auto rounded-sm border-none capitalize bg-destructive/10 text-destructive">
                                                        <CircleX />
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatIntervalLabel(price.interval)} ·{' '}
                                                {price.currencyCode.toUpperCase()} · {price.amount} cents
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant={price.isActive ? 'outline' : 'default'}
                                            size="sm"
                                            disabled={isPlansLoading || isUpdatingThis}
                                            onClick={() => handleTogglePriceStatus(price)}
                                        >
                                            {isUpdatingThis && <Spinner className="size-3.5" />}
                                            <span>{price.isActive ? 'Deactivate' : 'Activate'}</span>
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <Separator />

                <form
                    id={`add-price-${plan.id}-form`}
                    onSubmit={form.handleSubmit(onAddPriceSubmit)}
                    className="space-y-4"
                >
                    <span className="block font-medium text-xs text-muted-foreground uppercase tracking-wider">
                        Add New Price
                    </span>

                    <FieldGroup className="gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Controller
                                name="amount"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={`add-price-amount-${plan.id}`}>
                                            Amount (cents)
                                        </FieldLabel>
                                        <Input
                                            id={`add-price-amount-${plan.id}`}
                                            name={field.name}
                                            ref={field.ref}
                                            onBlur={field.onBlur}
                                            disabled={field.disabled}
                                            value={field.value ?? ''}
                                            onChange={e =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? ('' as unknown as number)
                                                        : Number(e.target.value)
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                            placeholder="999"
                                            type="number"
                                            min={1}
                                            step={1}
                                        />
                                        <FieldDescription className="text-xs">
                                            Preview:{' '}
                                            <span className="font-medium text-foreground">
                                                {previewPrice}
                                            </span>
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="currencyCode"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={`add-price-currency-${plan.id}`}>
                                            Currency
                                        </FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={field.disabled}
                                        >
                                            <SelectTrigger
                                                id={`add-price-currency-${plan.id}`}
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {CURRENCY_OPTIONS.map(currency => (
                                                        <SelectItem
                                                            key={currency.value}
                                                            value={currency.value}
                                                        >
                                                            {currency.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="interval"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={`add-price-interval-${plan.id}`}>
                                            Interval
                                        </FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={field.disabled}
                                        >
                                            <SelectTrigger
                                                id={`add-price-interval-${plan.id}`}
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Interval" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {ALLOWED_INTERVALS.map(interval => (
                                                        <SelectItem key={interval} value={interval}>
                                                            {formatIntervalLabel(interval)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name="isActive"
                            control={form.control}
                            disabled={isPlansLoading}
                            render={({ field }) => (
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id={`add-price-active-${plan.id}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={field.disabled}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor={`add-price-active-${plan.id}`}>
                                            Set price as active immediately
                                        </FieldLabel>
                                    </FieldContent>
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            form={`add-price-${plan.id}-form`}
                            disabled={isPlansLoading}
                        >
                            <PlusIcon className="size-4" />
                            <span>Add Price</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
