import { MetricCardItem } from "./metric-card-item"

type MetricCardData = {
    title: string,
    number: string,
    bageText: string,
    trendMessage: string,
    isTrendIncrease: boolean,
    bottomText: string
}

const data: MetricCardData[] = [
    {
        title: "Test data 1",
        number: "$1,250.00",
        bageText: "+12.5%",
        trendMessage: "Trending up this month",
        isTrendIncrease: true,
        bottomText: "Test data for the last 6 months"
    },
    {
        title: "Test data 2",
        number: "100",
        bageText: "-1%",
        trendMessage: "Down 1% this period",
        isTrendIncrease: false,
        bottomText: "Acquisition needs attention"
    },
    {
        title: "Test data 3",
        number: "45,678",
        bageText: "+5%",
        trendMessage: "Strong retention",
        isTrendIncrease: true,
        bottomText: "Engagement exceed targets"
    },
    {
        title: "Test data 4",
        number: "-4.5%",
        bageText: "-4.5%",
        trendMessage: "Bad performance",
        isTrendIncrease: false,
        bottomText: "Test test test"
    },
]

export function StatsSection() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {data.map((d: MetricCardData) => ( <MetricCardItem {...d}/> ))}
    </div>
  )
}
