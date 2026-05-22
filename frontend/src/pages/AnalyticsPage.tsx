import { useState } from "react";
import { AnalyticsHeader } from "../features/analytics/components/analytics-header";
import { VisitsTable } from "../features/analytics/components/visits-table";
import {Tabs, TabsContent} from "@/components/ui/tabs";

import {AnalyticsChartsTab} from "@/features/analytics/components/analytics-charts-tab.tsx";

const AnalyticsPage = () => {
    const [selectedUrl, setSelectedUrl] = useState<string>("");
    
    return (
        <Tabs className="flex flex-1 flex-col h-full min-h-0 gap-4 p-4 pt-0 w-full" defaultValue="charts">
                <AnalyticsHeader
                    selectedUrl={selectedUrl}
                    onUrlChange={setSelectedUrl}
                />
                <TabsContent value="charts" className="flex-1 flex flex-col gap-4 min-h-0 m-0">
                    <AnalyticsChartsTab/>
                </TabsContent>
                <TabsContent value="visits" className="flex-1 flex flex-col min-h-0 m-0 overflow-y-auto">
                    <VisitsTable />
                </TabsContent>
        </Tabs>
    );
};

export default AnalyticsPage;