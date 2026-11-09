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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { UserCombobox } from '@/features/admin/components/urls-management-tab/user-combobox'
import type { AdminUrlListItem } from '@/features/admin/types'
import * as z from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { editAdminUrl, clearErrors } from '@/features/admin/adminSlice'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export interface EditUrlDialogProps {
    url: AdminUrlListItem
    isOpen: boolean
    setOpen: (value: boolean) => void
}

const editUrlFormSchema = z.object({
    originalUrl: z
        .string()
        .min(1, 'Original URL is required')
        .url('Please enter a valid URL (e.g. https://example.com)')
        .max(2048, 'URL must be at most 2048 characters'),
    shortCode: z
        .string()
        .min(1, 'Short code is required')
        .max(16, 'Short code must be at most 16 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, underscores, and hyphens'),
    userId: z
        .string()
        .uuid('Please select a valid user')
})

type EditUrlFormData = z.infer<typeof editUrlFormSchema>

export function EditUrlDialog({ url, isOpen, setOpen }: EditUrlDialogProps) {
    const dispatch = useAppDispatch()
    const { isUrlsLoading, error } = useAppSelector(state => state.admin)

    const form = useForm<EditUrlFormData>({
        resolver: zodResolver(editUrlFormSchema),
        defaultValues: {
            originalUrl: url.originalUrl || '',
            shortCode: url.shortCode || '',
            userId: url.userId || ''
        },
        values: {
            originalUrl: url.originalUrl || '',
            shortCode: url.shortCode || '',
            userId: url.userId || ''
        }
    })

    const onSubmit = async (data: EditUrlFormData) => {
        try {
            await dispatch(editAdminUrl({ id: url.id, data })).unwrap()
            toast.success('URL updated successfully')
            setOpen(false)
        } catch (err: any) {
            console.error('URL edit failed:', err)
            toast.error(err || 'Failed to update URL')
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
            <DialogContent className="sm:max-w-md">
                <form id={`edit-url-${url.id}-form`} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Edit URL: {url.shortCode}</DialogTitle>
                        <DialogDescription>
                            Update the destination URL, short code, or assigned user.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Controller
                            name="originalUrl"
                            control={form.control}
                            disabled={isUrlsLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`edit-original-url-${url.id}`}>
                                        Original URL
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`edit-original-url-${url.id}`}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="https://example.com/very-long-url"
                                        type="url"
                                        required
                                    />
                                    <FieldDescription>
                                        The destination URL where visitors will be redirected.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="shortCode"
                            control={form.control}
                            disabled={isUrlsLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`edit-short-code-${url.id}`}>
                                        Short Code
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`edit-short-code-${url.id}`}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="custom-code"
                                        type="text"
                                        required
                                    />
                                    <FieldDescription>
                                        Unique alias for this short link (max 16 chars).
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="userId"
                            control={form.control}
                            disabled={isUrlsLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>
                                        Assigned User
                                    </FieldLabel>
                                    <UserCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isUrlsLoading}
                                        placeholder="Select user..."
                                    />
                                    <FieldDescription>
                                        Search and select the user who owns this URL.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
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
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form={`edit-url-${url.id}-form`} disabled={isUrlsLoading}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
