"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
exports.createApiClient = createApiClient;
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("./auth");
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            headers: {
                "Content-Type": "application/json",
                "x-client-type": "cli",
            },
        });
    }
    async login(password) {
        try {
            const response = await this.client.post("/api/auth/login", { password });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error("Invalid password");
            }
            throw new Error("Login failed. Please check your connection and try again.");
        }
    }
    async getProjects() {
        const auth = auth_1.authService.getAuth();
        if (!auth) {
            throw new Error("Not authenticated. Please login first.");
        }
        try {
            const response = await this.client.get("/api/projects", {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error("Authentication expired. Please login again.");
            }
            throw new Error("Failed to fetch projects. Please try again.");
        }
    }
    async getEnvFiles(projectId) {
        const auth = auth_1.authService.getAuth();
        if (!auth) {
            throw new Error("Not authenticated. Please login first.");
        }
        try {
            const response = await this.client.get(`/api/projects/${projectId}/env-files`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error("Authentication expired. Please login again.");
            }
            if (error.response?.status === 404) {
                throw new Error("Project not found.");
            }
            throw new Error("Failed to fetch environment files. Please try again.");
        }
    }
}
exports.ApiClient = ApiClient;
function createApiClient() {
    const auth = auth_1.authService.getAuth();
    if (!auth) {
        throw new Error("Not authenticated. Please login first.");
    }
    return new ApiClient(auth.baseUrl);
}
//# sourceMappingURL=api.js.map