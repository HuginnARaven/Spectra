import { MoreHorizontal, Trash, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/app/hooks";
import { deleteUrl } from "../urlsSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function UrlActionsMenu({ urlId }: { urlId: string }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await dispatch(deleteUrl(urlId)).unwrap();
            toast.success("URL deleted successfully");
        } catch (error: any) {
            toast.error(error || "Failed to delete URL");
        }
    };

    const handleAnalytics = () => {
        navigate(`/analytics?urlId=${urlId}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={handleAnalytics}
                >
                    <BarChart className="mr-2 h-4 w-4" /> Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={handleDelete}
                >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
