window.addEventListener("DOMContentLoaded", () => {
  console.log("自己紹介サイトへようこそ！");
});

/* =============================
   Common Interactive Script
   - Dynamic header offset
   - Hamburger toggle & accessibility
   - Current page nav highlight
   - Slider (index)
   - Lightbox (index images)
   - Focus trap in lightbox
============================= */
(function () {
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  function adjustOffset() {
    if (!header || !main) return;
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty(
      "--dynamic-header-height",
      h + "px"
    );
    if (!main.dataset.manualTop) {
      main.style.marginTop = `calc(${h}px + var(--header-extra-space, 40px))`;
    }
  }
  window.addEventListener("load", adjustOffset, { passive: true });
  window.addEventListener("resize", adjustOffset);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(adjustOffset);
  }
})();

(function () {
  const hamburger = document.getElementById("hamburger-menu");
  const navMobile = document.getElementById("nav-mobile");
  if (!hamburger || !navMobile) return;
  if (!hamburger.getAttribute("role")) {
    hamburger.setAttribute("role", "button");
    hamburger.setAttribute("aria-label", "メニューを開閉");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-controls", "nav-mobile");
  }
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = navMobile.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open); // 追加
  });
  navMobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navMobile.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open"); // 追加
    });
  });
  document.addEventListener("click", (e) => {
    if (
      navMobile.classList.contains("open") &&
      !navMobile.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navMobile.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open"); // 追加
    }
  });
})();

// Current page highlight
(function () {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a, .nav-mobile a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) {
      a.setAttribute("aria-current", "page");
    }
  });
})();

// Slider (only if present)
(function () {
  const slider = document.querySelector(".slider");
  if (!slider) return;
  const images = slider.querySelectorAll("img");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");
  if (!images.length || !prevBtn || !nextBtn) return;
  let current = 0;
  function update() {
    slider.style.transform = `translateX(${
      -current * (images[0].clientWidth + 20)
    }px)`;
  }
  prevBtn.addEventListener("click", () => {
    current = (current - 1 + images.length) % images.length;
    update();
  });
  nextBtn.addEventListener("click", () => {
    current = (current + 1) % images.length;
    update();
  });
  window.addEventListener("resize", update);
  update();
})();

// Lightbox (index images & any .lightbox-target)
(function () {
  const candidates = document.querySelectorAll(
    ".slider img, img.lightbox-target"
  );
  if (!candidates.length) return;
  let overlay = document.getElementById("lightbox");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.id = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `<div class="lightbox-content" role="document"><button class="lightbox-close" aria-label="閉じる">×</button><img class="lightbox-img" alt="" /><div class="lightbox-caption"></div></div>`;
    document.body.appendChild(overlay);
  }
  const imgEl = overlay.querySelector(".lightbox-img");
  const capEl = overlay.querySelector(".lightbox-caption");
  const closeBtn = overlay.querySelector(".lightbox-close");
  let lastFocus = null;

  function open(src, alt, caption) {
    lastFocus = document.activeElement;
    imgEl.src = src;
    imgEl.alt = alt || caption || "";
    capEl.textContent = caption || alt || "";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  candidates.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () =>
      open(img.src, img.alt, img.dataset.caption)
    );
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
    if (e.key === "Tab" && overlay.classList.contains("open")) {
      const focusables = overlay.querySelectorAll(
        'button, [href], img, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled")
      );
      if (!list.length) return;
      const first = list[0],
        last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
