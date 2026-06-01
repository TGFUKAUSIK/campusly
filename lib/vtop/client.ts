import axios, { type AxiosInstance } from "axios";
import https from "node:https";

const agent = new https.Agent({ rejectUnauthorized: false });

let client: AxiosInstance | null = null;

export function vtopClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: "https://vtopcc.vit.ac.in",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      httpsAgent: agent,
      withCredentials: true,
      timeout: 45000
    });
  }
  return client;
}

export function joinCookies(cookies: string[] | string): string {
  return Array.isArray(cookies) ? cookies.join("; ") : cookies;
}
