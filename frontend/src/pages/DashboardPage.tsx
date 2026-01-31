import data from "../app/dashboard/visitsData.json"
import { ChartAreaInteractive } from "../features/dashboard/components/chart-area-interactive"
import { DataTable } from "../features/dashboard/components/data-table"
import { StatsSection } from "../features/dashboard/components/stats-section"

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <StatsSection />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive />
                    </div>
                    <DataTable data={data} />
                </div>
            </div>
        </div>
    )
}
