import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createUrl } from "../urlsSlice";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateUrlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUrlForm({ open, onOpenChange }: CreateUrlDialogProps) {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.urls);
    const [originalUrl, setOriginalUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!originalUrl.trim()) {
            setError("URL is required");
            return;
        }

        try {
            await dispatch(createUrl(originalUrl)).unwrap();
            toast.success("Short URL created successfully");
            setOriginalUrl("");
            onOpenChange(false);
        } catch (err: any) {
            setError(err || "Failed to create short URL");
            toast.error(err || "Failed to create short URL");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Short URL</DialogTitle>
                        <DialogDescription>
                            Paste your long URL below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="originalUrl" className="text-right">
                                Long URL
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="originalUrl"
                                    placeholder="https://example.com/very/long/path"
                                    value={originalUrl}
                                    onChange={(e) => setOriginalUrl(e.target.value)}
                                />
                                {error && (
                                    <p className="text-sm font-medium text-destructive mt-2">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
