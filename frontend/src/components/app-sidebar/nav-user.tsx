import {
    IconDotsVertical,
} from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar"
import {useAppSelector} from "@/app/hooks"
import {ProfileMenu} from "@/features/account/components/profile-menu.tsx";

export function NavUser() {
    const {isMobile} = useSidebar();
    const {user} = useAppSelector((state) => state.account);
    const avatar = 'https://static.vecteezy.com/system/resources/thumbnails/063/477/529/small/neutral-gray-silhouette-of-male-avatar-defoult-photo-placeholder-with-short-hair-for-anonymous-profile-picture-with-minimalist-style-suitable-for-various-social-media-platforms-and-websites-vector.jpg'

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <ProfileMenu isMobile={isMobile}>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar className="h-8 w-8 rounded-lg grayscale">
                            <AvatarImage src={avatar} alt={user?.username}/>
                            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user?.username}</span>
                            <span className="text-muted-foreground truncate text-xs">
                                    {user?.email}
                                </span>
                        </div>
                        <IconDotsVertical className="ml-auto size-4"/>
                    </SidebarMenuButton>
                </ProfileMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
