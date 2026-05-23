import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CreateUrlForm } from "../features/urls/components/create-url-form";
import { UrlsTable } from "../features/urls/components/urls-table";

export default function UrlManagementPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">

            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center justify-between">
                    <Input
                        placeholder="Filter links..."
                        className="w-37.5 lg:w-62.5"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Link
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <UrlsTable />
            </div>

            <CreateUrlForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
    )
}
