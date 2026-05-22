export type UrlVisitData = {
    id: string
    ipAddress: string
    country: string
    city: string
    userAgent: string
    browser: string
    deviceType: string
    referrer: string
    createdAt: string
}

export type UrlAnalyticsData = {
    totalVisits: number;
    topCountries: {
        country: string;
        visits: number;
    }[];
    deviceDistribution: {
        device: string;
        visits: number;
    }[];
    last30DaysVisits: {
        date: string;
        visits: number;
    }[];
}
