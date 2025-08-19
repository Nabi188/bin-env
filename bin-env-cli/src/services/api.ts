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

  async createEnvFile(
    projectId: string,
    name: string,
    rawContent: string
  ): Promise<EnvFile> {
    const auth = authService.getAuth();
    if (!auth) {
      throw new Error("Not authenticated. Please login first.");
    }

    try {
      const response = await this.client.post(
        `/api/projects/${projectId}/env-files`,
        { name, rawContent },
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
      if (error.response?.status === 409) {
        throw new Error("Environment file with this name already exists.");
      }
      throw new Error("Failed to create environment file. Please try again.");
    }
  }

  async updateEnvFile(
    projectId: string,
    envFileId: string,
    rawContent: string
  ): Promise<EnvFile> {
    const auth = authService.getAuth();
    if (!auth) {
      throw new Error("Not authenticated. Please login first.");
    }

    try {
      const response = await this.client.put(
        `/api/projects/${projectId}/env-files/${envFileId}`,
        { rawContent },
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
        throw new Error("Environment file not found.");
      }
      throw new Error("Failed to update environment file. Please try again.");
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
