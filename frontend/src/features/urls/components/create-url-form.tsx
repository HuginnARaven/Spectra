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

interface CreateUrlDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateUrlForm({ open, onOpenChange }: CreateUrlDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
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
                        <Input
                            id="originalUrl"
                            placeholder="https://example.com/very/long/path"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Create Link</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}