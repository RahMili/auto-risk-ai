from enum import Enum
from pydantic import BaseModel
from typing_extensions import TypedDict
from typing import Optional


class AutomationBand(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    very_high = "vvery_high"


class Task(BaseModel):
    description: str = "Desription of the task"
    category: str = "Category of the task"


class DecomposedTasks(BaseModel):
    tasks: list[Task]
    highly_automatable: list[str]
    partially_automatable: list[str]
    low_automatable: list[str]
    human_critical: list[str]


class ParsedProfile(BaseModel):
    name: str
    current_role: str
    skills: list[str]
    tools: list[str]
    responsibilities: list[str]
    years_experience: int


class RiskScore(BaseModel):
    score: float
    band: AutomationBand
    highly_automatable_pct: float
    partially_automatable_pct: float
    low_automatable_pct: float
    human_critical_pct: float


class Recommendations(BaseModel):
    exposure_areas: list[str]
    resistant_strengths: list[str]
    upskill_roadmap: list[str]
    transition_paths: list[str]


class AnalysisReport(BaseModel):
    job_id: str
    profile: ParsedProfile
    tasks: DecomposedTasks
    risk: RiskScore
    recommendations: Recommendations
    roast: Optional[str] = None


class PipelineState(TypedDict):
    job_id: str
    raw_text: str
    roast_mode: bool
    profile: Optional[dict]           # store as dict, rehydrate later
    tasks: Optional[dict]             # store as dict, rehydrate later
    risk: Optional[dict]              # store as dict, rehydrate later
    recommendations: Optional[dict]   # store as dict, rehydrate later
    roast: Optional[str]
    s3_key: Optional[str]
    error: Optional[str]
