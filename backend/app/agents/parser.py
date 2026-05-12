import json
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.llm import get_llm
from app.schemas.analysis import PipelineState, ParsedProfile


SYSTEM = """You are a professional resume parser. Extract structured data from the resume.
Return ONLY valid JSON with no extra text or markdown backticks."""


PROMPT = """Extract the following from this resume and return as JSON:
{{
  "name": "full name",
  "current_role": "most recent job title",
  "skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "years_experience": 0
}}

Resume:
{text}"""


async def parse_profile(state: PipelineState) -> dict:
    llm = get_llm()
    messages = [
        SystemMessage(content=SYSTEM),
        HumanMessage(content=PROMPT.format(text=state["raw_text"])),
    ]
    response = await llm.ainvoke(messages)
    data = json.loads(response.content.strip())
    ParsedProfile(**data)  # validate it parses correctly
    return {"profile": data}  # return raw dict
    
