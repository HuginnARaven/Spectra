import * as React from "react"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
type MetricItem = {
    name: string;
    value: number;
    trendPercentage: number;
}
type MetricCardProps = {
    title: string;
    items: MetricItem[];
    bottomText: string;
}

export function MetricCardItem({ title, items, bottomText }: MetricCardProps) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const activeItem = items[selectedIndex] || { name: "N/A", value: 0, trendPercentage: 0 };
    const isTrendIncrease = activeItem.trendPercentage > 0;
    
    const hasMultipleItems = items.length > 1;

    function generateTrendMessage(trendPercentage: number, isTrendIncrease: boolean){
        if (isTrendIncrease) {
            return `Trending up by ${trendPercentage}% this month`;
        } else {
            return `Trending down by ${Math.abs(trendPercentage)}% this month`;
        }
    }
    
    const cardContent = (
        <Card
            className={`
                @container/card bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card transition-colors duration-200
                ${hasMultipleItems ? "hover:border-primary cursor-pointer" : ""}
            `}
        >
            <CardHeader>
                <CardDescription>
                    {hasMultipleItems ? `${title}: ${activeItem.name}` : title}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {activeItem.value}
                </CardTitle>
                <CardAction>
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {isTrendIncrease ? <IconTrendingUp /> : <IconTrendingDown />}
                        {activeItem.trendPercentage}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {generateTrendMessage(activeItem.trendPercentage, isTrendIncrease)}
                    {isTrendIncrease ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                </div>
                <div className="text-muted-foreground">
                    {bottomText}
                </div>
            </CardFooter>
        </Card>
    );
    
    if (!hasMultipleItems) {
        return cardContent;
    }
    
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {cardContent}
            </ContextMenuTrigger>
            
            <ContextMenuContent className="max-h-64 overflow-y-auto">
                <ContextMenuRadioGroup
                    value={selectedIndex.toString()}
                    onValueChange={(val) => setSelectedIndex(Number(val))}
                >
                    {items.map((item, idx) => (
                        <ContextMenuRadioItem key={item.name} value={idx.toString()}>
                            {item.name}
                        </ContextMenuRadioItem>
                    ))}
                </ContextMenuRadioGroup>
            </ContextMenuContent>
        </ContextMenu>
    )
}