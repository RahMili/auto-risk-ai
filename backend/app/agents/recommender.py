import json
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.llm import get_llm
from app.schemas.analysis import DecomposedTasks, ParsedProfile, Recommendations, PipelineState

SYSTEM = """You are a career strategist specializing in AI-proof career development.
Return ONLY valid JSON with no extra text or markdown."""

PROMPT = """Generate actionable recommendations based on this risk analysis:

Role: {role}
Risk Score: {score}/100 ({band})
Highly automatable tasks: {high_auto}
Human-critical tasks: {human_critical}
Current skills: {skills}

Return JSON:
{{
  "exposure_areas": ["area1", "area2"],
  "resistant_strengths": ["strength1", "strength2"],
  "upskill_roadmap": ["step1", "step2"],
  "transition_paths": ["path1", "path2"]
}}"""


async def generate_recommendations(state: PipelineState) -> dict:
    llm = get_llm()
    profile = ParsedProfile(**state["profile"])
    tasks = DecomposedTasks(**state["tasks"])
    risk = state["risk"]  # already a dict

    messages = [
        SystemMessage(content=SYSTEM),
        HumanMessage(content=PROMPT.format(
            role=profile.current_role,
            score=risk["score"],
            band=risk["band"],
            high_auto=", ".join(tasks.highly_automatable[:5]),
            human_critical=", ".join(tasks.human_critical[:5]),
            skills=", ".join(profile.skills),
        )),
    ]
    response = await llm.ainvoke(messages)
    data = json.loads(response.content.strip())
    Recommendations(**data)  # validate
    return {"recommendations": data}  # return raw dict