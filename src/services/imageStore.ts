/**
 * In-memory and session cache for uploaded document preview images.
 * Ensures uploaded images can be visualized immediately across stages:
 * Upload -> Analysis -> Results Viewer -> History.
 */

const memoryStore = new Map<string, string>();

export const imageStore = {
  setImage: (key: string, dataUrlOrBlobUrl: string): void => {
    if (!key || !dataUrlOrBlobUrl) return;
    memoryStore.set(key.toLowerCase(), dataUrlOrBlobUrl);
    try {
      // Store in sessionStorage if reasonable size (< 4MB) to survive page refresh
      if (dataUrlOrBlobUrl.length < 4 * 1024 * 1024) {
        sessionStorage.setItem(`docusentry_img_${key.toLowerCase()}`, dataUrlOrBlobUrl);
      }
    } catch {
      // Ignore quota storage exceptions
    }
  },

  getImage: (key: string | undefined | null): string | null => {
    if (!key) return null;
    const lowerKey = key.toLowerCase();
    if (memoryStore.has(lowerKey)) {
      return memoryStore.get(lowerKey)!;
    }
    try {
      const fromSession = sessionStorage.getItem(`docusentry_img_${lowerKey}`);
      if (fromSession) {
        memoryStore.set(lowerKey, fromSession);
        return fromSession;
      }
    } catch {
      // Ignore
    }
    return null;
  },

  removeImage: (key: string): void => {
    if (!key) return;
    const lowerKey = key.toLowerCase();
    memoryStore.delete(lowerKey);
    try {
      sessionStorage.removeItem(`docusentry_img_${lowerKey}`);
    } catch {
      // Ignore
    }
  },
};
