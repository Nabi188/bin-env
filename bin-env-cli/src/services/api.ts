import axios, { AxiosInstance } from "axios";
import { authService } from "./auth";

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

export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "cli",
      },
    });
  }

  async login(password: string): Promise<{ token: string }> {
    try {
      const response = await this.client.post("/api/auth/login", { password });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Invalid password");
      }
      throw new Error(
        "Login failed. Please check your connection and try again."
      );
    }
  }

  async getProjects(): Promise<Project[]> {
    const auth = authService.getAuth();
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
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Authentication expired. Please login again.");
      }
      throw new Error("Failed to fetch projects. Please try again.");
    }
  }

  async getEnvFiles(projectId: string): Promise<EnvFile[]> {
    const auth = authService.getAuth();
    if (!auth) {
      throw new Error("Not authenticated. Please login first.");
    }

    try {
      const response = await this.client.get(
        `/api/projects/${projectId}/env-files`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
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

export function createApiClient(): ApiClient {
  const auth = authService.getAuth();
  if (!auth) {
    throw new Error("Not authenticated. Please login first.");
  }
  return new ApiClient(auth.baseUrl);
}
