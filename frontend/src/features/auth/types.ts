export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    createdAt: string;
}

export interface AuthResponse {
    id: string;
    email: string;
    username: string;
    token: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    confirmPassword?: string;
}