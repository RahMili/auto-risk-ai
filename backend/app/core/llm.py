from functools import lru_cache
from langchain_core.language_models import BaseChatModel
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from app.core.config import get_settings


@lru_cache
def get_llm() -> BaseChatModel:
    settings = get_settings()

    if settings.llm_provider == "anthropic":
        return ChatAnthropic(
            model_name=settings.anthropic_model,
            api_key=settings.anthropic_api_key,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            timeout=settings.timeout,
            max_retries=settings.max_retries,
        )
    else:
        return ChatOpenAI(
            model=settings.openai_model,
            base_url=settings.openai_base_url if settings.openai_base_url else None,
            api_key=settings.openai_api_key,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature,
            timeout=settings.timeout,
            max_retries=settings.max_retries
        )
    