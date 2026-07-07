import {type Icon} from "@tabler/icons-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Link} from "react-router-dom"

export function NavMain({
                            items,
                        }: {
    items: {
        title: string
        url: string
        icon?: Icon
        isActive: boolean
    }[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title} isActive={item.isActive} asChild className="border border-transparent hover:border-primary transition-colors data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground min-w-8 duration-100 ease-linear">
                                <Link to={item.url}>
                                    {item.icon && <item.icon/>}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
