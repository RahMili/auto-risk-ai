from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM provider
    llm_provider: str = "anthropic"

    # Anthropic
    anthropic_base_url: str = ""
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-4-20250514"

    # OpenAI
    openai_base_url: str = ""
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    # Shared LLM config
    max_tokens: int = 4096
    temperature: float = 0.3
    max_retries: int = 3
    timeout: int = 30

    # AWS
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_report_bucket_name: str = "auto-risk-ai-reports-rm"
    s3_uploads_bucket_name: str = ""
    dynamodb_table_name: str = "autorisk-jobs"
    dynamodb_users_table_name: str = "autorisk-users"
    dynamodb_users_email_gsi_name: str = "email-gsi"
    ec2_public_ip: str = ""

    # App
    app_name: str = "AutoRisk AI"
    debug: bool = False

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()