import { useState } from "react";
import { AnalyticsHeader } from "../features/analytics/components/analytics-header";
import { CountryBarChart } from "../features/analytics/components/country-bar-chart";
import { DeviceRadarChart } from "../features/analytics/components/device-radar-chart";
import { VisitsLineChart } from "../features/analytics/components/visits-line-chart";
import { VisitsTable } from "../features/analytics/components/visits-table";
import {Tabs, TabsContent} from "@/components/ui/tabs";


const AnalyticsPage = () => {
    const [selectedUrl, setSelectedUrl] = useState<string>("");

    return (
        <Tabs className="flex flex-1 flex-col h-full min-h-0 gap-4 p-4 pt-0 w-full" defaultValue="charts">
                <AnalyticsHeader
                    selectedUrl={selectedUrl}
                    onUrlChange={setSelectedUrl}
                />
                <TabsContent value="charts" className="flex-1 flex flex-col gap-4 min-h-0 m-0">
                    <div className="flex-1 min-h-25 md:min-h-0">
                        <VisitsLineChart />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 flex-1 min-h-0">
                        <div className="col-span-3 min-h-75 md:min-h-0h-full">
                            <CountryBarChart />
                        </div>
                        <div className="col-span-3 min-h-75 md:min-h-0 h-full">
                            <DeviceRadarChart />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="visits" className="flex-1 flex flex-col min-h-0 m-0 overflow-y-auto">
                    <VisitsTable />
                </TabsContent>
        </Tabs>
    );
};

export default AnalyticsPage;