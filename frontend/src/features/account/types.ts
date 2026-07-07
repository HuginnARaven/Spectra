export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
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