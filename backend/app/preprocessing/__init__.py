"""Text preprocessing and embedding pipeline."""

from app.preprocessing.text_processor import (
    load_texts,
    TextEmbeddingDataset,
    generate_embeddings,
    cache_embeddings,
    load_cached_embeddings,
    process_all_texts,
)

__all__ = [
    "load_texts",
    "TextEmbeddingDataset",
    "generate_embeddings",
    "cache_embeddings",
    "load_cached_embeddings",
    "process_all_texts",
]
