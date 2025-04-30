import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getCurrentUserToken } from "./auth-helpers";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  token?: string | undefined,
): Promise<Response> {
  // 토큰이 제공되지 않으면 getCurrentUserToken에서 가져옵니다
  let authToken = token;
  if (!authToken) {
    try {
      authToken = await getCurrentUserToken() || undefined;
    } catch (error) {
      console.error("Token retrieval error:", error);
      authToken = undefined;
    }
  }
  
  // 헤더 설정
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
    console.log(`Making request to ${url} with auth token: present`);
  } else {
    console.log(`Making request to ${url} without auth token`);
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    console.error(`API request failed: ${res.status} ${res.statusText}`);
  }

  try {
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T, readonly unknown[]> = 
  ({ on401 }) =>
  async ({ queryKey }) => {
    const url = typeof queryKey[0] === "string" ? queryKey[0] : "";
    
    try {
      let token: string | undefined;
      try {
        const fetchedToken = await getCurrentUserToken();
        token = fetchedToken || undefined;
      } catch (error) {
        console.error("Token retrieval error in getQueryFn:", error);
        token = undefined;
      }
      
      const res = await apiRequest("GET", url, undefined, token);
      
      return res.json();
    } catch (e: any) {
      if (e.message?.startsWith("401:") && on401 === "returnNull") {
        return null as unknown as T;
      }
      throw e;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});