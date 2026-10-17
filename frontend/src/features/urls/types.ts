export type UrlData = {
    id: string;
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    createdAt: string;
};

export type CreateUrlRequest = {
    originalUrl: string;
    customCode: string | null;
}