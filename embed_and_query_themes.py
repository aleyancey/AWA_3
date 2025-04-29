"""
Embed and Query Sound Themes with Sentence Transformers and ChromaDB

- Embeds all soundscape themes from data/sound_themes.json using all-MiniLM-L6-v2 (local, free model)
- Stores embeddings and metadata in a local ChromaDB collection
- Provides a simple CLI for querying by mood, intention, or description

Usage:
    python embed_and_query_themes.py

Requirements:
    pip install sentence-transformers chromadb

Author: Cascade AI (for Sound Sanctuary)
"""
import json
from sentence_transformers import SentenceTransformer
import chromadb
import os

# ========== CONFIGURATION ========== #
THEME_JSON_PATH = "data/sound_themes.json"
CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "sound_themes"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# ========== EMBEDDING & STORAGE ========== #
import time

def embed_and_store():
    overall_start = time.time()
    print(f"Loading themes from {THEME_JSON_PATH} ...")
    t0 = time.time()
    with open(THEME_JSON_PATH, "r") as f:
        themes = json.load(f)
    print(f"Loaded {len(themes)} themes in {time.time() - t0:.2f}s")

    t1 = time.time()
    print(f"Loading embedding model: {EMBEDDING_MODEL} ...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print(f"Model loaded in {time.time() - t1:.2f}s")

    t2 = time.time()
    print(f"Connecting to ChromaDB at {CHROMA_DB_PATH} ...")
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_or_create_collection(COLLECTION_NAME)
    print(f"ChromaDB connected in {time.time() - t2:.2f}s")

    print("Embedding and storing themes ...")
    for i, theme in enumerate(themes):
        t3 = time.time()
        text = theme["description"] + " " + " ".join(theme["mood_tags"])
        embedding = model.encode(text).tolist()
        t4 = time.time()
        collection.add(
            embeddings=[embedding],
            documents=[json.dumps(theme)],
            ids=[theme["id"]]
        )
        t5 = time.time()
        print(f"Added theme: {theme['id']} ({i+1}/{len(themes)}) | embedding: {t4-t3:.2f}s | db add: {t5-t4:.2f}s")

    print(f"Embedded and stored {len(themes)} themes in {time.time() - overall_start:.2f}s total.")
    print("--- Timing breakdown: ---")
    print(f"JSON load: {t0:.2f}s, Model load: {t1-t0:.2f}s, DB connect: {t2-t1:.2f}s, Embedding+add loop: {time.time() - t2:.2f}s")


# ========== QUERY INTERFACE ========== #
import sys

def query_themes():
    """
    If a query is provided as a command-line argument, run a single search and exit.
    Otherwise, enter interactive mode and prompt for queries until 'exit' or 'quit' is entered.
    """
    model = SentenceTransformer(EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    collection = client.get_or_create_collection(COLLECTION_NAME)

    # --- Single-query CLI mode ---
    if len(sys.argv) > 1:
        user_query = " ".join(sys.argv[1:]).strip()
        if not user_query:
            print("No query provided.")
            return
        query_embedding = model.encode(user_query).tolist()
        results = collection.query(query_embeddings=[query_embedding], n_results=3)
        print(f"\nTop matching themes for: '{user_query}'\n")
        for doc in results["documents"][0]:
            theme = json.loads(doc)
            print(f"- {theme['name']} (moods: {', '.join(theme['mood_tags'])})\n  {theme['description']}\n")
        return

    # --- Interactive mode ---
    print("\nSemantic Theme Search (type 'exit' to quit)")
    while True:
        user_query = input("\nEnter a mood, intention, or description: ").strip()
        if user_query.lower() in ("exit", "quit"): break
        query_embedding = model.encode(user_query).tolist()
        results = collection.query(query_embeddings=[query_embedding], n_results=3)
        print("\nTop matching themes:")
        for doc in results["documents"][0]:
            theme = json.loads(doc)
            print(f"- {theme['name']} (moods: {', '.join(theme['mood_tags'])})\n  {theme['description']}\n")


if __name__ == "__main__":
    print("\n==== Sound Sanctuary: Theme Embedding & Semantic Search ====")
    if not os.path.isdir(CHROMA_DB_PATH) or not os.listdir(CHROMA_DB_PATH):
        embed_and_store()
    else:
        print("ChromaDB already contains data. Skipping embedding.\n")
    query_themes()
