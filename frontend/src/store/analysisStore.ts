import { create } from "zustand";
import type { AnalysisReport, UploadResponse } from "../types/analysis";

interface AnalysisStore {
  // upload state
  upload: UploadResponse | null;
  editedText: string;
  roastMode: boolean;

  // analysis state
  jobId: string | null;
  statuses: string[];
  report: AnalysisReport | null;
  isAnalyzing: boolean;
  error: string | null;

  // actions
  setUpload: (upload: UploadResponse) => void;
  setEditedText: (text: string) => void;
  setRoastMode: (mode: boolean) => void;
  setJobId: (id: string) => void;
  addStatus: (status: string) => void;
  setReport: (report: AnalysisReport | null) => void;
  setIsAnalyzing: (val: boolean) => void;
  setError: (error: string | null) => void;
  clearRun: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  upload: null,
  editedText: "",
  roastMode: false,
  jobId: null,
  statuses: [],
  report: null,
  isAnalyzing: false,
  error: null,

  setUpload: (upload) => set({ upload, editedText: upload.extracted_text }),
  setEditedText: (editedText) => set({ editedText }),
  setRoastMode: (roastMode) => set({ roastMode }),
  setJobId: (jobId) => set({ jobId }),
  addStatus: (status) => set((s) => ({ statuses: [...s.statuses, status] })),
  setReport: (report) => set({ report }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),
  clearRun: () => set({          // ← add here
    jobId: null,
    statuses: [],
    report: null,
    isAnalyzing: false,
    error: null,
  }),
  reset: () => set({
    upload: null,
    editedText: "",
    roastMode: false,
    jobId: null,
    statuses: [],
    report: null,
    isAnalyzing: false,
    error: null,
  }),
}));