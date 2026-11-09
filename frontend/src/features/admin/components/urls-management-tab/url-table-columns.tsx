import { useState, memo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    EllipsisVerticalIcon,
    ExternalLinkIcon,
    PencilIcon,
    Trash2Icon,
    CopyIcon,
    CheckIcon
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import type { AdminUrlListItem } from '@/features/admin/types'
import { DeleteUrlAlertDialog } from '@/features/admin/components/urls-management-tab/delete-url-alert-dialog'
import { EditUrlDialog } from '@/features/admin/components/urls-management-tab/edit-url-dialog'

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function format(date: Date, formatStr: string): string {
    if (isNaN(date.getTime())) return 'Invalid Date'

    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    const formatMap: Record<string, string> = {
        'dd': String(day).padStart(2, '0'),
        'd': String(day),
        'MMM': MONTHS[month],
        'MM': String(month + 1).padStart(2, '0'),
        'M': String(month + 1),
        'yyyy': String(year),
        'yy': String(year).slice(-2)
    }

    return formatStr.replace(/yyyy|yy|MMM|MM|M|dd|d/g, match => {
        return formatMap[match] || match
    })
}

const UrlRowActions = memo(function UrlRowActions({ url }: { url: AdminUrlListItem }) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    return (
        <div className="flex items-center justify-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" aria-label="Visit original URL">
                            <ExternalLinkIcon className="size-4.5" />
                        </Button>
                    </a>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Open original URL</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete URL"
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        <Trash2Icon className="size-4.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Delete</p>
                </TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Open actions">
                        <EllipsisVerticalIcon className="size-4.5" aria-hidden="true" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                            <PencilIcon className="size-4" />
                            Edit URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash2Icon className="size-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditUrlDialog url={url} isOpen={isEditOpen} setOpen={setIsEditOpen} />
            <DeleteUrlAlertDialog
                urlId={url.id}
                shortCode={url.shortCode}
                isOpen={isDeleteOpen}
                setOpen={setIsDeleteOpen}
            />
        </div>
    )
})

function ShortCodeCell({ shortCode }: { shortCode: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(shortCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
                {shortCode}
            </Badge>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCopy}
                        aria-label="Copy short code"
                    >
                        {copied ? <CheckIcon className="size-3.5 text-green-500" /> : <CopyIcon className="size-3.5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy code'}</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

export const urlTableColumns: ColumnDef<AdminUrlListItem>[] = [
    {
        id: 'shortCode',
        header: 'Short Code',
        accessorKey: 'shortCode',
        cell: ({ row }) => <ShortCodeCell shortCode={row.original.shortCode} />,
        size: 180,
        enableSorting: true
    },
    {
        id: 'originalUrl',
        header: 'Original URL',
        accessorKey: 'originalUrl',
        cell: ({ row }) => (
            <div className="max-w-md truncate" title={row.original.originalUrl}>
                <a
                    href={row.original.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline"
                >
                    {row.original.originalUrl}
                </a>
            </div>
        ),
        size: 380,
        enableSorting: true
    },
    {
        id: 'userId',
        header: 'User ID',
        accessorKey: 'userId',
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block" title={row.original.userId}>
                {row.original.userId}
            </span>
        ),
        size: 220,
        enableSorting: false
    },
    {
        id: 'createdAt',
        header: 'Created Date',
        accessorKey: 'createdAt',
        cell: ({ row }) => <span>{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</span>,
        size: 150,
        enableSorting: true
    },
    {
        id: 'updatedAt',
        header: 'Updated Date',
        accessorKey: 'updatedAt',
        cell: ({ row }) => <span>{format(new Date(row.original.updatedAt), 'dd MMM yyyy')}</span>,
        size: 150,
        enableSorting: true
    },
    {
        id: 'actions',
        header: () => 'Actions',
        cell: ({ row }) => <UrlRowActions url={row.original} />,
        size: 120,
        enableHiding: false,
        enableSorting: false
    }
]
