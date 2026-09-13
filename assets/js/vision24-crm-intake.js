/* ============================================================
 * Vision 24 · CRM Intake Bridge
 * ============================================================
 * Fait remonter automatiquement chaque formulaire du site
 * dans le CRM (via /api/submit.php), sans changer le comportement
 * existant (formsubmit.co / redirection / email).
 *
 * Intercepte les formulaires à la volée : dès qu'un formulaire
 * possède prenom+nom+email, on POST une copie vers l'API CRM
 * en fire-and-forget (non-bloquant).
 * ============================================================ */
(function () {
  'use strict';

  const API_URL = 'https://vision24.fr/api/submit.php';

  function looksLikeVision24Form(form) {
    if (!form) return false;
    const hasPrenom = !!form.querySelector('[name="prenom"], [name="firstname"], [name="first_name"]');
    const hasNom    = !!form.querySelector('[name="nom"], [name="lastname"], [name="last_name"]');
    const hasEmail  = !!form.querySelector('[name="email"], [type="email"]');
    return hasPrenom && hasNom && hasEmail;
  }

  function sourceFromLocation() {
    const host = (location.hostname || '').toLowerCase();
    if (host.includes('vision24.fun')) return 'vision24.fun';
    if (host.includes('vision24.fr'))  return 'vision24.fr';
    return host || 'unknown';
  }

  function pathHint() {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.slice(-2).join('/') || 'accueil';
  }

  function buildPayload(form) {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => {
      if (k in data) {
        if (Array.isArray(data[k])) data[k].push(v);
        else data[k] = [data[k], v];
      } else data[k] = v;
    });
    data.source = data.source || sourceFromLocation();
    data.pageOrigine = pathHint();
    data.userAgent = navigator.userAgent.slice(0, 200);
    return data;
  }

  function sendToCRM(form) {
    try {
      const data = buildPayload(form);
      const body = JSON.stringify(data);
      // Priorité : sendBeacon (100% garanti de partir avant le unload)
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        const ok = navigator.sendBeacon(API_URL, blob);
        if (ok) return;
      }
      // Fallback : fetch keepalive
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
        mode: 'cors',
        credentials: 'omit',
      }).catch(() => {});
    } catch (e) {
      console.warn('[Vision24 CRM] intake failed', e);
    }
  }

  function attach(form) {
    if (form.__v24Bound) return;
    form.__v24Bound = true;
    // Envoi au CRM dès le submit (avant que la page ne navigue)
    form.addEventListener('submit', function () {
      try { sendToCRM(form); } catch (_) {}
    }, { capture: true });
    // Filet de sécurité : envoi aussi juste avant unload si formulaire touché
    let touched = false;
    form.addEventListener('input', () => { touched = true; }, { capture: true });
    window.addEventListener('beforeunload', function () {
      // Seulement si le formulaire a été touché ET que le submit vient de se produire
      if (touched && form.__v24Submitted) {
        try { sendToCRM(form); } catch (_) {}
      }
    });
    form.addEventListener('submit', () => { form.__v24Submitted = true; }, { capture: true });
  }

  function scanForms() {
    document.querySelectorAll('form').forEach(f => {
      if (looksLikeVision24Form(f)) attach(f);
    });
  }

  // Scan initial + observation des ajouts dynamiques
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanForms);
  } else {
    scanForms();
  }

  if (window.MutationObserver) {
    new MutationObserver(scanForms).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
