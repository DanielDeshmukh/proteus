import os
from openai import OpenAI


NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"


def get_nim_client() -> OpenAI:
    api_key = os.environ.get("NVIDIA_NIM_API_KEY")
    if not api_key:
        raise RuntimeError("NVIDIA_NIM_API_KEY environment variable is not set")
    return OpenAI(base_url=NIM_BASE_URL, api_key=api_key)


def chat_completion(
    model: str,
    messages: list[dict],
    temperature: float = 0.3,
    max_tokens: int = 4096,
    response_format: dict | None = None,
) -> str:
    client = get_nim_client()
    kwargs = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        kwargs["response_format"] = response_format
    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


def embed_texts(texts: list[str], model: str = "nvidia/nv-embedqa-e5-v5") -> list[list[float]]:
    client = get_nim_client()
    response = client.embeddings.create(model=model, input=texts)
    return [item.embedding for item in response.data]
