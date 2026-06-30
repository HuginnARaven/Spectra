export interface TrendAnalytics {
    visits: Visits
    devices: Device[]
    countries: Country[]
    referrers: Referrer[]
}

export interface Visits {
    value: number
    trendPercentage: number
}

export interface Device {
    name: string
    value: number
    trendPercentage: number
}

export interface Country {
    name: string
    value: number
    trendPercentage: number
}

export interface Referrer {
    name: string
    value: number
    trendPercentage: number
}