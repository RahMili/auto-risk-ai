import json
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.llm import get_llm
from app.schemas.analysis import DecomposedTasks, ParsedProfile, Task, PipelineState

SYSTEM = """You are an AI automation expert. Decompose job responsibilities into granular tasks
and classify each. Return ONLY valid JSON with no extra text or markdown."""

PROMPT = """Decompose this profile into specific tasks and classify each:

Role: {role}
Skills: {skills}
Responsibilities: {responsibilities}

Classify each task as one of:
- highly_automatable: AI can fully handle this today
- partially_automatable: AI assists but human still needed
- low_automatable: requires human judgment
- human_critical: requires human presence, trust, or creativity

Return JSON:
{{
  "tasks": [{{"description": "task", "category": "highly_automatable"}}],
  "highly_automatable": ["task1"],
  "partially_automatable": ["task1"],
  "low_automatable": ["task1"],
  "human_critical": ["task1"]
}}"""


async def decompose_tasks(state: PipelineState) -> dict:
    llm = get_llm()
    profile = ParsedProfile(**state["profile"])
    messages = [
        SystemMessage(content=SYSTEM),
        HumanMessage(content=PROMPT.format(
            role=profile.current_role,
            skills=", ".join(profile.skills),
            responsibilities="\n".join(f"- {r}" for r in profile.responsibilities),
        )),
    ]
    response = await llm.ainvoke(messages)
    data = json.loads(response.content.strip())
    DecomposedTasks(**data)  # validate
    return {"tasks": data}  # return raw dict
    