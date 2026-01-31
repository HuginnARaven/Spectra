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

type MetricCardData = {
    title: string,
    number: string,
    bageText: string,
    trendMessage: string,
    isTrendIncrease: boolean,
    bottomText: string
}

export function MetricCardItem(props: MetricCardData) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{props.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {props.number}
                </CardTitle>
                <CardAction>
                    <Badge variant="outline">
                        <IconTrendingUp />
                        {props.bageText}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {props.trendMessage} {props.isTrendIncrease ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                </div>
                <div className="text-muted-foreground">
                    {props.bottomText}
                </div>
            </CardFooter>
        </Card>
    )
}
