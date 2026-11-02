import { UserSearch, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export interface UserTableToolbarProps {
    search: string
    rowsPerPage: number
    onSearch: (search: string) => void
    onRowsPerPageChange: (rowsPerPage: number) => void
    onApplyFilters: () => void
}

export function UserTableToolbar({ search, rowsPerPage, onSearch, onRowsPerPageChange, onApplyFilters }: UserTableToolbarProps) {
    return (
        <div className='flex gap-4 p-6 max-sm:flex-col sm:items-center sm:justify-between'>
            <div className='w-full max-w-2xs'>
                <Label htmlFor='search-user' className='sr-only'>
                    Search User
                </Label>
                <InputGroup>
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                        id='search-user'
                        value={search}
                        onChange={event => onSearch(event.target.value)}
                        placeholder='Search user'
                        type='text'
                    />
                </InputGroup>
            </div>

            <div className='flex flex-wrap items-center gap-2 sm:justify-between'>
                <div className='flex items-center gap-2'>
                    <Label htmlFor='rows-per-page' className='sr-only'>
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
                        <SelectTrigger id='rows-per-page' className='w-fit whitespace-nowrap'>
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
                
                <Button onClick={onApplyFilters}>
                    <UserSearch />
                    <span className='max-lg:hidden'>Apply filers</span>
                </Button>
            </div>
        </div>
    )
}