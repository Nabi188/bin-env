export interface Project {
    id: string;
    name: string;
    description: string;
    envFiles: EnvFile[];
}
export interface EnvFile {
    id: string;
    name: string;
    rawContent: string;
    projectId: string;
}
export declare class ApiClient {
    private client;
    private baseUrl;
    constructor(baseUrl: string);
    login(password: string): Promise<{
        token: string;
    }>;
    getProjects(): Promise<Project[]>;
    getEnvFiles(projectId: string): Promise<EnvFile[]>;
}
export declare function createApiClient(): ApiClient;
//# sourceMappingURL=api.d.ts.map