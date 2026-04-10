# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 — Build the React frontend
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (layer cache)
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build
# Output → /app/frontend/dist


# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 — Python backend + copy built frontend
# ═══════════════════════════════════════════════════════════════════════════════
FROM python:3.11-slim

# System deps for pdfplumber / sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ────────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the sentence-transformer model so it's baked into the image
# (avoids a slow first-request download on HF Spaces)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ── Application code ───────────────────────────────────────────────────────────
COPY core_engine/ ./core_engine/
COPY config/       ./config/

# ── Built React frontend (from Stage 1) ───────────────────────────────────────
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# ── Hugging Face Spaces requires port 7860 ────────────────────────────────────
EXPOSE 7860

# ── Start FastAPI with Uvicorn ─────────────────────────────────────────────────
CMD ["uvicorn", "core_engine.main:app", "--host", "0.0.0.0", "--port", "7860"]
