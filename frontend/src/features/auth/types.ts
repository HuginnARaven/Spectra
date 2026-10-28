import type {User} from "@/features/account/types.ts";

export interface AuthResponse {
    user: User;
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

export interface GoogleAuthRequest{
    code: string
}

export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}