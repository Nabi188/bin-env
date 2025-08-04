import * as fs from "fs";
import * as path from "path";

interface AuthData {
  baseUrl: string;
  token: string;
  timestamp: number;
}

const COOKIE_FILE = "cookies.txt";

export class AuthService {
  private getCookiePath(): string {
    return path.join(process.cwd(), COOKIE_FILE);
  }

  saveAuth(baseUrl: string, token: string): void {
    const authData: AuthData = {
      baseUrl,
      token,
      timestamp: Date.now(),
    };

    try {
      fs.writeFileSync(this.getCookiePath(), JSON.stringify(authData, null, 2));
    } catch (error) {
      throw new Error("Failed to save authentication data");
    }
  }

  getAuth(): AuthData | null {
    try {
      const cookiePath = this.getCookiePath();
      if (!fs.existsSync(cookiePath)) {
        return null;
      }

      const data = fs.readFileSync(cookiePath, "utf8");
      return JSON.parse(data) as AuthData;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const auth = this.getAuth();
    return auth !== null && !!auth.token && !!auth.baseUrl;
  }

  clearAuth(): void {
    try {
      const cookiePath = this.getCookiePath();
      if (fs.existsSync(cookiePath)) {
        fs.unlinkSync(cookiePath);
      }
    } catch (error) {
      throw new Error("Failed to clear authentication data");
    }
  }
}

export const authService = new AuthService();
