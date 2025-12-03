"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/components/ui/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from "@/components/ui/popover"

export interface ComboboxItem {
    value: string
    label: string
}

interface ComboboxProps {
    items: ComboboxItem[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string // Not used in this variant as the trigger IS the search
    emptyText?: string
    className?: string
}

export function Combobox({
    items,
    value,
    onValueChange,
    placeholder = "Select item...",
    emptyText = "No item found.",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const containerRef = React.useRef<HTMLDivElement>(null)

    // Update input value when external value changes
    React.useEffect(() => {
        // If the input is focused, do not overwrite the value with the selected item label
        // This allows the user to clear the input and type without it snapping back
        if (containerRef.current?.contains(document.activeElement)) {
            return
        }

        if (value) {
            const item = items.find((item) => item.value === value)
            if (item) {
                setInputValue(item.label)
            }
        } else {
            // Only clear input if value is explicitly cleared and we are not typing?
            // Actually, if value is empty, input should probably be empty or placeholder.
            // But if user is typing to search, value might be empty (not selected yet).
            // We should only sync from props if value is present, or maybe strictly sync?
            // Let's strictly sync for now to avoid desync.
            // But this prevents typing if onValueChange doesn't update value immediately?
            // Usually onValueChange is called on SELECT.
            // So while typing, value is unchanged.
            // We only want to update inputValue from value if value CHANGES.
        }
    }, [value, items])

    const handleSelect = (currentValue: string) => {
        // currentValue here is the label (because we set value={item.label} on CommandItem)
        const selectedItem = items.find(i => i.label.toLowerCase() === currentValue.toLowerCase())
        if (selectedItem) {
            onValueChange(selectedItem.value)
            setInputValue(selectedItem.label)
        }
        setOpen(false)
    }


    return (
        <Command className={cn("overflow-visible bg-transparent", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                    <div className="relative" ref={containerRef}>
                        <CommandPrimitive.Input
                            placeholder={placeholder}
                            value={inputValue}
                            onValueChange={(val) => {
                                setInputValue(val)
                                setOpen(true)
                                if (val === "") {
                                    onValueChange("")
                                }
                            }}
                            onFocus={() => {
                                setOpen(true)
                                setInputValue("") // Clear input on focus to show all options
                            }}
                            onBlur={() => {
                                // Restore label if value exists
                                if (value) {
                                    const item = items.find((item) => item.value === value)
                                    if (item) {
                                        setInputValue(item.label)
                                    }
                                } else {
                                    setInputValue("")
                                }
                            }}
                            className={cn(
                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    className="p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => {
                        if (containerRef.current?.contains(e.target as Node)) {
                            e.preventDefault()
                        }
                    }}
                >
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </PopoverContent>
            </Popover>
        </Command>
    )
}
