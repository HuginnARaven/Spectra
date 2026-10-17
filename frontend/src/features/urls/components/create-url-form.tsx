import { Button } from "@/components/ui/button";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createUrl } from "../urlsSlice";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import {useUrlLimits} from "@/hooks/use-url-limits.ts";

interface CreateUrlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    originalUrl: z.string().url("Please enter a valid URL"),
    customCode: z
        .string()
        .regex(/^[a-zA-Z0-9]+$/, "Custom code contains invalid characters")
        .length(7, { message: "Custom code should be exactly 7 characters long" })
        .nullable(),
});

export function CreateUrlForm({ open, onOpenChange }: CreateUrlDialogProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading } = useAppSelector((state) => state.urls);
    const { user, isLimitReached, currentCount, maxLimit, planName } = useUrlLimits();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            originalUrl: "",
            customCode: null,
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (isLimitReached) {
            toast.error("You have reached the limit of created URLs for your plan. Please upgrade.");
            return;
        }

        try {
            await dispatch(createUrl(data)).unwrap();
            toast.success("Short URL created successfully");
            handleOpenChange(false);
        } catch (err: any) {
            toast.error(err || "Failed to create short URL");
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="create-url-form">
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Short URL</DialogTitle>
                        <DialogDescription>
                            Paste your long URL below.
                        </DialogDescription>
                    </DialogHeader>
                    {isLimitReached && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Subscription Limit Reached</AlertTitle>
                            <AlertDescription className="space-y-2">
                                <p>
                                    You have reached your limit of {maxLimit} URLs on the <strong>{planName}</strong> plan ({currentCount}/{maxLimit} used).
                                </p>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => {
                                        handleOpenChange(false);
                                        navigate("/pricing");
                                    }}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" /> Upgrade Subscription
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    <FieldGroup>
                        <Controller
                            name="originalUrl"
                            control={form.control}
                            disabled={isLoading || isLimitReached}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="originalUrl">
                                        Long URL
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="originalUrl"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="https://example.com/very/long/path"
                                        required
                                        disabled={isLoading || isLimitReached}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="customCode"
                            control={form.control}
                            disabled={isLoading || isLimitReached || !user?.subscriptionPlan?.hasCustomAliasAccess}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="customCode">Custom code (optional)</FieldLabel>
                                        {!user?.subscriptionPlan?.hasCustomAliasAccess && (
                                            <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                                                🔒 Your plan doesn't support this
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value || null)}
                                        id="customCode"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="example"
                                        disabled={isLoading || isLimitReached || !user?.subscriptionPlan?.hasCustomAliasAccess}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            form="create-url-form"
                            type="submit"
                            disabled={isLoading || isLimitReached}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}