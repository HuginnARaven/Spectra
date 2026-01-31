import { useState } from "react";
import { AnalyticsHeader } from "../features/analytics/components/analytics-header";
import { CountryBarChart } from "../features/analytics/components/country-bar-chart";
import { DeviceRadarChart } from "../features/analytics/components/device-radar-chart";
import { VisitsLineChart } from "../features/analytics/components/visits-line-chart";
import { VisitsTable } from "../features/analytics/components/visits-table";


const AnalyticsPage = () => {
    const [selectedUrl, setSelectedUrl] = useState<string>("");

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <AnalyticsHeader
                selectedUrl={selectedUrl}
                onUrlChange={setSelectedUrl}
            />
            <div className="space-y-4">
                <VisitsLineChart />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <div className="col-span-3">
                        <CountryBarChart />
                    </div>
                    <div className="col-span-3">
                        <DeviceRadarChart />
                    </div>
                </div>
                <VisitsTable />
            </div>
        </div>
    );
};

export default AnalyticsPage;