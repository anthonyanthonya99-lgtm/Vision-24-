/* =========================================================
   Formulaires devis — envoi via FormSubmit + confirmation inline
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("devis-form");
  if (!form) return;

  const success = document.getElementById("devis-success");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.innerHTML : "";

  // Zone d'erreur inline créée à la volée
  let errorBox = form.querySelector(".form-error");
  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.className = "form-error";
    errorBox.setAttribute("role", "alert");
    errorBox.style.cssText =
      "display:none; margin-top:1rem; padding:0.9rem 1.1rem; background:#fde8e8; " +
      "color:#7d1a30; border:1px solid #7d1a30; border-radius:10px; font-size:0.9rem; " +
      "text-align:center;";
    form.appendChild(errorBox);
  }

  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  };
  const hideError = () => {
    errorBox.style.display = "none";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    // Honeypot anti-spam : si rempli, un bot est passé → on stoppe silencieusement
    const honey = form.querySelector('input[name="_honey"]');
    if (honey && honey.value.trim() !== "") return;

    // Validation des champs obligatoires
    const required = form.querySelectorAll("[required]");
    let ok = true;
    let firstInvalid = null;
    required.forEach((f) => {
      const valid = f.type === "checkbox" || f.type === "radio"
        ? form.querySelector(`[name="${f.name}"]:checked`) !== null
        : f.value.trim() !== "";
      if (!valid) {
        f.style.borderColor = "#7d1a30";
        if (!firstInvalid) firstInvalid = f;
        ok = false;
      } else {
        f.style.borderColor = "";
      }
    });
    if (!ok) {
      showError("Merci de remplir tous les champs obligatoires.");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.7;
    submitBtn.innerHTML = "Envoi en cours…";

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.style.display = "none";
        if (success) {
          success.classList.add("is-shown");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      } else {
        throw new Error("Erreur serveur (" + res.status + ")");
      }
    } catch (err) {
      showError(
        "L'envoi a échoué. Vérifiez votre connexion et réessayez, ou contactez-nous directement."
      );
      submitBtn.disabled = false;
      submitBtn.style.opacity = 1;
      submitBtn.innerHTML = originalLabel;
    }
  });
});
