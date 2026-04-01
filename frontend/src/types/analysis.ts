export type AutomationBand = "low" | "moderate" | "high" | "very_high";

export interface ParsedProfile {
  name: string;
  current_role: string;
  skills: string[];
  tools: string[];
  responsibilities: string[];
  years_experience: number;
}

export interface Task {
  description: string;
  category: string;
}

export interface DecomposedTasks {
  tasks: Task[];
  highly_automatable: string[];
  partially_automatable: string[];
  low_automatable: string[];
  human_critical: string[];
}

export interface RiskScore {
  score: number;
  band: AutomationBand;
  highly_automatable_pct: number;
  partially_automatable_pct: number;
  low_automatable_pct: number;
  human_critical_pct: number;
}

export interface Recommendations {
  exposure_areas: string[];
  resistant_strengths: string[];
  upskill_roadmap: string[];
  transition_paths: string[];
}

export interface AnalysisReport {
  job_id: string;
  profile: ParsedProfile;
  tasks: DecomposedTasks;
  risk: RiskScore;
  recommendations: Recommendations;
  roast: string | null;
}

export interface UploadResponse {
  filename: string;
  content_type: string;
  extracted_text: string;
  char_count: number;
  message: string;
  file_id: string;
  s3_key: string;
}