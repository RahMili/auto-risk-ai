import axios from "axios";
import type { UploadResponse } from "../types/analysis";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
});

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<UploadResponse>("/upload", formData);
  return data;
}

export function streamAnalysis(
  fileId: string,
  text: string,
  roastMode: boolean,
  onStatus: (status: string) => void,
  onResult: (result: string) => void,
  onError: (error: string) => void
): () => void {
  const formData = new FormData();
  formData.append("file_id", fileId);
  formData.append("text", text);
  formData.append("roast_mode", String(roastMode));

  const controller = new AbortController();

  fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
    signal: controller.signal,
  }).then(async (response) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        if (line.startsWith("status:")) {
          onStatus(line.replace("status:", "").trim());
        } else if (line.startsWith("result:")) {
          onResult(line.replace("result:", "").trim());
        } else if (line.startsWith("error:")) {
          onError(line.replace("error:", "").trim());
        }
      }
    }
  }).catch((err) => {
    if (err.name !== "AbortError") onError(err.message);
  });

  return () => controller.abort();
}