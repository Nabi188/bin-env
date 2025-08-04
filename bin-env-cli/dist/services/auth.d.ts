interface AuthData {
    baseUrl: string;
    token: string;
    timestamp: number;
}
export declare class AuthService {
    private getCookiePath;
    saveAuth(baseUrl: string, token: string): void;
    getAuth(): AuthData | null;
    isAuthenticated(): boolean;
    clearAuth(): void;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.d.ts.map