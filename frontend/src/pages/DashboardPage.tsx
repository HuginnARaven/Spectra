import { DataTable } from "../features/dashboard/components/data-table"
import { StatsSection } from "../features/dashboard/components/stats-section"
import {TotalVisitsBarChart} from "@/features/dashboard/components/total-visits-bar-chart.tsx";
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {loadUser} from "@/features/account/accountSlice.ts";
import {useEffect} from "react"
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.account);

    useEffect(() => {
        if (!user) {
            dispatch(loadUser());
        }
    }, [user, dispatch]);
    
    return (
        <div className="@container/main flex flex-1 flex-col h-full min-h-0 gap-2 w-full mt-2">
            <div className="flex-1 flex flex-col gap-4 min-h-0 m-0">
                {user?.subscriptionPlan?.hasAccessToGeneralAnalytics ? 
                    <>
                        <StatsSection />
                        <div className="px-4 lg:px-6 flex flex-col h-full min-h-95 overflow-hidden">
                            <TotalVisitsBarChart />
                        </div>
                    </>
                    :
                    <>
                        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                            {Array.from({length: 4}).map((_, index) => (
                                <Tooltip key={index}>
                                    <TooltipTrigger>
                                        <Skeleton className="flex h-46 w-full items-center justify-center rounded-xl dark:bg-card">Trend analytics is unavailable in your plan</Skeleton>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Trend analytics is unavailable in your subscription plan. Consider investing in better one.</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                        <div className="px-4 lg:px-6 flex flex-col h-full min-h-95 overflow-hidden">
                            <Skeleton className="flex flex-col h-full items-center justify-center rounded-xl dark:bg-card">
                                Visits chart is unavailable in your subscription plan. Consider investing in better one.
                            </Skeleton>
                        </div>
                    </>
                }
                <div className="flex flex-col h-full min-h-95 overflow-hidden">
                    <DataTable />
                </div>
            </div>
        </div>
    )
}
