#!/bin/zsh
# Auto-embed and commit workflow for Sound Sanctuary
#
# 1. Deletes chroma_db to clear old embeddings
# 2. Runs the embedding script using venv Python
# 3. Stages and commits any changes to data/sound_themes.json
# 4. Pushes to the remote repo
#
# Usage: source .venv/bin/activate && ./auto_embed_and_commit.sh

set -e

# Step 1: Remove old chroma_db
rm -rf chroma_db

echo "[auto_embed_and_commit] Old chroma_db removed."

# Step 2: Run embedding script
.venv/bin/python embed_and_query_themes.py

echo "[auto_embed_and_commit] Embedding script completed."

# Step 3: Stage changes
if git diff --quiet --exit-code data/sound_themes.json; then
  echo "[auto_embed_and_commit] No changes to commit."
else
  git add data/sound_themes.json
  git commit -m "feat: auto-embed and commit updated sound themes"
  git push
  echo "[auto_embed_and_commit] Changes committed and pushed."
fi
