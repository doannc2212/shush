<script lang="ts">
  import { onMount } from "svelte";
  import type { MutedTab } from "../../types/index.ts";

  let { mutedTabs }: { mutedTabs: MutedTab[] } = $props();

  let now = $state(Date.now());

  onMount(() => {
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });

  function formatRemaining(ms: number): string {
    if (ms <= 0) return "Done soon…";
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function countdownClass(expiresAt: number | null): string {
    if (expiresAt === null) return "time-infinite";
    const ms = expiresAt - now;
    if (ms < 60_000) return "time-urgent";
    if (ms < 5 * 60_000) return "time-warning";
    return "time-normal";
  }

  function handleUnmute(tabId: number) {
    chrome.runtime.sendMessage({ type: "UNMUTE_TAB", tabId });
  }
</script>

{#if mutedTabs.length === 0}
  <div class="empty">
    <div class="empty-icon">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    </div>
    <p class="empty-title">All clear — nothing muted yet.</p>
    <p class="empty-body">
      Use the buttons above to shush your current tab, or pick specific tabs
      from the Mute tabs view. We won't judge how many you silence.
    </p>
  </div>
{:else}
  <ul class="list">
    {#each mutedTabs as tab (tab.tabId)}
      <li class="item">
        {#if tab.favIconUrl}
          <img src={tab.favIconUrl} alt="" class="favicon" />
        {:else}
          <div class="favicon-placeholder"></div>
        {/if}

        <div class="info">
          <p class="title">{tab.title}</p>
          <p class="countdown {countdownClass(tab.expiresAt)}">
            {tab.expiresAt !== null ? formatRemaining(tab.expiresAt - now) : "∞"}
          </p>
        </div>

        <button
          type="button"
          onclick={() => handleUnmute(tab.tabId)}
          class="btn-unmute"
        >Let it speak</button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 10rem;
    padding: 0 2rem;
    text-align: center;
  }

  .empty-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 9999px;
    background-color: var(--c-gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--c-gray-500);
  }

  .empty-body {
    margin: 0;
    font-size: 0.75rem;
    color: var(--c-gray-400);
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--c-gray-50);
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

  .info {
    flex: 1;
    min-width: 0;
  }

  .title {
    margin: 0;
    font-size: 0.875rem;
    color: var(--c-gray-800);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.375;
  }

  .countdown {
    margin: 0.125rem 0 0;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.375;
    font-variant-numeric: tabular-nums;
  }

  .time-normal {
    color: var(--c-primary);
  }

  .time-warning {
    color: #f59e0b;
  }

  .time-urgent {
    color: var(--c-danger);
  }

  .time-infinite {
    color: var(--c-gray-400);
  }

  .btn-unmute {
    flex-shrink: 0;
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    background-color: var(--c-danger-bg);
    color: var(--c-danger-soft);
    border: 1px solid var(--c-danger-border);
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .btn-unmute:hover {
    background-color: #fee2e2;
  }
</style>
