document.querySelectorAll("[data-kolibri]").forEach((link) => {
  link.href = `${location.protocol}//${location.hostname}:8889`;
});

const here = document.querySelector("[data-here]");
if (here) here.textContent = location.origin;
