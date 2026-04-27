<script lang="ts">
  let { onclose }: { onclose: () => void } = $props();
  let casual = $state(true);
</script>

<div class="panel">
  <div class="panel-header">
    <h2>How it works</h2>
    <div class="header-actions">
      <button
          type="button"
          class="tone-toggle"
          onclick={() => (casual = !casual)}
          title={casual ? "Switch to plain mode" : "Switch to fun mode"}
        >{casual ? "no cap" : "straight talk"}</button>
      <button type="button" onclick={onclose}>← Back</button>
    </div>
  </div>

  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div>
        {#if casual}
          <p class="step-title">Quick mute — always up top</p>
          <p class="step-body">
            Hit <strong>5m</strong>, <strong>15m</strong>, <strong>30m</strong>,
            <strong>1h</strong>, or <strong>2h</strong> to silence your current tab for that long.
            Use <strong>∞</strong> to mute it indefinitely — for tabs that just won't quit.
          </p>
        {:else}
          <p class="step-title">Quick mute</p>
          <p class="step-body">
            Select a preset duration (<strong>5m</strong>, <strong>15m</strong>, <strong>30m</strong>,
            <strong>1h</strong>, <strong>2h</strong>) or <strong>∞</strong> to mute the active tab immediately.
          </p>
        {/if}
      </div>
    </div>

    <div class="step">
      <div class="step-num">2</div>
      <div>
        {#if casual}
          <p class="step-title">Mute specific tabs</p>
          <p class="step-body">
            Open the <strong>Mute tabs</strong> view → pick a duration → click the tabs you want
            silenced → hit the button to apply. Already-muted tabs are greyed out
            — you can't double-mute them, we checked.
          </p>
        {:else}
          <p class="step-title">Mute specific tabs</p>
          <p class="step-body">
            In the <strong>Mute tabs</strong> view, select a duration, check the tabs to mute,
            then confirm. Already-muted tabs are disabled.
          </p>
        {/if}
      </div>
    </div>

    <div class="step">
      <div class="step-num">3</div>
      <div>
        {#if casual}
          <p class="step-title">See what you've silenced</p>
          <p class="step-body">
            Open the <strong>Active</strong> view to see every muted tab with a live countdown. Hit
            <strong>Let it speak</strong> any time to restore audio early.
          </p>
        {:else}
          <p class="step-title">Active mutes</p>
          <p class="step-body">
            The <strong>Active</strong> view lists all muted tabs with expiry countdowns.
            Click <strong>Let it speak</strong> to restore audio before the timer ends.
          </p>
        {/if}
      </div>
    </div>

    <div class="step">
      <div class="step-num">4</div>
      <div>
        {#if casual}
          <p class="step-title">Auto-unmute (hands-free)</p>
          <p class="step-body">
            When a timer runs out, the tab unmutes itself and you'll get a desktop notification.
            Mute sessions survive browser restarts, too — we know you close and reopen constantly.
          </p>
        {:else}
          <p class="step-title">Auto-unmute</p>
          <p class="step-body">
            When a mute expires, audio is restored automatically and a desktop notification fires.
            Mute state is persisted across browser restarts.
          </p>
        {/if}
      </div>
    </div>

    <div class="tip">
      <span class="tip-icon">💡</span>
      {#if casual}
        <p>
          Pro move: mute a tab <em>before</em> it has anything to say. It'll stay silent when audio
          starts — perfect for preemptively silencing autoplaying content. Your future self will
          thank you.
        </p>
      {:else}
        <p>
          Tabs can be muted before audio starts. The mute persists when audio begins, blocking autoplay.
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .panel-header {
    padding: 0.625rem 1rem;
    border-bottom: 1px solid var(--c-gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--c-gray-50);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .tone-toggle {
    background-color: var(--c-gray-100);
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--c-gray-500);
    cursor: pointer;
    padding: 0.25rem 0.625rem;
    letter-spacing: 0.03em;
    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
    font-family: inherit;
  }

  .tone-toggle:hover {
    background-color: var(--c-primary-bg);
    border-color: var(--c-primary);
    color: var(--c-primary);
  }

  .tone-toggle:active {
    opacity: 0.8;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--c-gray-700);
  }

  .panel-header button {
    background: none;
    border: none;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--c-primary);
    cursor: pointer;
    transition: color 0.15s;
    padding: 0;
  }

  .panel-header button:hover {
    color: var(--c-primary-hover);
  }

  .steps {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    display: flex;
    gap: 0.75rem;
  }

  .step-num {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 9999px;
    background-color: var(--c-primary-bg);
    color: var(--c-primary);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .step-title {
    margin: 0 0 0.125rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--c-gray-700);
  }

  .step-body {
    margin: 0;
    font-size: 0.75rem;
    color: var(--c-gray-500);
    line-height: 1.625;
  }

  .step-body strong {
    color: var(--c-gray-700);
    font-weight: 500;
  }

  .tip {
    border-radius: 0.5rem;
    background-color: var(--c-amber-bg);
    border: 1px solid var(--c-amber-border);
    padding: 0.625rem 0.75rem;
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
  }

  .tip-icon {
    font-size: 1rem;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .tip p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--c-amber-text);
    line-height: 1.625;
  }
</style>
