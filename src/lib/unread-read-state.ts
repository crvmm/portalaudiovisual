const STORAGE_KEY_PREFIX = "portal-av-read:";
const memoryLastRead: Record<string, Record<string, string>> = {};

function loadStoredReads(userId: string): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveStoredReads(userId: string, reads: Record<string, string>) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      `${STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(reads)
    );
  } catch {
    // Ignore quota errors.
  }
}

function getReadsForUser(userId: string): Record<string, string> {
  const stored = loadStoredReads(userId);
  const memory = memoryLastRead[userId] ?? {};
  const merged: Record<string, string> = { ...stored };

  for (const [conversationId, readAt] of Object.entries(memory)) {
    const current = merged[conversationId];
    if (!current || new Date(readAt) > new Date(current)) {
      merged[conversationId] = readAt;
    }
  }

  return merged;
}

export function syncLocalReadFromServer(
  userId: string,
  conversationId: string,
  readAt: string
) {
  const reads = { ...getReadsForUser(userId), [conversationId]: readAt };
  memoryLastRead[userId] = reads;
  saveStoredReads(userId, reads);
}

export function applyLocalRead(
  userId: string,
  conversationId: string,
  readAt: string
) {
  const reads = getReadsForUser(userId);
  const current = reads[conversationId];

  if (!current || new Date(readAt) > new Date(current)) {
    syncLocalReadFromServer(userId, conversationId, readAt);
  }
}

export function mergeLastRead(
  userId: string,
  conversationId: string,
  dbLastRead: string | null
): string | null {
  const local = getReadsForUser(userId)[conversationId];
  if (!dbLastRead && !local) return null;
  if (!dbLastRead) return local ?? null;
  if (!local) return dbLastRead;
  return new Date(local) > new Date(dbLastRead) ? local : dbLastRead;
}

export function isMessageRead(
  messageCreatedAt: string,
  lastRead: string | null
): boolean {
  if (!lastRead) return false;
  return new Date(messageCreatedAt).getTime() <= new Date(lastRead).getTime();
}
