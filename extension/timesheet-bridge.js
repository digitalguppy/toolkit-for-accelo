(() => {
  'use strict';
  if (location.origin !== 'https://digitalguppy.accelo.com' || new URL(location.href).searchParams.get('action') !== 'timesheet_entry' || globalThis.ToolkitTimerBridge) return;
  globalThis.ToolkitTimerBridge = true;
  const recent = new Map();
  document.addEventListener('click', event => {
    // No externally supplied timer arguments and no background starts. Resolve
    // the current row afresh for a genuine click on the visible shortcut.
    const button = event.target.closest?.('button.tka-timesheet-timer');
    if (!event.isTrusted || !button || !button.isConnected || button.disabled) return;
    event.preventDefault(); event.stopPropagation();
    const cell = button.closest('td.ts_against_cell');
    const timer = globalThis.ToolkitTimesheet?.identify(cell);
    if (!timer || !cell.querySelector('.ts_against_mask')) return;
    const key = timer.engagement.table + ':' + timer.engagement.id;
    const now = Date.now();
    if (now - (recent.get(key) || 0) < 1500) return;
    let start;
    try {
      if (globalThis.$AL?.has_feature('timers_update_beta')) {
        if (typeof globalThis.$AL.trigger !== 'function') throw new Error('Timer unavailable');
        start = () => globalThis.$AL.trigger('accelo.startOrResumeTimer', timer);
      } else {
        const service = globalThis.angular?.element(document.body).injector()?.get('alTimers');
        if (typeof service?.start_or_resume !== 'function') throw new Error('Timer unavailable');
        start = () => service.start_or_resume(timer);
      }
      recent.set(key, now); button.disabled = true;
      button.title = 'Starting or resuming timer...';
      start();
      // Native timer handlers return no promise. Accelo's timer drawer owns
      // success/error feedback; do not claim success merely on dispatch.
      setTimeout(() => {
        if (!button.isConnected) return;
        button.disabled = false; button.title = 'Start or resume timer';
      }, 1500);
    } catch {
      button.disabled = false;
      button.title = 'Could not start the timer. Refresh Accelo and try again.';
      button.setAttribute('aria-label', button.title);
    }
  }, true);
})();
