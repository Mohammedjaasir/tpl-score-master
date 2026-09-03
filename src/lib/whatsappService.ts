const WA_SETTINGS_KEY = "tpl_whatsapp_settings";
const WA_SENT_EVENTS_KEY = "tpl_whatsapp_sent_events";

export interface WhatsAppSettings {
  serverUrl: string;
  apiKey: string;
  sessionId: string;
  targetChatId: string;
}

export const whatsappSettingsRepository = {
  getSettings(): WhatsAppSettings | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(WA_SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveSettings(settings: WhatsAppSettings): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(WA_SETTINGS_KEY, JSON.stringify(settings));
  }
};

export const whatsappCacheRepository = {
  hasSent(eventId: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(WA_SENT_EVENTS_KEY);
      const events = raw ? JSON.parse(raw) : [];
      return events.includes(eventId);
    } catch {
      return false;
    }
  },

  markSent(eventId: string): void {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(WA_SENT_EVENTS_KEY);
      const events = raw ? JSON.parse(raw) : [];
      if (!events.includes(eventId)) {
        events.push(eventId);
        window.localStorage.setItem(WA_SENT_EVENTS_KEY, JSON.stringify(events));
      }
    } catch {}
  }
};

/**
 * Sends a WhatsApp notification using the configured OpenWA server.
 * Returns true if sent successfully, throws an error if failed.
 */
export async function sendWhatsAppNotification(eventId: string, message: string): Promise<boolean> {
  const settings = whatsappSettingsRepository.getSettings();
  if (!settings || !settings.serverUrl || !settings.apiKey || !settings.sessionId || !settings.targetChatId) {
    throw new Error("WhatsApp settings are incomplete or not configured.");
  }

  if (whatsappCacheRepository.hasSent(eventId)) {
    // Already sent this specific notification
    return true; 
  }

  // Sanitize server URL
  const serverUrl = settings.serverUrl.replace(/\/$/, "");

  try {
    const response = await fetch(`${serverUrl}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": settings.apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        chatId: settings.targetChatId,
        text: message,
        session: settings.sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp server responded with status: ${response.status}`);
    }

    // Mark as sent in the idempotency cache
    whatsappCacheRepository.markSent(eventId);
    return true;
  } catch (error: any) {
    console.error("Failed to send WhatsApp notification:", error);
    if (error.message && error.message.includes("fetch")) {
      throw new Error("WhatsApp server unavailable");
    }
    throw new Error(error.message || "Failed to send notification");
  }
}
