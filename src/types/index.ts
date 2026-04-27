export interface MutedTab {
  tabId: number;
  title: string;
  favIconUrl: string;
  url: string;
  mutedAt: number;
  expiresAt: number | null; // null = muted indefinitely
  alarmName: string | null;
}

export const PRESET_DURATIONS = [
  { label: "5m", minutes: 5 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
] as const;

export type MessageToBackground =
  | { type: "MUTE_TABS"; tabIds: number[]; durationMinutes: number | null }
  | { type: "UNMUTE_TAB"; tabId: number }
  | { type: "GET_STATE" };

export type MessageFromBackground = { type: "STATE_UPDATE"; mutedTabs: MutedTab[] };
