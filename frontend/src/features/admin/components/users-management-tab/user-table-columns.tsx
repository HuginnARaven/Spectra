import type { ColumnDef } from '@tanstack/react-table'
import {
    EllipsisVerticalIcon,
    EyeIcon,
    PencilIcon,
    Trash2Icon,
    UserCheckIcon,
    UserXIcon,
    CircleCheck,
    CircleX,
} from 'lucide-react'
import { Avatar, AvatarFallback} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from "react-router-dom"
import type {AdminUserListItem} from "@/features/admin/types.ts";
import {Badge} from "@/components/ui/badge.tsx";
import { memo } from 'react'
import {DeleteUserAlertDialog} from "@/features/admin/components/users-management-tab/delete-user-alert-dialog.tsx";

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function format(date: Date, formatStr: string): string {
    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const formatMap: Record<string, string> = {
        'dd': String(day).padStart(2, '0'),
        'd': String(day),
        'MMM': MONTHS[month],
        'MM': String(month + 1).padStart(2, '0'),
        'M': String(month + 1),
        'yyyy': String(year),
        'yy': String(year).slice(-2)
    };
    
    return formatStr.replace(/yyyy|yy|MMM|MM|M|dd|d/g, (match) => {
        return formatMap[match] || match;
    });
}

const getInitialsFromName = (name: string) => {
    return name
        .split(' ')
        .map(namePart => namePart[0])
        .join('')
}

const UserRowActions = memo(function UserRowActions({ user }: { user: AdminUserListItem }) {
    return (
        <div className='flex items-center justify-center gap-1'>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link to='/apps/users/view' >
                        <Button variant='ghost' size='icon' aria-label='View user'>
                            <EyeIcon className='size-4.5' />
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>View</p>
                </TooltipContent>
            </Tooltip>

            <DeleteUserAlertDialog userId={user.id} userName={user.userName} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost' aria-label='Open actions'>
                        <EllipsisVerticalIcon className='size-4.5' aria-hidden='true' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <PencilIcon className='size-4' />
                            Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/*{user.status !== 'Suspended' ? (*/}
                        {user.emailConfirmed ? (
                            <DropdownMenuItem>
                                <UserXIcon className='size-4' />
                                Suspend
                            </DropdownMenuItem>
                        ) : null}
                        {/*{user.status !== 'Active' ? (*/}
                        {!user.emailConfirmed ? (
                            <DropdownMenuItem>
                                <UserCheckIcon className='size-4' />
                                Activate
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant='destructive'>
                            <Trash2Icon className='size-4' />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
})

export const userTableColumns: ColumnDef<AdminUserListItem>[] = [
    {
        id: 'user',
        header: 'User',
        accessorKey: 'name',
        cell: ({ row }) => (
            <div className='flex items-center gap-2'>
                <Avatar className='size-9'>
                    {/*{row.original.avatar ? <AvatarImage src={row.original.avatar} alt={row.original.userName} /> : null}*/}
                    <AvatarFallback className='text-xs'>{getInitialsFromName(row.original.userName)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                    <span className='font-medium'>{row.original.userName}</span>
                    <span className='text-muted-foreground'>{row.original.email}</span>
                </div>
            </div>
        ),
        size: 360,
        enableSorting: true
    },
    {
        id: 'displayName',
        header: 'Display Name',
        accessorKey: 'role',
        cell: ({ row }) => {
            return (
                <div className='flex items-center gap-2'>
                    <span>{row.original.displayName}</span>
                </div>
            )
        },
        enableSorting: true
    },
    {
        id: 'emailConfirmed',
        header: 'Email Confirmation',
        accessorKey: 'emailConfirmed',
        cell: ({ row }) => {
            return (
                <div className='flex items-center gap-2'>
                    {row.original.emailConfirmed ?
                        <Badge className="h-auto rounded-sm border-none capitalize focus-visible:outline-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
                            <CircleCheck/>
                            Confirmed
                        </Badge>
                        :
                        <Badge className="h-auto rounded-sm border-none capitalize focus-visible:outline-none bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive">
                            <CircleX/>
                            Unconfirmed
                        </Badge>
                    }
                </div>
            )
        },
        enableSorting: true
    },
    {
        id: 'joinedDate',
        header: 'Joined Date',
        accessorKey: 'joinedDate',
        cell: ({ row }) => <span>{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</span>,
        enableSorting: true
    },
    {
        id: 'lastActive',
        header: 'Last Active',
        accessorKey: 'lastActive',
        cell: ({ row }) => <span>{format(new Date(row.original.lastActive), 'dd MMM yyyy')}</span>,
        enableSorting: true
    },
    {
        id: 'refreshTokenExpiryTime',
        header: 'Token Expiry',
        accessorKey: 'refreshTokenExpiryTime',
        cell: ({ row }) => <span>{format(new Date(row.original.refreshTokenExpiryTime), 'dd MMM yyyy')}</span>,
        enableSorting: true
    },
    {
        id: 'actions',
        header: () => 'Actions',
        cell: ({ row }) => <UserRowActions user={row.original} />,
        size: 120,
        enableHiding: false,
        enableSorting: false
    }
]