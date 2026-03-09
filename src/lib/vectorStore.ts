const DB_NAME = 'localai-kb';
const DB_VERSION = 1;

export interface StoredDocument {
  id: string;
  name: string;
  addedAt: number;
  chunkCount: number;
  fileSize: number;
}

export interface StoredChunk {
  id: string;
  docId: string;
  text: string;
  embedding: number[];
  category: string;
  chunkIndex: number;
}

export interface SearchResult {
  chunk: StoredChunk;
  score: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('addedAt', 'addedAt');
      }
      if (!db.objectStoreNames.contains('chunks')) {
        const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
        chunkStore.createIndex('docId', 'docId');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txGet<T>(db: IDBDatabase, store: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function txGetAll<T>(db: IDBDatabase, store: string, index?: string, query?: IDBValidKey): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = index ? os.index(index).getAll(query) : os.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function txPut(db: IDBDatabase, store: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function txDelete(db: IDBDatabase, store: string, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

class VectorStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB();
    }
    return this.dbPromise;
  }

  async addDocument(doc: StoredDocument): Promise<void> {
    const db = await this.getDB();
    await txPut(db, 'documents', doc);
  }

  async addChunks(chunks: StoredChunk[]): Promise<void> {
    const db = await this.getDB();
    await Promise.all(chunks.map(c => txPut(db, 'chunks', c)));
  }

  async getDocument(id: string): Promise<StoredDocument | undefined> {
    const db = await this.getDB();
    return txGet<StoredDocument>(db, 'documents', id);
  }

  async getAllDocuments(): Promise<StoredDocument[]> {
    const db = await this.getDB();
    return txGetAll<StoredDocument>(db, 'documents');
  }

  async getChunksForDoc(docId: string): Promise<StoredChunk[]> {
    const db = await this.getDB();
    return txGetAll<StoredChunk>(db, 'chunks', 'docId', docId);
  }

  async deleteDocument(docId: string): Promise<void> {
    const db = await this.getDB();
    const chunks = await this.getChunksForDoc(docId);
    await Promise.all(chunks.map(c => txDelete(db, 'chunks', c.id)));
    await txDelete(db, 'documents', docId);
  }

  async search(queryEmbedding: number[], topK = 5): Promise<SearchResult[]> {
    const db = await this.getDB();
    const allChunks = await txGetAll<StoredChunk>(db, 'chunks');
    const scored = allChunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['documents', 'chunks'], 'readwrite');
      tx.objectStore('documents').clear();
      tx.objectStore('chunks').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const vectorStore = new VectorStore();
