import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useAppSelector} from "@/app/hooks.ts";

interface AnalyticsHeaderProps {
    selectedUrl: string;
    onUrlChange: (val: string) => void;
}

export function AnalyticsHeader({ selectedUrl, onUrlChange }: AnalyticsHeaderProps) {
    const { urls } = useAppSelector((state) => state.urls);

    return (
        <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
                <Select value={selectedUrl} onValueChange={onUrlChange}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select a URL to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                        {urls.map((url) => (
                            <SelectItem value={url.id} key={url.id}>{url.originalUrl}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <TabsList>
                <TabsTrigger value="charts" className="text-base">Charts</TabsTrigger>
                <TabsTrigger value="visits" className="text-base">Visits</TabsTrigger>
            </TabsList>
        </div>
    );
}