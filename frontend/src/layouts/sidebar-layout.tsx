import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

import { Outlet } from "react-router-dom"
import { AppSidebar } from "../components/app-sidebar/app-sidebar"
import { useAppSelector } from "../app/hooks";

export default function SidebarLayout() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            {isAuthenticated ? (<AppSidebar variant="inset" />) : (<></>)}
            <SidebarInset>
                <SiteHeader />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
