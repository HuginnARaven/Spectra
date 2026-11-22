import { SearchIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatIntervalLabel } from '@/features/pricing/utils'

export interface PlansToolbarProps {
    search: string
    availableIntervals: string[]
    selectedInterval: string
    onSearch: (search: string) => void
    onIntervalChange: (interval: string) => void
    onCreatePlan: () => void
}

export function PlansToolbar({
    search,
    availableIntervals,
    selectedInterval,
    onSearch,
    onIntervalChange,
    onCreatePlan,
}: PlansToolbarProps) {
    return (
        <div className="flex flex-wrap gap-4 border-b p-6 max-sm:flex-col sm:items-center sm:justify-between">
            <div className="w-full max-w-2xs">
                <Label htmlFor="search-plan" className="sr-only">
                    Search Plan
                </Label>
                <InputGroup>
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                        id="search-plan"
                        value={search}
                        onChange={event => onSearch(event.target.value)}
                        placeholder="Search plans..."
                        type="text"
                    />
                </InputGroup>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-between">
                {availableIntervals.length > 0 && (
                    <Tabs value={selectedInterval} onValueChange={onIntervalChange}>
                        <TabsList>
                            {availableIntervals.map(interval => (
                                <TabsTrigger
                                    key={interval}
                                    value={interval}
                                    className="px-4 capitalize"
                                >
                                    {interval.toLowerCase() === 'all'
                                        ? 'All'
                                        : formatIntervalLabel(interval)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                )}

                <Button onClick={onCreatePlan}>
                    <PlusIcon className="size-4" />
                    <span>Create Plan</span>
                </Button>
            </div>
        </div>
    )
}
