import type {
  MessageFromBackground,
  MessageToBackground,
  MutedTab,
} from "../types/index.ts";

const STORAGE_KEY = "mutedTabs";
const ALARM_PREFIX = "shush:tab:";

// --- Storage helpers ---

async function getMutedTabs(): Promise<Record<string, MutedTab>> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as Record<string, MutedTab> | undefined) ?? {};
}

async function saveMutedTabs(tabs: Record<string, MutedTab>): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: tabs });
}

// --- Core actions ---

async function muteTab(
  tabId: number,
  durationMinutes: number | null,
): Promise<void> {
  let tab: chrome.tabs.Tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch {
    return; // Tab doesn't exist
  }

  await chrome.tabs.update(tabId, { muted: true });

  const now = Date.now();
  const expiresAt =
    durationMinutes !== null ? now + durationMinutes * 60 * 1000 : null;
  const alarmName = expiresAt !== null ? `${ALARM_PREFIX}${tabId}` : null;

  // Clear any previous alarm for this tab (e.g. re-muting with a new duration)
  const existing = (await getMutedTabs())[String(tabId)];
  if (existing?.alarmName) {
    await chrome.alarms.clear(existing.alarmName);
  }

  if (alarmName !== null && expiresAt !== null) {
    await chrome.alarms.create(alarmName, { when: expiresAt });
  }

  const mutedTabs = await getMutedTabs();
  mutedTabs[String(tabId)] = {
    tabId,
    title: tab.title ?? "Unknown Tab",
    favIconUrl: tab.favIconUrl ?? "",
    url: tab.url ?? "",
    mutedAt: now,
    expiresAt,
    alarmName,
  };
  await saveMutedTabs(mutedTabs);
  broadcastStateUpdate();
}

async function unmuteTab(tabId: number): Promise<void> {
  const mutedTabs = await getMutedTabs();
  const entry = mutedTabs[String(tabId)];

  if (entry?.alarmName) {
    await chrome.alarms.clear(entry.alarmName);
  }

  try {
    await chrome.tabs.update(tabId, { muted: false });
  } catch {
    // Tab is already closed — cleanup only
  }

  delete mutedTabs[String(tabId)];
  await saveMutedTabs(mutedTabs);
  broadcastStateUpdate();
}

function broadcastStateUpdate(): void {
  getMutedTabs().then((mutedTabs) => {
    const message: MessageFromBackground = {
      type: "STATE_UPDATE",
      mutedTabs: Object.values(mutedTabs),
    };
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup is closed — this is expected
    });
  });
}

// --- Event listeners ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;

  const tabId = Number(alarm.name.slice(ALARM_PREFIX.length));
  if (!Number.isFinite(tabId)) return;

  const mutedTabs = await getMutedTabs();
  const entry = mutedTabs[String(tabId)];
  if (!entry) return; // Already manually unmuted

  const title = entry.title;
  await unmuteTab(tabId);

  chrome.notifications.create(`shush:unmuted:${tabId}:${Date.now()}`, {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Shush",
    message: `"${title}" has been unmuted.`,
    silent: true,
  });
});

chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender, sendResponse) => {
    const handle = async (): Promise<unknown> => {
      switch (message.type) {
        case "MUTE_TABS":
          for (const id of message.tabIds) {
            await muteTab(id, message.durationMinutes);
          }
          return { ok: true };
        case "UNMUTE_TAB":
          await unmuteTab(message.tabId);
          return { ok: true };
        case "GET_STATE": {
          const mutedTabs = await getMutedTabs();
          return { mutedTabs: Object.values(mutedTabs) };
        }
      }
    };

    handle()
      .then(sendResponse)
      .catch((err) => {
        console.error("[shush] Message handler error:", err);
        sendResponse({ ok: false });
      });

    return true; // Keep channel open for async response
  },
);

// Re-apply mute state after browser restart (tabs may have lost their muted flag)
chrome.runtime.onStartup.addListener(async () => {
  const mutedTabs = await getMutedTabs();
  const now = Date.now();

  for (const [key, entry] of Object.entries(mutedTabs)) {
    const tabId = Number(key);

    if (entry.expiresAt !== null && entry.expiresAt <= now) {
      await unmuteTab(tabId);
      continue;
    }

    try {
      await chrome.tabs.update(tabId, { muted: true });
    } catch {
      // Tab no longer exists — clean up
      await unmuteTab(tabId);
    }
  }
});

// Clean up when a muted tab is closed by the user
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const mutedTabs = await getMutedTabs();
  const entry = mutedTabs[String(tabId)];
  if (!entry) return;

  if (entry.alarmName) {
    await chrome.alarms.clear(entry.alarmName);
  }

  delete mutedTabs[String(tabId)];
  await saveMutedTabs(mutedTabs);
  broadcastStateUpdate();
});
