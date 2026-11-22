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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import * as z from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updateAdminSubscriptionPlan, clearErrors } from '@/features/admin/adminSlice'
import type { SubscriptionPlan, UpdateSubscriptionPlanRequest } from '@/features/admin/types'

export interface EditPlanDialogProps {
    plan: SubscriptionPlan
    isOpen: boolean
    setOpen: (value: boolean) => void
}

const editPlanFormSchema = z.object({
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
    isActive: z.boolean(),
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
})

type EditPlanFormData = z.infer<typeof editPlanFormSchema>

export function EditPlanDialog({ plan, isOpen, setOpen }: EditPlanDialogProps) {
    const dispatch = useAppDispatch()
    const { isPlansLoading, error } = useAppSelector(state => state.admin)

    const form = useForm<EditPlanFormData>({
        resolver: zodResolver(editPlanFormSchema),
        defaultValues: {
            name: plan.name || '',
            description: plan.description || '',
            isActive: Boolean(plan.isActive),
            maxUrlsLimit: plan.maxUrlsLimit ?? 0,
            analyticsRetentionDays: plan.analyticsRetentionDays ?? 0,
            hasAccessToGeneralAnalytics: Boolean(plan.hasAccessToGeneralAnalytics),
            hasAccessToUrlAnalytics: Boolean(plan.hasAccessToUrlAnalytics),
            hasCustomAliasAccess: Boolean(plan.hasCustomAliasAccess),
            hasEarlyFeatureAccess: Boolean(plan.hasEarlyFeatureAccess),
        },
        values: {
            name: plan.name || '',
            description: plan.description || '',
            isActive: Boolean(plan.isActive),
            maxUrlsLimit: plan.maxUrlsLimit ?? 0,
            analyticsRetentionDays: plan.analyticsRetentionDays ?? 0,
            hasAccessToGeneralAnalytics: Boolean(plan.hasAccessToGeneralAnalytics),
            hasAccessToUrlAnalytics: Boolean(plan.hasAccessToUrlAnalytics),
            hasCustomAliasAccess: Boolean(plan.hasCustomAliasAccess),
            hasEarlyFeatureAccess: Boolean(plan.hasEarlyFeatureAccess),
        },
    })

    const onSubmit = async (data: EditPlanFormData) => {
        const payload: UpdateSubscriptionPlanRequest = {
            name: data.name.trim(),
            description: data.description.trim(),
            isActive: data.isActive,
            maxUrlsLimit: data.maxUrlsLimit,
            analyticsRetentionDays: data.analyticsRetentionDays,
            hasAccessToGeneralAnalytics: data.hasAccessToGeneralAnalytics,
            hasAccessToUrlAnalytics: data.hasAccessToUrlAnalytics,
            hasCustomAliasAccess: data.hasCustomAliasAccess,
            hasEarlyFeatureAccess: data.hasEarlyFeatureAccess,
        }

        try {
            await dispatch(updateAdminSubscriptionPlan({ id: plan.id, data: payload })).unwrap()
            toast.success('Subscription plan updated successfully')
            setOpen(false)
        } catch (err) {
            console.error('Subscription plan update failed:', err)
            toast.error(
                typeof err === 'string' ? err : 'Failed to update subscription plan'
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

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <form
                    id={`edit-plan-${plan.id}-form`}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <DialogHeader>
                        <DialogTitle>Edit Plan: {plan.name}</DialogTitle>
                        <DialogDescription>
                            Update the details, usage limits, and feature permissions for this subscription plan.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            disabled={isPlansLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`edit-plan-name-${plan.id}`}>
                                        Plan Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`edit-plan-name-${plan.id}`}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="e.g. Pro, Enterprise"
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
                                    <FieldLabel htmlFor={`edit-plan-description-${plan.id}`}>
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={`edit-plan-description-${plan.id}`}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Describe this subscription plan..."
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
                            name="isActive"
                            control={form.control}
                            disabled={isPlansLoading}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                    <Checkbox
                                        id={`edit-plan-is-active-${plan.id}`}
                                        name={field.name}
                                        ref={field.ref}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        onBlur={field.onBlur}
                                        disabled={field.disabled}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor={`edit-plan-is-active-${plan.id}`}>
                                            Active Plan
                                        </FieldLabel>
                                        <FieldDescription>
                                            Inactive plans are hidden from the public pricing page and cannot be subscribed to.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                name="maxUrlsLimit"
                                control={form.control}
                                disabled={isPlansLoading}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={`edit-plan-max-urls-${plan.id}`}>
                                            Max Active URLs
                                        </FieldLabel>
                                        <Input
                                            id={`edit-plan-max-urls-${plan.id}`}
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
                                        <FieldLabel htmlFor={`edit-plan-retention-${plan.id}`}>
                                            Analytics Retention (days)
                                        </FieldLabel>
                                        <Input
                                            id={`edit-plan-retention-${plan.id}`}
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
                                            id={`edit-plan-general-analytics-${plan.id}`}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor={`edit-plan-general-analytics-${plan.id}`}>
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
                                            id={`edit-plan-url-analytics-${plan.id}`}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor={`edit-plan-url-analytics-${plan.id}`}>
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
                                            id={`edit-plan-custom-alias-${plan.id}`}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor={`edit-plan-custom-alias-${plan.id}`}>
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
                                            id={`edit-plan-early-access-${plan.id}`}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={field.disabled}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor={`edit-plan-early-access-${plan.id}`}>
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
                        <Button
                            type="submit"
                            form={`edit-plan-${plan.id}-form`}
                            disabled={isPlansLoading}
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
