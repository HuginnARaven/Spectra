import * as React from "react"
import { IconChartBar, IconDashboard, IconHelp, IconListDetails, IconSearch, IconSettings, } from "@tabler/icons-react"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"
import { Pyramid } from "lucide-react"
import { Link, useLocation } from "react-router"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const data = {
        navMain: [
            {
                title: "Dashboard",
                url: "dashboard",
                icon: IconDashboard,
                isActive: useLocation().pathname === `/dashboard` ? true : false
            },
            {
                title: "Url managament",
                url: "url-managament",
                icon: IconListDetails,
                isActive: useLocation().pathname === `/url-managament` ? true : false
            },
            {
                title: "Analytics",
                url: "analytics",
                icon: IconChartBar,
                isActive: useLocation().pathname === `/analytics` ? true : false
            }
        ],
        navSecondary: [
            {
                title: "Settings",
                url: "#",
                icon: IconSettings,
            },
            {
                title: "Get Help",
                url: "#",
                icon: IconHelp,
            },
            {
                title: "Search",
                url: "#",
                icon: IconSearch,
            },
        ],
    }
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link to="/">
                                <Pyramid className="!size-5" />
                                <span className="text-base font-semibold">Specra Inc.</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
