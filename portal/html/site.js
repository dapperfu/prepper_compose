document.querySelectorAll("[data-kolibri]").forEach((link) => {
  link.href = `${location.protocol}//${location.hostname}:8889`;
});

document.querySelectorAll("[data-ollama]").forEach((link) => {
  link.href = `${location.protocol}//${location.hostname}:8892`;
});

const here = document.querySelector("[data-here]");
if (here) here.textContent = location.origin;
