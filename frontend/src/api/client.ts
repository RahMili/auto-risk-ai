import axios from "axios";
import type { UploadResponse } from "../types/analysis";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

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
  let resultBuffer = "";
  let lineBuffer = "";  // holds incomplete lines between network packets

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

      // prepend any leftover from previous packet
      const text = lineBuffer + decoder.decode(value);
      const lines = text.split("\n");

      // last element may be incomplete — save it for next packet
      lineBuffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        if (line.startsWith("status:")) {
          onStatus(line.replace("status:", "").trim());
        } else if (line.startsWith("chunk:")) {
          resultBuffer += line.replace("chunk:", "");
        } else if (line.startsWith("done:")) {
          onResult(resultBuffer);
          resultBuffer = "";
        } else if (line.startsWith("error:")) {
          onError(line.replace("error:", "").trim());
        }
      }
    }

    // handle any remaining data in lineBuffer
    if (lineBuffer.trim()) {
      if (lineBuffer.startsWith("chunk:")) {
        resultBuffer += lineBuffer.replace("chunk:", "");
      } else if (lineBuffer.startsWith("done:")) {
        onResult(resultBuffer);
      }
    }
  }).catch((err) => {
    if (err.name !== "AbortError") onError(err.message);
  });

  return () => controller.abort();
}