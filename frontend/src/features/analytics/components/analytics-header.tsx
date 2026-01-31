import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AnalyticsHeaderProps {
    selectedUrl: string;
    onUrlChange: (val: string) => void;
}

export function AnalyticsHeader({ selectedUrl, onUrlChange }: AnalyticsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
                <Select value={selectedUrl} onValueChange={onUrlChange}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select a URL to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">spectra.app/dashboard</SelectItem>
                        <SelectItem value="2">spectra.app/pricing</SelectItem>
                        <SelectItem value="3">google.com/promo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}