import {VisitsLineChart} from "./visits-line-chart";
import {CountryBarChart} from "./country-bar-chart";
import {DeviceRadarChart} from "./device-radar-chart";
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {fetchUrlAnalytics} from "@/features/analytics/analyticsSlice.ts";
import { Loader2 } from "lucide-react";
import { useSearchParams } from 'react-router-dom';
import { useEffect } from "react";

export function AnalyticsChartsTab() {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.analytics);
    const [searchParams] = useSearchParams();
    const urlId = searchParams.get('urlId') || '';

    useEffect(() => {
        if (urlId) {
            dispatch(fetchUrlAnalytics(urlId));
        }
    }, [dispatch, urlId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-destructive py-10">
                Error loading visits: {error}
            </div>
        );
    }
    
    return (
        <>
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
        </>
    );
}