<script lang="ts">
import { onMount } from "svelte";
import type { MutedTab } from "../types/index.ts";
import ActiveMutes from "./components/ActiveMutes.svelte";
import HelpPanel from "./components/HelpPanel.svelte";
import QuickMute from "./components/QuickMute.svelte";
import TabSelector from "./components/TabSelector.svelte";

let mutedTabs = $state<MutedTab[]>([]);
let view = $state<"mute" | "active">("mute");
let showHelp = $state(false);
let popupEl = $state<HTMLElement | null>(null);
const viewHeights: Record<string, number> = {};

$effect(() => {
  if (!popupEl) return;
  const ro = new ResizeObserver(() => {
    if (popupEl) viewHeights[view] = popupEl.offsetHeight;
  });
  ro.observe(popupEl);
  return () => ro.disconnect();
});

function switchView(newView: "mute" | "active") {
  const h = viewHeights[newView];
  if (h && popupEl) popupEl.style.height = `${h}px`;
  view = newView;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (popupEl) popupEl.style.height = "";
    });
  });
}

onMount(() => {
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (res: { mutedTabs?: MutedTab[] }) => {
    if (res?.mutedTabs) mutedTabs = res.mutedTabs;
  });

  const onMessage = (msg: { type?: string; mutedTabs?: MutedTab[] }) => {
    if (msg.type === "STATE_UPDATE" && msg.mutedTabs) {
      mutedTabs = msg.mutedTabs;
    }
  };
  chrome.runtime.onMessage.addListener(onMessage);
  return () => chrome.runtime.onMessage.removeListener(onMessage);
});
</script>

<div class="popup" bind:this={popupEl}>
  <header>
    <div class="brand">
      <div class="brand-icon">
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="white" stroke="white" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </div>
      <div>
        <h1>Shush</h1>
        <p>Silence, on your terms.</p>
      </div>
    </div>
    <button
      type="button"
      onclick={() => (showHelp = !showHelp)}
      title={showHelp ? "Close help" : "How it works"}
      class="help-btn"
      class:active={showHelp}
    >
      ?
    </button>
  </header>

  {#if showHelp}
    <HelpPanel onclose={() => (showHelp = false)} />
  {:else}
    <QuickMute {mutedTabs} />

    <nav>
      <button type="button" onclick={() => switchView("mute")} class:active={view === "mute"}>
        Mute tabs
      </button>
      <button type="button" onclick={() => switchView("active")} class:active={view === "active"}>
        Active
        {#if mutedTabs.length > 0}
          <span class="badge">{mutedTabs.length}</span>
        {/if}
      </button>
    </nav>

    <div class="content">
      <div hidden={view !== "mute"}><TabSelector {mutedTabs} /></div>
      <div hidden={view !== "active"}><ActiveMutes {mutedTabs} /></div>
    </div>
  {/if}
</div>

<style>
.popup {
  width: 380px;
  min-height: 300px;
  max-height: 580px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

header {
  padding: 0.75rem 1rem;
  background-color: var(--c-primary);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.brand-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand h1 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.25;
}

.brand p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--c-primary-text-soft);
  line-height: 1.25;
}

.help-btn {
  margin-top: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
  background-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.help-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.help-btn.active {
  background-color: #fff;
  color: var(--c-primary);
}

nav {
  display: flex;
  border-bottom: 1px solid var(--c-gray-200);
  flex-shrink: 0;
}

nav button {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
  color: var(--c-gray-500);
}

nav button:hover {
  color: var(--c-gray-700);
}

nav button.active {
  border-bottom-color: var(--c-primary);
  color: var(--c-primary);
}

.badge {
  display: inline-block;
  margin-left: 0.375rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background-color: var(--c-primary-bg);
  color: var(--c-primary);
}

.content {
  flex: 1;
  overflow-y: auto;
}
</style>
