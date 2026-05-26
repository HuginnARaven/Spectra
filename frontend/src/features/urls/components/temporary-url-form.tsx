import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
import {Field, FieldError} from "@/components/ui/field.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {createTemporaryUrl} from "@/features/urls/urlsSlice.ts";

const formSchema = z.object({
    originalUrl: z
        .url({ message: "Please enter a valid URL" }),
});

export function TemporaryUrlForm() {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.urls);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            originalUrl: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const res = await dispatch(createTemporaryUrl(data.originalUrl)).unwrap();
            toast.success("Short URL created successfully: ", {
                description: <div className="text-primary underline">{res}</div>,
                action: {
                    label: <Copy className="h-4 w-4" />,
                    onClick: () => navigator.clipboard.writeText(res)
                },
            });
            form.reset()
        } catch (err: any) {
            toast.error(err || "Failed to create short URL");
        }
    }

    return (
        <form className="flex space-x-2" id="temporary-url-form" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                name="originalUrl"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <Input
                            {...field}
                            type="url"
                            id="originalUrl"
                            aria-invalid={fieldState.invalid}
                            className="max-w-lg flex-1" 
                            placeholder="Paste your long link here..."
                            required 
                        />
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                )}
            />
            <Button type="submit" disabled={isLoading}>
                Shorten
                {isLoading ? <Spinner /> : <ArrowRight className=" h-4 w-4" /> }
            </Button>
        </form>
    );
}
