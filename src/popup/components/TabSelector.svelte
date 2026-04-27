<script lang="ts">
  import { onMount } from "svelte";
  import { PRESET_DURATIONS } from "../../types/index.ts";
  import type { MutedTab } from "../../types/index.ts";

  let { mutedTabs }: { mutedTabs: MutedTab[] } = $props();

  type TabWithId = chrome.tabs.Tab & { id: number };

  let allTabs = $state<TabWithId[]>([]);
  let selected = $state(new Set<number>());
  let durationMinutes = $state<number | null>(30);

  let mutedIds = $derived(new Set(mutedTabs.map((t) => t.tabId)));

  let durationLabel = $derived(
    durationMinutes === null
      ? "indefinitely"
      : durationMinutes >= 60
        ? `${durationMinutes / 60}h`
        : `${durationMinutes}m`,
  );

  onMount(() => {
    chrome.tabs.query({}, (tabs) => {
      allTabs = tabs.filter((t): t is TabWithId => t.id !== undefined);
    });
  });

  function toggle(tabId: number) {
    if (mutedIds.has(tabId)) return;
    const next = new Set(selected);
    next.has(tabId) ? next.delete(tabId) : next.add(tabId);
    selected = next;
  }

  function muteSelected() {
    if (selected.size === 0) return;
    chrome.runtime.sendMessage({ type: "MUTE_TABS", tabIds: [...selected], durationMinutes });
    selected = new Set();
  }

  function getDomain(url: string | undefined): string {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }
</script>

<div class="view">
  <div class="duration-picker">
    <p class="picker-label">How long?</p>
    <div class="pills">
      {#each PRESET_DURATIONS as d (d.minutes)}
        <button
          type="button"
          onclick={() => (durationMinutes = d.minutes)}
          class="pill"
          class:active={durationMinutes === d.minutes}
        >{d.label}</button>
      {/each}
      <button
        type="button"
        onclick={() => (durationMinutes = null)}
        class="pill"
        class:active={durationMinutes === null}
        title="Mute forever (or until you change your mind)"
      >∞</button>
    </div>
  </div>

  <div class="tab-list">
    {#if allTabs.length === 0}
      <div class="loading">
        <p>Loading your tabs…</p>
      </div>
    {:else}
      <ul class="list">
        {#each allTabs as tab (tab.id)}
          {@const isMuted = mutedIds.has(tab.id)}
          {@const isSelected = selected.has(tab.id)}
          {@const domain = getDomain(tab.url)}
          <li>
            <button
              type="button"
              disabled={isMuted}
              onclick={() => toggle(tab.id)}
              class="tab-row"
              class:is-muted={isMuted}
              class:is-selected={isSelected}
            >
              <div class="checkbox" class:checked={isSelected}>
                {#if isSelected}
                  <svg
                    aria-hidden="true"
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                    stroke="white"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="1,3.5 3.5,6 8,1" />
                  </svg>
                {/if}
              </div>

              {#if tab.favIconUrl}
                <img src={tab.favIconUrl} alt="" class="favicon" />
              {:else}
                <div class="favicon-placeholder"></div>
              {/if}

              <div class="tab-info">
                <p class="tab-title">{tab.title ?? tab.url ?? "Untitled tab"}</p>
                {#if domain}
                  <p class="tab-domain">{domain}</p>
                {/if}
              </div>

              {#if isMuted}
                <span class="muted-badge">muted</span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if selected.size > 0}
    <div class="cta">
      <button type="button" onclick={muteSelected} class="btn-mute">
        Shush {selected.size} tab{selected.size > 1 ? "s" : ""} for {durationLabel}
      </button>
    </div>
  {/if}
</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .duration-picker {
    padding: 0.625rem 1rem;
    border-bottom: 1px solid var(--c-gray-100);
    flex-shrink: 0;
  }

  .picker-label {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--c-gray-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .pill {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    border: 1px solid var(--c-gray-200);
    background-color: #fff;
    color: var(--c-gray-500);
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
  }

  .pill:hover {
    border-color: var(--c-primary-border);
    color: var(--c-primary);
  }

  .pill.active {
    background-color: var(--c-primary);
    color: #fff;
    border-color: var(--c-primary);
  }

  .tab-list {
    flex: 1;
    overflow-y: auto;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 8rem;
    color: var(--c-gray-400);
    font-size: 0.875rem;
  }

  .loading p {
    margin: 0;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tab-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    text-align: left;
    background: none;
    border: none;
    border-bottom: 1px solid var(--c-gray-50);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .tab-row:hover:not(:disabled) {
    background-color: var(--c-gray-50);
  }

  .tab-row.is-selected {
    background-color: var(--c-primary-bg);
  }

  .tab-row.is-muted {
    opacity: 0.4;
    cursor: default;
  }

  .checkbox {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    border-radius: 0.25rem;
    border: 2px solid var(--c-gray-300);
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s, border-color 0.15s;
  }

  .checkbox.checked {
    background-color: var(--c-primary);
    border-color: var(--c-primary);
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

  .tab-info {
    flex: 1;
    min-width: 0;
  }

  .tab-title {
    margin: 0;
    font-size: 0.875rem;
    color: var(--c-gray-700);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.375;
  }

  .tab-domain {
    margin: 0;
    font-size: 0.75rem;
    color: var(--c-gray-400);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.375;
  }

  .muted-badge {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    background-color: var(--c-danger-bg);
    color: var(--c-danger-soft);
  }

  .cta {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--c-gray-100);
    background-color: #fff;
    flex-shrink: 0;
  }

  .btn-mute {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #fff;
    border-radius: 0.5rem;
    background-color: var(--c-primary);
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .btn-mute:hover {
    background-color: var(--c-primary-hover);
  }
</style>
