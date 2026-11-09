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
import * as z from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createAdminUrl, clearErrors } from '@/features/admin/adminSlice'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, SparklesIcon } from 'lucide-react'

export interface CreateUrlDialogProps {
    isOpen: boolean
    setOpen: (value: boolean) => void
}

const createUrlFormSchema = z.object({
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

type CreateUrlFormData = z.infer<typeof createUrlFormSchema>

function generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function CreateUrlDialog({ isOpen, setOpen }: CreateUrlDialogProps) {
    const dispatch = useAppDispatch()
    const { isUrlsLoading, error } = useAppSelector(state => state.admin)

    const form = useForm<CreateUrlFormData>({
        resolver: zodResolver(createUrlFormSchema),
        defaultValues: {
            originalUrl: '',
            shortCode: '',
            userId: ''
        }
    })

    const onSubmit = async (data: CreateUrlFormData) => {
        try {
            await dispatch(createAdminUrl(data)).unwrap()
            toast.success('URL created successfully')
            setOpen(false)
            form.reset()
        } catch (err: any) {
            console.error('URL creation failed:', err)
            toast.error(err || 'Failed to create URL')
        }
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            form.reset()
            dispatch(clearErrors())
        }
    }

    const handleGenerateCode = () => {
        const code = generateShortCode()
        form.setValue('shortCode', code, { shouldValidate: true, shouldDirty: true })
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form id="create-url-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Create new URL</DialogTitle>
                        <DialogDescription>
                            Create a shortened URL assigned to a specific user.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Controller
                            name="originalUrl"
                            control={form.control}
                            disabled={isUrlsLoading}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="create-original-url">
                                        Original URL
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="create-original-url"
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
                                    <FieldLabel htmlFor="create-short-code">
                                        Short Code
                                    </FieldLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            {...field}
                                            id="create-short-code"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="custom-code"
                                            type="text"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGenerateCode}
                                            title="Generate random code"
                                            disabled={isUrlsLoading}
                                        >
                                            <SparklesIcon className="size-4" />
                                            <span>Generate</span>
                                        </Button>
                                    </div>
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
                        <Button type="submit" form="create-url-form" disabled={isUrlsLoading}>
                            Create URL
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
