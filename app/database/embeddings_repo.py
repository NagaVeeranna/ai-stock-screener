def store_embeddings(embeddings, metadata):
    conn = get_connection()
    cursor = conn.cursor()

    for emb, meta in zip(embeddings, metadata):
        cursor.execute(
            """
            INSERT INTO stock_embeddings (embedding, metadata)
            VALUES (%s, %s)
            """,
            (emb, meta)   # emb = list[float], pgvector accepts this directly
        )

    conn.commit()
    cursor.close()
    conn.close()
