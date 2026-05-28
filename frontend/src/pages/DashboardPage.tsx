import data from "../app/dashboard/visitsData.json"
import { DataTable } from "../features/dashboard/components/data-table"
import { StatsSection } from "../features/dashboard/components/stats-section"
import {TotalVisitsBarChart} from "@/features/dashboard/components/total-visits-bar-chart.tsx";

export default function DashboardPage() {
    return (
        <div className="@container/main flex flex-1 flex-col h-full min-h-0 gap-2 w-full mt-2">
            <div className="flex-1 flex flex-col gap-4 min-h-0 m-0">
                <StatsSection />
                <div className="px-4 lg:px-6 flex flex-col h-full min-h-95 overflow-hidden">
                    <TotalVisitsBarChart />
                </div>
                <div className="flex flex-col h-full min-h-95 overflow-hidden">
                    <DataTable data={data} />
                </div>
                
            </div>
        </div>
    )
}
