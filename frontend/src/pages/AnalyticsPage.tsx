import { useEffect, useState } from "react";
import { AnalyticsHeader } from "../features/analytics/components/analytics-header";
import { VisitsTable } from "../features/analytics/components/visits-table";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {AnalyticsChartsTab} from "@/features/analytics/components/analytics-charts-tab.tsx";
import {useAppDispatch, useAppSelector} from "@/app/hooks.ts";
import {fetchUrls} from "@/features/urls/urlsSlice.ts";
import { useSearchParams } from 'react-router-dom';

const AnalyticsPage = () => {
    const dispatch = useAppDispatch();
    const [selectedUrl, setSelectedUrl] = useState<string>("");
    const [searchParams, setSearchParams] = useSearchParams();
    const { urls, isLoading } = useAppSelector((state) => state.urls);

    const selectUrl = (id: string) =>{
        setSelectedUrl(id);
        setSearchParams({ urlId: id })
    }

    useEffect(() => {
        if (urls.length <= 0) {
            dispatch(fetchUrls());
        }
    }, [dispatch, urls.length]);

    useEffect(() => {
        if (!isLoading && urls.length > 0) {
            const urlId = searchParams.get('urlId');

            if (!urlId) {
                selectUrl(urls[0].id);
            } else if (selectedUrl !== urlId) {
                setSelectedUrl(urlId);
            }
        }
    }, [urls, isLoading, searchParams, selectedUrl]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Tabs className="flex flex-1 flex-col h-full min-h-0 gap-4 p-4 pt-0 w-full" defaultValue="charts">
                <AnalyticsHeader
                    selectedUrl={selectedUrl}
                    onUrlChange={selectUrl}
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