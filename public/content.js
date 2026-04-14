// Seed Extension — Content Script
// Injected into the active tab to fill form fields with generated data.

(function () {
  'use strict';

  // ─── Element resolution ────────────────────────────────────────────────────

  /**
   * Resolves a DOM element by selector type and value.
   * Returns the element or null if not found.
   */
  function resolveElement(selectorType, selectorValue) {
    try {
      switch (selectorType) {
        case 'id':
          return document.getElementById(selectorValue);
        case 'name':
          return document.querySelector(`[name="${selectorValue}"]`);
        case 'css':
          return document.querySelector(selectorValue);
        case 'xpath': {
          const result = document.evaluate(
            selectorValue,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          return result.singleNodeValue;
        }
        case 'data-attr': {
          // Expects format: "data-testid=submit" or "[data-cy=email]"
          const normalized = selectorValue.startsWith('[')
            ? selectorValue
            : `[${selectorValue}]`;
          return document.querySelector(normalized);
        }
        default:
          return document.querySelector(selectorValue);
      }
    } catch (e) {
      console.warn(`[Seed] Could not resolve element (${selectorType}: "${selectorValue}"):`, e);
      return null;
    }
  }

  // ─── Value injection (React / Vue / Angular safe) ─────────────────────────

  /**
   * Sets a value on an input/textarea in a way that triggers
   * framework synthetic events (React, Vue, Angular).
   */
  function setInputValue(el, value) {
    const tag = el.tagName.toLowerCase();

    if (tag === 'select') {
      // Find the option whose value or text matches
      const str = String(value);
      let matched = false;
      for (const opt of el.options) {
        if (opt.value === str || opt.text === str) {
          el.value = opt.value;
          matched = true;
          break;
        }
      }
      // Fallback: set by index if value looks numeric
      if (!matched && !isNaN(Number(str)) && el.options[Number(str)]) {
        el.selectedIndex = Number(str);
      }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    if (tag === 'input' && (el.type === 'checkbox' || el.type === 'radio')) {
      const checked = value === true || value === 'true' || value === 1;
      el.checked = checked;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    if (el.isContentEditable) {
      el.textContent = String(value);
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
      return;
    }

    // ── date / datetime-local: must be YYYY-MM-DD or YYYY-MM-DDTHH:MM ────────
    if (tag === 'input' && (el.type === 'date' || el.type === 'datetime-local')) {
      let d;
      if (value instanceof Date) {
        d = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        d = new Date(value);
      }

      let formatted = '';
      if (d && !isNaN(d.getTime())) {
        if (el.type === 'date') {
          // YYYY-MM-DD in local time (avoids UTC offset shifting the day)
          const yyyy = d.getFullYear();
          const mm   = String(d.getMonth() + 1).padStart(2, '0');
          const dd   = String(d.getDate()).padStart(2, '0');
          formatted  = `${yyyy}-${mm}-${dd}`;
        } else {
          // YYYY-MM-DDTHH:MM
          const yyyy = d.getFullYear();
          const mo   = String(d.getMonth() + 1).padStart(2, '0');
          const dd   = String(d.getDate()).padStart(2, '0');
          const hh   = String(d.getHours()).padStart(2, '0');
          const min  = String(d.getMinutes()).padStart(2, '0');
          formatted  = `${yyyy}-${mo}-${dd}T${hh}:${min}`;
        }
      } else {
        // Already in correct format (e.g. "1990-05-21")
        formatted = String(value);
      }

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(el, formatted);
      } else {
        el.value = formatted;
      }
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // Standard input / textarea — use native setter to bypass React's
    // synthetic event system so the framework's state updates correctly
    const proto = tag === 'textarea'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;

    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(el, String(value));
    } else {
      el.value = String(value);
    }

    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur',   { bubbles: true }));
  }

  // ─── Message handler ───────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const { type } = message;

    // Liveness check — lets the panel know the content script is active
    if (type === 'SEED_PING') {
      sendResponse({ type: 'SEED_PONG' });
      return true;
    }

    // Fill one record into the page
    if (type === 'SEED_INJECT_RECORD') {
      const { record, mappings } = message;
      const errors = [];

      for (const mapping of mappings) {
        const { selectorType, selectorValue, fieldId } = mapping;
        const value = record[fieldId];

        if (value === undefined || value === null) continue;

        const el = resolveElement(selectorType, selectorValue);
        if (!el) {
          errors.push(`Not found: ${selectorType}="${selectorValue}"`);
          continue;
        }

        try {
          setInputValue(el, value);
        } catch (e) {
          errors.push(`Fill error on ${selectorValue}: ${e.message}`);
        }
      }

      sendResponse({ type: 'SEED_INJECT_DONE', errors });
      return true;
    }

    // Click the submit button (used in auto-submit mode)
    if (type === 'SEED_SUBMIT_FORM') {
      const { submitSelector } = message;
      try {
        const btn = document.querySelector(submitSelector);
        if (btn) {
          btn.click();
          sendResponse({ type: 'SEED_SUBMIT_DONE', success: true });
        } else {
          sendResponse({ type: 'SEED_SUBMIT_DONE', success: false, error: `Submit button not found: "${submitSelector}"` });
        }
      } catch (e) {
        sendResponse({ type: 'SEED_SUBMIT_DONE', success: false, error: e.message });
      }
      return true;
    }
  });

  console.log('[Seed] Content script ready ✅');
})();
