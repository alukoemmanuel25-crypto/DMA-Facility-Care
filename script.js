const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const year = document.querySelector("[data-year]");
const quoteForm = document.querySelector(".quote-form");
const quoteDraftKey = "dma-quote-draft";

const trackEvent = (name, parameters = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...parameters });
  window.dispatchEvent(new CustomEvent("dma:track", { detail: { name, parameters } }));
};

if (year) {
  year.textContent = new Date().getFullYear();
}

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

navMenu?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation menu");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navMenu?.classList.contains("is-open")) {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation menu");
    navToggle?.focus();
  }
});

document.querySelectorAll("a[href^='tel:']").forEach((link) => {
  link.addEventListener("click", () => trackEvent("phone_click", { link_url: link.href }));
});

document.querySelectorAll("a[href^='mailto:']").forEach((link) => {
  link.addEventListener("click", () => trackEvent("email_click", { link_url: link.href }));
});

document.querySelectorAll("[data-track='free_walkthrough_click']").forEach((link) => {
  link.addEventListener("click", () => trackEvent("free_walkthrough_click"));
});

if (quoteForm) {
  try {
    const draft = JSON.parse(sessionStorage.getItem(quoteDraftKey) || "{}");
    Object.entries(draft).forEach(([name, value]) => {
      const field = quoteForm.elements.namedItem(name);
      if (field && typeof value === "string") field.value = value;
    });
  } catch {
    sessionStorage.removeItem(quoteDraftKey);
  }

  const saveQuoteDraft = () => {
    const draft = Object.fromEntries(new FormData(quoteForm).entries());
    sessionStorage.setItem(quoteDraftKey, JSON.stringify(draft));
  };
  quoteForm.addEventListener("input", saveQuoteDraft);
  quoteForm.addEventListener("change", saveQuoteDraft);
}

if (window.location.pathname.includes("cleaning-london-ontario")) {
  trackEvent("service_page_view", { page_path: window.location.pathname });
}

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector("button[type='submit']");
  const originalText = button.textContent;

  if (status) {
    status.textContent = "Sending your quote request...";
    status.classList.remove("is-error", "is-success");
  }

  button.disabled = true;
  button.textContent = "Sending...";

  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("The quote request could not be sent.");
      }

      form.reset();
      sessionStorage.removeItem(quoteDraftKey);
      trackEvent("quote_form_submit", { form_id: form.id });
      if (status) {
        status.textContent = "Thank you. Your quote request has been sent to DMA Facility Care.";
        status.classList.add("is-success");
      }
    })
    .catch(() => {
      if (status) {
        status.textContent = "We could not send your request. Please try again or call 647-556-6948.";
        status.classList.add("is-error");
      }
    })
    .finally(() => {
      button.disabled = false;
      button.textContent = originalText;
    });
});
