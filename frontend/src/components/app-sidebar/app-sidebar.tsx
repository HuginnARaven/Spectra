import * as React from "react"
import { IconChartBar, IconDashboard, IconHelp, IconListDetails, IconPaywall, IconSettings, } from "@tabler/icons-react"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"
import { Pyramid, Wrench} from "lucide-react"
import { Link, useLocation } from "react-router"
import {useIsAdmin} from "@/hooks/use-is-admin.ts";

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
                title: "Url management",
                url: "url-management",
                icon: IconListDetails,
                isActive: useLocation().pathname === `/url-management` ? true : false
            },
            {
                title: "Analytics",
                url: "analytics",
                icon: IconChartBar,
                isActive: useLocation().pathname === `/analytics` ? true : false
            },
            {
                title: "Admin tools",
                url: "admin",
                icon: Wrench,
                isHidden: !useIsAdmin(),
                items: [
                    {
                        title: "Users",
                        url: "users",
                        isActive: useLocation().pathname === `/admin/users` ? true : false,
                    },
                    {
                        title: "Urls",
                        url: "urls",
                        isActive: useLocation().pathname === `/admin/urls` ? true : false,
                    },
                    {
                        title: "Subscription plans",
                        url: "subscription-plans",
                        isActive: useLocation().pathname === `/admin/subscription-plans` ? true : false,
                    },
                ],
            }
        ],
        navSecondary: [
            {
                title: "Settings",
                url: "#",
                icon: IconSettings,
                isActive: useLocation().pathname === `/settings` ? true : false
            },
            {
                title: "Get Help",
                url: "#",
                icon: IconHelp,
                isActive: useLocation().pathname === `/help` ? true : false
            },
            {
                title: "Pricing",
                url: "pricing",
                icon: IconPaywall,
                isActive: useLocation().pathname === `/pricing` ? true : false
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
