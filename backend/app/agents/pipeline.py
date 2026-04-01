import uuid
from typing import AsyncGenerator
from langgraph.graph import StateGraph, END
from app.schemas.analysis import PipelineState, AnalysisReport
from app.agents.parser import parse_profile
from app.agents.decomposer import decompose_tasks
from app.agents.scorer import calculate_score
from app.agents.recommender import generate_recommendations
from app.agents.roaster import generate_roast, skip_roast
from app.core.aws import create_job, update_job, save_report_to_s3
from app.schemas.analysis import (
    PipelineState,
    AnalysisReport,
    ParsedProfile,
    DecomposedTasks,
    RiskScore,
    Recommendations,
)


async def save_report(state: PipelineState) -> dict:
    profile = ParsedProfile(**state["profile"]) if isinstance(state["profile"], dict) else state["profile"]
    tasks = DecomposedTasks(**state["tasks"]) if isinstance(state["tasks"], dict) else state["tasks"]
    risk = RiskScore(**state["risk"]) if isinstance(state["risk"], dict) else state["risk"]
    recommendations = Recommendations(**state["recommendations"]) if isinstance(state["recommendations"], dict) else state["recommendations"]

    report = AnalysisReport(
        job_id=state["job_id"],
        profile=profile,
        tasks=tasks,
        risk=risk,
        recommendations=recommendations,
        roast=state.get("roast"),
    )
    s3_key = await save_report_to_s3(state["job_id"], report.model_dump())
    return {"s3_key": s3_key}


def should_roast(state: PipelineState) -> str:
    return "generate_roast" if state["roast_mode"] else "skip_roast"


def build_graph() -> StateGraph:
    graph = StateGraph(PipelineState)

    # Register nodes
    graph.add_node("parse_profile", parse_profile)
    graph.add_node("decompose_tasks", decompose_tasks)
    graph.add_node("calculate_score", calculate_score)
    graph.add_node("generate_recommendations", generate_recommendations)
    graph.add_node("generate_roast", generate_roast)
    graph.add_node("skip_roast", skip_roast)
    graph.add_node("save_report", save_report)

    # Linear edges
    graph.set_entry_point("parse_profile")
    graph.add_edge("parse_profile", "decompose_tasks")
    graph.add_edge("decompose_tasks", "calculate_score")
    graph.add_edge("calculate_score", "generate_recommendations")

    # Conditional branch — roast or skip
    graph.add_conditional_edges(
        "generate_recommendations",
        should_roast,
        {
            "generate_roast": "generate_roast",
            "skip_roast": "skip_roast",
        },
    )

    # Both branches converge at save_report
    graph.add_edge("generate_roast", "save_report")
    graph.add_edge("skip_roast", "save_report")
    graph.add_edge("save_report", END)

    return graph.compile()


# Build once at import time
pipeline = build_graph()


from app.core.logging import get_logger

logger = get_logger(__name__)


async def run_pipeline(
    text: str,
    roast_mode: bool = False,
) -> AsyncGenerator[str, None]:
    job_id = str(uuid.uuid4())
    await create_job(job_id)

    yield f"job_id:{job_id}\n"

    initial_state: PipelineState = {
        "job_id": job_id,
        "raw_text": text,
        "roast_mode": roast_mode,
        "profile": None,
        "tasks": None,
        "risk": None,
        "recommendations": None,
        "roast": None,
        "s3_key": None,
        "error": None,
    }

    try:
        accumulated_state = dict(initial_state)

        async for event in pipeline.astream(initial_state):
            node_name = next(iter(event))
            partial_update = event[node_name]

            logger.debug(f"Node completed: {node_name}")
            logger.debug(f"Partial update keys: {list(partial_update.keys())}")
            logger.debug(f"Partial update values: {partial_update}")

            accumulated_state.update(partial_update)
            yield f"status:{node_name.replace('_', ' ').title()}...\n"

        logger.debug("Graph completed. Final accumulated state:")
        for key, value in accumulated_state.items():
            logger.debug(f"  {key}: {type(value).__name__} = {value}")

        profile = ParsedProfile(**accumulated_state["profile"]) if isinstance(accumulated_state["profile"], dict) else accumulated_state["profile"]
        tasks = DecomposedTasks(**accumulated_state["tasks"]) if isinstance(accumulated_state["tasks"], dict) else accumulated_state["tasks"]
        risk = RiskScore(**accumulated_state["risk"]) if isinstance(accumulated_state["risk"], dict) else accumulated_state["risk"]
        recommendations = Recommendations(**accumulated_state["recommendations"]) if isinstance(accumulated_state["recommendations"], dict) else accumulated_state["recommendations"]

        logger.debug(f"Profile type after rehydration: {type(profile)}")
        logger.debug(f"Risk type after rehydration: {type(risk)}")
        logger.debug(f"Risk value: {risk}")

        report = AnalysisReport(
            job_id=job_id,
            profile=ParsedProfile(**accumulated_state["profile"]),
            tasks=DecomposedTasks(**accumulated_state["tasks"]),
            risk=RiskScore(**accumulated_state["risk"]),
            recommendations=Recommendations(**accumulated_state["recommendations"]),
            roast=accumulated_state.get("roast"),
        )

        await update_job(job_id, "complete", accumulated_state["s3_key"])
        # yield f"result:{report.model_dump_json()}\n"
        result_json = report.model_dump_json()
        chunk_size = 1024
        for i in range(0, len(result_json), chunk_size):
            yield f"chunk:{result_json[i:i+chunk_size]}\n"
        yield "done:\n"

    except Exception as e:
        logger.exception(f"Pipeline failed for job {job_id}")
        await update_job(job_id, "failed", error=str(e))
        yield f"error:{str(e)}\n"
