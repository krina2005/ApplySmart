try:
    from sentence_transformers import SentenceTransformer
    print("Import successful")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model loaded")
    emb = model.encode("test")
    print("Encode successful", emb.shape)
except Exception as e:
    import traceback
    traceback.print_exc()
