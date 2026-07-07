import {
    IconCreditCard,
    IconLogout,
    IconNotification,
} from "@tabler/icons-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useAppDispatch, useAppSelector} from "@/app/hooks"
import {loadUser} from "@/features/account/accountSlice.ts"
import {AccountEditForm} from "@/features/account/components/account-edit-form.tsx";
import {logout} from "@/features/auth/authSlice.ts";
import type {ReactNode} from "react"
import {useEffect, useState} from "react"
import {IconUserCircle} from "@tabler/icons-react"


export function ProfileMenu({children, isMobile}: { children: ReactNode, isMobile: boolean }) {
    const dispatch = useAppDispatch();
    const {user} = useAppSelector((state) => state.account);
    const [isProfileEditFormOpen, setIsProfileEditFormOpen] = useState(false);
    
    const avatar = 'https://static.vecteezy.com/system/resources/thumbnails/063/477/529/small/neutral-gray-silhouette-of-male-avatar-defoult-photo-placeholder-with-short-hair-for-anonymous-profile-picture-with-minimalist-style-suitable-for-various-social-media-platforms-and-websites-vector.jpg'

    useEffect(() => {
        if (!user) {
            dispatch(loadUser());
        }
    }, [user, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
    };
    
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={avatar} alt={user?.username}/>
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.username}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                        {user?.email}
                                    </span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => { setIsProfileEditFormOpen(true)}}
                            className="flex items-center gap-2 cursor-pointer w-full"
                        >
                            <IconUserCircle/>
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <IconCreditCard/>
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <IconNotification/>
                            Notifications
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={handleLogout}>
                        <IconLogout/>
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AccountEditForm isOpen={isProfileEditFormOpen} setOpen={setIsProfileEditFormOpen}/>
        </>
    )
}
