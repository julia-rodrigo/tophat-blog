/**
 * Web preview only: when the app runs as a claude.ai artifact, the page can use the viewer's
 * dictation (speech-to-text) and downloads. Outside an artifact these resolve to null.
 */
export type Dictation = {
  start(options?: { language?: string }): Promise<void>;
  stop(): Promise<void>;
  active(): boolean;
  onPartial(h: (e: { text: string }) => void): () => void;
  onFinal(h: (e: { text: string }) => void): () => void;
  onState(h: (e: { state: string; reason?: string }) => void): () => void;
};
export type Downloads = { save(req: { filename: string; data: Blob | ArrayBuffer | ArrayBufferView | string }): Promise<unknown> };

type ClaudeHost = { use(name: string): Promise<unknown> };

function host(): ClaudeHost | null {
  const w = (typeof window !== 'undefined' ? window : undefined) as unknown as { claude?: ClaudeHost } | undefined;
  return w?.claude?.use ? w.claude : null;
}

const cache: Record<string, Promise<unknown>> = {};
function use<T>(name: string): Promise<T | null> {
  if (!cache[name]) {
    const h = host();
    cache[name] = h ? h.use(name).catch(() => null) : Promise.resolve(null);
  }
  return cache[name] as Promise<T | null>;
}

export const getDictation = () => use<Dictation>('dictation');
export const getDownloads = () => use<Downloads>('downloads');

export type Sample = ((input: string, opts?: { images?: Blob[]; modelTier?: 'quick' | 'default' | 'complex' }) => Promise<{ text: string }>) & {
  limits(): Promise<{ images: boolean }>;
};
export const getSample = () => use<Sample>('sample');
