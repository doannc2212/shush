<script lang="ts">
import { onMount } from "svelte";
import type { MutedTab } from "../../types/index.ts";
import { PRESET_DURATIONS } from "../../types/index.ts";

let { mutedTabs }: { mutedTabs: MutedTab[] } = $props();

let currentTab = $state<chrome.tabs.Tab | null>(null);

onMount(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    currentTab = tab ?? null;
  });
});

let tabId = $derived(currentTab?.id);
let isMuted = $derived(tabId !== undefined && mutedTabs.some((m) => m.tabId === tabId));

function handleMute(minutes: number | null) {
  if (!tabId) return;
  chrome.runtime.sendMessage({ type: "MUTE_TABS", tabIds: [tabId], durationMinutes: minutes });
}

function handleUnmute() {
  if (!tabId) return;
  chrome.runtime.sendMessage({ type: "UNMUTE_TAB", tabId });
}
</script>

{#if currentTab?.id}
  <div class="section">
    <div class="label-row">
      <span class="dot" class:muted={isMuted}></span>
      <p class="label">This tab</p>
    </div>

    <div class="tab-info">
      {#if currentTab.favIconUrl}
        <img src={currentTab.favIconUrl} alt="" class="favicon">
      {:else}
        <div class="favicon-placeholder"></div>
      {/if}
      <span class="tab-title">{currentTab.title ?? currentTab.url}</span>
      {#if isMuted}
        <span class="muted-badge">muted</span>
      {/if}
    </div>

    {#if isMuted}
      <button type="button" onclick={handleUnmute} class="btn-unmute">Let it speak again</button>
    {:else}
      <div class="duration-pills">
        {#each PRESET_DURATIONS as d (d.minutes)}
          <button type="button" onclick={() => handleMute(d.minutes)} class="pill pill-primary">
            {d.label}
          </button>
        {/each}
        <button
          type="button"
          onclick={() => handleMute(null)}
          class="pill pill-gray"
          title="Mute forever (or until you change your mind)"
        >
          ∞
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
.section {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--c-gray-100);
  flex-shrink: 0;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  flex-shrink: 0;
  background-color: var(--c-success);
}

.dot.muted {
  background-color: var(--c-danger-soft);
}

.label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tab-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  min-width: 0;
}

.favicon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border-radius: 0.125rem;
}

.favicon-placeholder {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border-radius: 0.125rem;
  background-color: var(--c-gray-200);
}

.tab-title {
  font-size: 0.875rem;
  color: var(--c-gray-700);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.muted-badge {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  background-color: var(--c-danger-bg);
  color: var(--c-danger-soft);
}

.btn-unmute {
  width: 100%;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  background-color: var(--c-danger-bg);
  color: var(--c-danger);
  border: 1px solid var(--c-danger-border);
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-unmute:hover {
  background-color: #fee2e2;
}

.duration-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.pill {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid;
  cursor: pointer;
  transition: background-color 0.15s;
}

.pill-primary {
  background-color: var(--c-primary-bg);
  color: var(--c-primary);
  border-color: var(--c-primary-border);
}

.pill-primary:hover {
  background-color: var(--c-primary-border);
}

.pill-gray {
  background-color: var(--c-gray-100);
  color: var(--c-gray-500);
  border-color: var(--c-gray-200);
}

.pill-gray:hover {
  background-color: var(--c-gray-200);
}
</style>
