# Model Fallback Configuration

This document describes the model fallback configuration for text encoding in the Academic Performance Prediction system.

## When to Use Fallback

Consider switching to the fallback model (MiniLM) in the following scenarios:

| Scenario | Indicator | Action |
|----------|-----------|--------|
| **Memory constraints** | Running on t3.medium or smaller instances | Switch to MiniLM to avoid OOM errors |
| **Slow embedding generation** | Embedding generation takes >30 minutes | MiniLM is significantly faster |
| **Slow inference** | DistilBERT inference time >2s per request | MiniLM provides sub-second inference |
| **Cold start issues** | Model loading takes too long on startup | MiniLM loads ~5x faster (50MB vs 250MB) |

## Performance Comparison

| Model | Dimensions | Size | Speed | Use Case |
|-------|-----------|------|-------|----------|
| **DistilBERT** | 768-dim | ~250MB | Baseline | Default, maximum accuracy |
| **MiniLM (fallback)** | 384-dim | ~50MB | ~2-3x faster | Resource-constrained environments |

## How to Switch

### Option 1: Set TEXT_MODEL environment variable

```bash
# Use MiniLM
export TEXT_MODEL=all-MiniLM-L6-v2

# Use DistilBERT (default)
export TEXT_MODEL=distilbert-base-uncased
```

### Option 2: Set fallback flag

```bash
# Enable MiniLM fallback
export USE_MINILM_FALLBACK=true
```

### Option 3: Update .env file

```bash
TEXT_MODEL=all-MiniLM-L6-v2
# or
USE_MINILM_FALLBACK=true
```

### Priority

1. `TEXT_MODEL` environment variable (highest priority)
2. `USE_MINILM_FALLBACK=true`
3. Default: `distilbert-base-uncased`

## Impact on Accuracy

For this use case (student text analysis), the impact on accuracy is **minimal**:

- Student text is relatively simple and well-structured
- MiniLM is optimized for sentence-level embeddings
- The 384-dimensional embeddings capture sufficient semantic information
- In benchmarks, MiniLM achieves ~95% of DistilBERT's performance on similar tasks

## Configuration in Code

```python
from app.core.model_config import get_text_encoder

# Load model based on environment configuration
model, tokenizer = get_text_encoder()

# Get current configuration
from app.core.model_config import get_text_model_config
config = get_text_model_config()
print(f"Using model: {config['model_name']} ({config['hidden_size']}-dim)")
```

## Model Details

### DistilBERT (Default)
- **Model**: `distilbert-base-uncased`
- **Hidden size**: 768
- **Parameters**: 66M
- **Size**: ~250MB
- **Description**: Distilled version of BERT base, 40% smaller while retaining 97% of language understanding capabilities

### MiniLM (Fallback)
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Hidden size**: 384
- **Parameters**: 22M
- **Size**: ~50MB
- **Description**: Smaller, faster model optimized for sentence embeddings via knowledge distillation

## Troubleshooting

### Model fails to load
- Ensure you have internet connectivity for first-time download
- Models are cached in `~/.cache/huggingface/hub/`
- Check disk space (at least 300MB recommended)

### Out of memory errors
- Switch to MiniLM: `TEXT_MODEL=all-MiniLM-L6-v2`
- Consider using CPU-only inference: `CUDA_VISIBLE_DEVICES=""`
- Reduce batch sizes in embedding generation

### Slow inference
- Use MiniLM for faster inference
- Consider batching multiple texts together
- Enable model quantization if supported
