// src/stores/quizStore.ts
import { openDB } from 'idb';

export interface QuestionRef {
  id: string;
  order: number;
}

export interface QuizSession {
  id: string;
  date: string;
  name: string;
  questions: QuestionRef[];
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'quiz-builder';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date');
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });
}

export const quizStore = {
  async save(session: QuizSession): Promise<void> {
    const db = await getDb();
    await db.put(STORE_NAME, { ...session, updatedAt: Date.now() });
    await db.close();
  },

  async load(id: string): Promise<QuizSession | null> {
    const db = await getDb();
    const session = await db.get(STORE_NAME, id);
    await db.close();
    return session ?? null;
  },

  async list(): Promise<QuizSession[]> {
    const db = await getDb();
    const sessions = await db.getAllFromIndex(STORE_NAME, 'createdAt');
    await db.close();
    return sessions.sort((a, b) => b.createdAt - a.createdAt);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
    await db.close();
  },

  async addQuestion(sessionId: string, questionId: string, order: number): Promise<void> {
    const db = await getDb();
    const session = await db.get(STORE_NAME, sessionId);
    if (!session) {
      await db.close();
      throw new Error('Session not found');
    }
    session.questions.push({ id: questionId, order });
    session.questions.sort((a, b) => a.order - b.order);
    await db.put(STORE_NAME, { ...session, updatedAt: Date.now() });
    await db.close();
  },

  async reorder(sessionId: string, order: string[]): Promise<void> {
    const db = await getDb();
    const session = await db.get(STORE_NAME, sessionId);
    if (!session) {
      await db.close();
      throw new Error('Session not found');
    }
    session.questions = order.map((qId, idx) => ({ id: qId, order: idx }));
    await db.put(STORE_NAME, { ...session, updatedAt: Date.now() });
    await db.close();
  },

  async removeQuestion(sessionId: string, questionId: string): Promise<void> {
    const db = await getDb();
    const session = await db.get(STORE_NAME, sessionId);
    if (!session) {
      await db.close();
      throw new Error('Session not found');
    }
    session.questions = session.questions.filter((q) => q.id !== questionId);
    session.questions = session.questions.map((q, idx) => ({ ...q, order: idx }));
    await db.put(STORE_NAME, { ...session, updatedAt: Date.now() });
    await db.close();
  },
};
