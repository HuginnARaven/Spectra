import { SearchIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export interface UrlTableToolbarProps {
    search: string
    rowsPerPage: number
    onSearch: (search: string) => void
    onRowsPerPageChange: (rowsPerPage: number) => void
    onCreateUrl: () => void
}

export function UrlTableToolbar({
    search,
    rowsPerPage,
    onSearch,
    onRowsPerPageChange,
    onCreateUrl
}: UrlTableToolbarProps) {
    return (
        <div className="flex gap-4 p-6 max-sm:flex-col sm:items-center sm:justify-between">
            <div className="w-full max-w-2xs">
                <Label htmlFor="search-url" className="sr-only">
                    Search URL
                </Label>
                <InputGroup>
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                        id="search-url"
                        value={search}
                        onChange={event => onSearch(event.target.value)}
                        placeholder="Search URLs..."
                        type="text"
                    />
                </InputGroup>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                <div className="flex items-center gap-2">
                    <Label htmlFor="url-rows-per-page" className="sr-only">
                        Show
                    </Label>
                    <Select
                        value={String(rowsPerPage)}
                        onValueChange={(value: string | null) => {
                            if (value) {
                                onRowsPerPageChange(Number(value))
                            }
                        }}
                    >
                        <SelectTrigger id="url-rows-per-page" className="w-fit whitespace-nowrap">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {ROWS_PER_PAGE_OPTIONS.map(option => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={onCreateUrl}>
                    <PlusIcon className="size-4" />
                    <span>Create URL</span>
                </Button>
            </div>
        </div>
    )
}
