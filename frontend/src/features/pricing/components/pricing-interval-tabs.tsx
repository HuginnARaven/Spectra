import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {formatIntervalLabel} from "../utils"

interface PricingIntervalTabsProps {
    availableIntervals: string[]
    selectedInterval: string
    onIntervalChange: (interval: string) => void
}

export function PricingIntervalTabs({ availableIntervals, selectedInterval, onIntervalChange }: PricingIntervalTabsProps) {
    if (availableIntervals.length === 0) {
        return null
    }

    return (
        <div className="mt-3 mb-6">
            <Tabs value={selectedInterval} onValueChange={onIntervalChange}>
                <TabsList>
                    {availableIntervals.map((interval) => (
                        <TabsTrigger
                            key={interval}
                            value={interval}
                            className="px-5 capitalize"
                        >
                            {formatIntervalLabel(interval)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    )
}
