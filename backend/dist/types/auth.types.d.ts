export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}
export declare const VALID_ROLES: readonly ["admin", "user", "viewer"];
//# sourceMappingURL=auth.types.d.ts.map