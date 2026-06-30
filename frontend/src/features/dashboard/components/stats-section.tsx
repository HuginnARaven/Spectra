import * as React from "react"
import {MetricCardItem} from "./metric-card-item"
import {useAppDispatch, useAppSelector} from "@/app/hooks"
import {fetchTrendAnalytics} from "@/features/dashboard/dashboardSlice"
import {Skeleton} from "@/components/ui/skeleton.tsx";


export function StatsSection() {
    const dispatch = useAppDispatch()
    const {trendAnalytics, isTrendAnalyticsLoading} = useAppSelector((state) => state.dashboard)
    React.useEffect(() => {
        dispatch(fetchTrendAnalytics())
    }, [dispatch])

    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {isTrendAnalyticsLoading ? <>{Array.from({length: 4}).map((_, index) => (
                    <Skeleton key={index} className="h-46 w-full rounded-xl dark:bg-card"/>
                ))}</> :
                <>
                    <MetricCardItem
                        title="Visits"
                        items={[{ name: "Total", ...trendAnalytics.visits }]}
                        bottomText="Comparison between current and previous 30 days"
                    />

                    <MetricCardItem
                        title="Top Devices"
                        items={trendAnalytics.devices}
                        bottomText="Most visits from this device"
                    />
                    
                    <MetricCardItem
                        title="Top Countries"
                        items={trendAnalytics.countries}
                        bottomText="Most visits from this country"
                    />

                    <MetricCardItem
                        title="Top Referrers"
                        items={trendAnalytics.referrers}
                        bottomText="Most visits from this referrer"
                    />

                </>

            }
        </div>
    )
}
