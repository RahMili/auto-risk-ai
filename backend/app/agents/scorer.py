from app.schemas.analysis import RiskScore, AutomationBand, DecomposedTasks, PipelineState


async def calculate_score(state: PipelineState) -> dict:
    tasks = DecomposedTasks(**state["tasks"])

    high = len(tasks.highly_automatable)
    partial = len(tasks.partially_automatable)
    low = len(tasks.low_automatable)
    human = len(tasks.human_critical)
    total = high + partial + low + human or 1

    raw = (high * 0.9) + (partial * 0.5) + (low * 0.2)
    max_possible = total * 0.9
    score = round((raw / max_possible) * 100, 1)

    if score <= 30:
        band = AutomationBand.low
    elif score <= 60:
        band = AutomationBand.moderate
    elif score <= 80:
        band = AutomationBand.high
    else:
        band = AutomationBand.very_high

    return {"risk": {
        "score": score,
        "band": band.value,  # store enum as string
        "highly_automatable_pct": round(high / total * 100, 1),
        "partially_automatable_pct": round(partial / total * 100, 1),
        "low_automatable_pct": round(low / total * 100, 1),
        "human_critical_pct": round(human / total * 100, 1),
    }}