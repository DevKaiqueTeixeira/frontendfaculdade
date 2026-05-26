const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === "production"
    ? "https://backendfaculdade.onrender.com"
    : "http://localhost:8080");

type ApiErro = {
  erro?: string;
  message?: string;
};

export async function parseApiError(response: Response, fallbackMessage: string): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as ApiErro;
    return data.erro || data.message || fallbackMessage;
  }

  const text = await response.text();
  return text || fallbackMessage;
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
