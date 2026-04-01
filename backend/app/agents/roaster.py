from langchain_core.messages import HumanMessage, SystemMessage
from app.core.llm import get_llm
from app.schemas.analysis import DecomposedTasks, ParsedProfile, PipelineState

SYSTEM = """You are a witty tech satirist who roasts professionals based on automation risk.
Keep it technical, skill-focused, and funny — never personal or mean-spirited.
Write 3-4 punchy sentences. Plain text only."""

PROMPT = """Roast this professional based on their automation risk:

Name: {name}
Role: {role}
Tools: {tools}
Risk Score: {score}/100 ({band})
Most automatable tasks: {high_auto}

Be clever and specific to their stack."""


async def generate_roast(state: PipelineState) -> dict:
    llm = get_llm()
    profile = ParsedProfile(**state["profile"])
    risk = state["risk"]  # already a dict
    tasks = DecomposedTasks(**state["tasks"])

    messages = [
        SystemMessage(content=SYSTEM),
        HumanMessage(content=PROMPT.format(
            name=profile.name,
            role=profile.current_role,
            tools=", ".join(profile.tools),
            score=risk["score"],
            band=risk["band"],
            high_auto=", ".join(tasks.highly_automatable[:3]),
        )),
    ]
    response = await llm.ainvoke(messages)
    return {"roast": response.content.strip()}


async def skip_roast(state: PipelineState) -> dict:
    return {"roast": None}
