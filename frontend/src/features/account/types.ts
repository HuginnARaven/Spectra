export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    emailConfirmed: boolean;
    createdAt: string;
}

export interface ProfileRequest {
    username: string;
    email: string;
    displayName: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface SetPasswordRequest {
    password: string;
    confirmPassword: string;
}