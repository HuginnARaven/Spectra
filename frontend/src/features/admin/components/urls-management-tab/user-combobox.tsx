import { useState, useEffect, useCallback } from 'react'
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty
} from '@/components/ui/combobox'
import { Spinner } from '@/components/ui/spinner'
import adminApi from '@/features/admin/adminApi'

export interface UserOption {
    value: string
    label: string
    userName: string
    email: string
}

export interface UserComboboxProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
}

export function UserCombobox({ value, onChange, disabled, placeholder = 'Search and select user...' }: UserComboboxProps) {
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState<UserOption[]>([])
    const [selectedOption, setSelectedOption] = useState<UserOption | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Load initial user details if value is provided and not already in options
    useEffect(() => {
        if (!value) {
            setSelectedOption(null)
            return
        }

        const existing = options.find(o => o.value === value)
        if (existing) {
            setSelectedOption(existing)
            return
        }

        let isMounted = true
        adminApi.getUserById(value)
            .then(user => {
                if (isMounted && user) {
                    const opt: UserOption = {
                        value: user.id,
                        label: `${user.userName} (${user.email})`,
                        userName: user.userName,
                        email: user.email
                    }
                    setSelectedOption(opt)
                    setOptions(prev => {
                        if (prev.some(p => p.value === opt.value)) return prev
                        return [opt, ...prev]
                    })
                }
            })
            .catch(() => {
                // If fetching by id fails (e.g. invalid or deleted user), fallback to displaying the id
                if (isMounted) {
                    setSelectedOption({
                        value,
                        label: value,
                        userName: value,
                        email: ''
                    })
                }
            })

        return () => {
            isMounted = false
        }
    }, [value, options])

    // Fetch users based on search query with debouncing — only when something is typed
    useEffect(() => {
        const trimmed = search.trim()
        if (!trimmed) {
            // Clear results when search is empty (user cleared input)
            if (hasSearched) {
                setOptions(selectedOption ? [selectedOption] : [])
                setHasSearched(false)
            }
            return
        }

        setIsLoading(true)
        const timer = setTimeout(async () => {
            try {
                const result = await adminApi.getUsers({
                    search: trimmed,
                    pageNumber: 1,
                    pageSize: 20
                })

                const newOptions: UserOption[] = result.items.map(u => ({
                    value: u.id,
                    label: `${u.userName} (${u.email})`,
                    userName: u.userName,
                    email: u.email
                }))

                setOptions(() => {
                    // Keep selected option in the list if not present
                    if (selectedOption && !newOptions.some(o => o.value === selectedOption.value)) {
                        return [selectedOption, ...newOptions]
                    }
                    return newOptions
                })
                setHasSearched(true)
            } catch (error) {
                console.error('Failed to fetch users for combobox', error)
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
            setIsLoading(false)
        }
    }, [search, selectedOption, hasSearched])

    const handleInputValueChange = useCallback((inputValue: string) => {
        setSearch(inputValue)
    }, [])

    const showPrompt = !search.trim() && !isLoading && options.length === 0

    return (
        <Combobox
            items={options}
            filter={null}
            value={selectedOption}
            onValueChange={(option: UserOption | null) => {
                setSelectedOption(option)
                onChange(option?.value ?? '')
            }}
            onInputValueChange={handleInputValueChange}
            isItemEqualToValue={(a: UserOption | null, b: UserOption | null) => a?.value === b?.value}
        >
            <ComboboxInput
                placeholder={placeholder}
                showClear
                disabled={disabled}
            />
            <ComboboxContent className="z-[70]">
                <ComboboxList>
                    {showPrompt ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                            Type to search for users...
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground">
                            <Spinner className="size-4" />
                            <span>Loading users...</span>
                        </div>
                    ) : options.length === 0 && hasSearched ? (
                        <ComboboxEmpty>No users found</ComboboxEmpty>
                    ) : (
                        options.map(user => (
                            <ComboboxItem key={user.value} value={user}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.userName}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </ComboboxItem>
                        ))
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
