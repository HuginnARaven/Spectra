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
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { AlertCircle } from 'lucide-react'
import * as z from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createAdminSubscriptionPlan, clearErrors } from '@/features/admin/adminSlice'
import type { CreateSubscriptionPlanRequest } from '@/features/admin/types'
import { ALLOWED_INTERVALS, formatIntervalLabel, formatPrice } from '@/features/pricing/utils'

export interface CreatePlanDialogProps {
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

const createPlanFormSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Plan name is required')
            .max(100, 'Plan name must be at most 100 characters'),
        description: z
            .string()
            .trim()
            .min(1, 'Description is required')
            .max(500, 'Description must be at most 500 characters'),
        isDefault: z.boolean(),
        maxUrlsLimit: z
            .number({ error: 'Max URLs limit must be a valid number' })
            .int('Max URLs limit must be a whole number')
            .min(-1, 'Max URLs limit must be -1 (unlimited) or greater'),
        analyticsRetentionDays: z
            .number({ error: 'Analytics retention days must be a valid number' })
            .int('Analytics retention days must be a whole number')
            .min(0, 'Analytics retention days must be 0 (unlimited) or greater'),
        hasAccessToGeneralAnalytics: z.boolean(),
        hasAccessToUrlAnalytics: z.boolean(),
        hasCustomAliasAccess: z.boolean(),
        hasEarlyFeatureAccess: z.boolean(),
        price: z
            .number({ error: 'Price must be a valid number in cents' })
            .int('Price must be a whole number in cents')
            .nullable()
            .optional(),
        currencyCode: z.string().nullable().optional(),
        interval: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.isDefault) {
            if (
                data.price === null ||
                data.price === undefined ||
                Number.isNaN(data.price) ||
                data.price <= 0
            ) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['price'],
                    message: 'Price in cents must be greater than 0 for paid plans',
                })
            }
            if (!data.currencyCode || !data.currencyCode.trim()) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['currencyCode'],
                    message: 'Currency code is required for paid plans',
                })
            }
            if (!data.interval || !data.interval.trim()) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['interval'],
                    message: 'Billing interval is required for paid plans',
                })
            }
        }
    })

type CreatePlanFormData = z.infer<typeof createPlanFormSchema>

export function CreatePlanDialog({ isOpen, setOpen }: CreatePlanDialogProps) {
    const dispatch = useAppDispatch()
    const { isPlansLoading, error, subscriptionPlans } = useAppSelector(state => state.admin)

    const defaultPlanAlreadyExists = subscriptionPlans.some(plan => plan.isDefault)

    const form = useForm<CreatePlanFormData>({
        resolver: zodResolver(createPlanFormSchema),
        defaultValues: {
            name: '',
            description: '',
            isDefault: false,
            maxUrlsLimit: 100,
            analyticsRetentionDays: 30,
            hasAccessToGeneralAnalytics: true,
            hasAccessToUrlAnalytics: false,
            hasCustomAliasAccess: false,
            hasEarlyFeatureAccess: false,
            price: 999,
            currencyCode: 'usd',
            interval: 'month',
        },
    })

    const isDefault = useWatch({ control: form.control, name: 'isDefault' })
    const watchedPrice = useWatch({ control: form.control, name: 'price' })
    const watchedCurrency = useWatch({ control: form.control, name: 'currencyCode' })

    const onSubmit = async (data: CreatePlanFormData) => {
        const payload: CreateSubscriptionPlanRequest = {
            name: data.name.trim(),
            description: data.description.trim(),
            isDefault: data.isDefault,
            maxUrlsLimit: data.maxUrlsLimit,
            analyticsRetentionDays: data.analyticsRetentionDays,
            hasAccessToGeneralAnalytics: data.hasAccessToGeneralAnalytics,
            hasAccessToUrlAnalytics: data.hasAccessToUrlAnalytics,
            hasCustomAliasAccess: data.hasCustomAliasAccess,
            hasEarlyFeatureAccess: data.hasEarlyFeatureAccess,
            price: data.isDefault ? null : (data.price ?? null),
            currencyCode: data.isDefault ? null : (data.currencyCode ?? null),
            interval: data.isDefault ? null : (data.interval ?? null),
        }

        try {
            await dispatch(createAdminSubscriptionPlan(payload)).unwrap()
            toast.success('Subscription plan created successfully')
            setOpen(false)
            form.reset()
        } catch (err) {
            console.error('Subscription plan creation failed:', err)
            toast.error(
                typeof err === 'string' ? err : 'Failed to create subscription plan'
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
        typeof watchedPrice === 'number' && !Number.isNaN(watchedPrice) ? watchedPrice : 0,
        watchedCurrency || 'usd'
    )

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <form
                    id="create-plan-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <DialogHeader>
                        <DialogTitle>Create Subscription Plan</DialogTitle>
                        <DialogDescription>
                            Configure a new subscription plan, its feature limits, and initial billing price.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            disabled={isPlansLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="create-plan-name">Plan Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id="create-plan-name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="e.g. Pro, Enterprise, Starter"
                                        type="text"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="description"
                            control={form.control}
                            disabled={isPlansLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="create-plan-description">
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="create-plan-description"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Describe who this plan is for and what it offers..."
                                        rows={2}
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="isDefault"
                            control={form.control}
                            disabled={isPlansLoading}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                    <Checkbox
                                        id="create-plan-is-default"
                                        name={field.name}
                                        ref={field.ref}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        onBlur={field.onBlur}
                                        disabled={field.disabled}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="create-plan-is-default">
                                            Default Free Plan
                                        </FieldLabel>
                                        <FieldDescription>
                                            {defaultPlanAlreadyExists
                                                ? 'A default plan already exists. Only one default free plan is allowed.'
                                                : 'Default plans are free for all users and do not have Stripe prices.'}
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        {!isDefault && (
                            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-3.5 sm:grid-cols-3">
                                <Controller
                                    name="price"
                                    control={form.control}
                                    disabled={isPlansLoading}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="create-plan-price">
                                                Price (cents)
                                            </FieldLabel>
                                            <Input
                                                id="create-plan-price"
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
                                                Preview: <span className="font-medium text-foreground">{previewPrice}</span>
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
                                            <FieldLabel htmlFor="create-plan-currency">
                                                Currency
                                            </FieldLabel>
                                            <Select
                                                value={field.value ?? 'usd'}
                                                onValueChange={field.onChange}
                                                disabled={field.disabled}
                                            >
                                                <SelectTrigger id="create-plan-currency" className="w-full">
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
                                            <FieldLabel htmlFor="create-plan-interval">
                                                Interval
                                            </FieldLabel>
                                            <Select
                                                value={field.value ?? 'month'}
                                                onValueChange={field.onChange}
                                                disabled={field.disabled}
                                            >
                                                <SelectTrigger id="create-plan-interval" className="w-full">
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
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                name="maxUrlsLimit"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-plan-max-urls">
                                            Max Active URLs
                                        </FieldLabel>
                                        <Input
                                            id="create-plan-max-urls"
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
                                            type="number"
                                            min={-1}
                                            step={1}
                                        />
                                        <FieldDescription className="text-xs">
                                            Use -1 for unlimited URLs, 0 for none.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="analyticsRetentionDays"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-plan-retention-days">
                                            Analytics Retention (days)
                                        </FieldLabel>
                                        <Input
                                            id="create-plan-retention-days"
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
                                            type="number"
                                            min={0}
                                            step={1}
                                        />
                                        <FieldDescription className="text-xs">
                                            Use 0 for unlimited retention.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="space-y-3 rounded-lg border p-3.5">
                            <span className="block font-medium text-xs text-muted-foreground uppercase tracking-wider">
                                Included Features
                            </span>

                            <Controller
                                name="hasAccessToGeneralAnalytics"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field }) => (
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="create-plan-general-analytics"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor="create-plan-general-analytics">
                                                General dashboard analytics
                                            </FieldLabel>
                                        </FieldContent>
                                    </Field>
                                )}
                            />

                            <Controller
                                name="hasAccessToUrlAnalytics"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field }) => (
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="create-plan-url-analytics"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor="create-plan-url-analytics">
                                                Detailed per-URL analytics
                                            </FieldLabel>
                                        </FieldContent>
                                    </Field>
                                )}
                            />

                            <Controller
                                name="hasCustomAliasAccess"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field }) => (
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="create-plan-custom-alias"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor="create-plan-custom-alias">
                                                Custom URL aliases
                                            </FieldLabel>
                                        </FieldContent>
                                    </Field>
                                )}
                            />

                            <Controller
                                name="hasEarlyFeatureAccess"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field }) => (
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="create-plan-early-access"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor="create-plan-early-access">
                                                Early access to beta features
                                            </FieldLabel>
                                        </FieldContent>
                                    </Field>
                                )}
                            />
                        </div>
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
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" form="create-plan-form" disabled={isPlansLoading}>
                            Create Plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
