import * as React from "react"
import {ChevronRight} from "lucide-react"
import {Link} from "react-router-dom"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export interface NavMainSubItem {
    title: string
    url: string
    isActive?: boolean
    isHidden?: boolean
}

export interface NavMainItem {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    isHidden?: boolean
    items?: NavMainSubItem[]
}

const buttonStyles = "border border-transparent hover:border-primary transition-colors data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground min-w-8 duration-100 ease-linear"

export function NavMain({items}: { items: NavMainItem[] }) {
    const visibleItems = items.filter((item) => !item.isHidden)

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {visibleItems.map((item) => {
                        const visibleSubItems = item.items?.filter((sub) => !sub.isHidden)
                        const hasSubItems = Boolean(visibleSubItems && visibleSubItems.length > 0)
                        const isGroupActive =
                            item.isActive || visibleSubItems?.some((sub) => sub.isActive)
                        if (hasSubItems) {
                            return (
                                <Collapsible
                                    key={item.title}
                                    defaultOpen={isGroupActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                isActive={isGroupActive}
                                                className="border border-transparent hover:border-primary transition-colors data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground min-w-8 duration-100 ease-linear"
                                            >
                                                {item.icon && <item.icon/>}
                                                <span>{item.title}</span>
                                                <ChevronRight
                                                    className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {visibleSubItems!.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            isActive={subItem.isActive}
                                                            asChild
                                                            className="border border-transparent hover:border-primary transition-colors data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground min-w-8 duration-100 ease-linear"
                                                        >
                                                            <Link to={`${item.url}/${subItem.url}`}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )
                        }
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    isActive={item.isActive}
                                    asChild
                                    className={buttonStyles}
                                >
                                    <Link to={item.url}>
                                        {item.icon && <item.icon/>}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}