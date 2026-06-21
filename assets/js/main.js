/* === Modal === */
class Modal {
  constructor() {
    this.overlay = null;
    this.content = null;
    this.onPrev = null;
    this.onNext = null;
    this._keyHandler = null;
  }

  open(html, { onPrev, onNext } = {}) {
    if (this.overlay) this.close();
    this.onPrev = onPrev || null;
    this.onNext = onNext || null;

    this.overlay = document.createElement("div");
    this.overlay.className = "modal-overlay";
    this.content = document.createElement("div");
    this.content.className = "modal-content";

    const navFooter = (onPrev || onNext) ? `
      <div class="modal-nav-footer">
        ${onPrev ? '<span class="nav-btn modal-prev-btn">← 上一个</span>' : '<span></span>'}
        ${onNext ? '<span class="nav-btn modal-next-btn">下一个 →</span>' : '<span></span>'}
      </div>` : '';

    this.content.innerHTML = `
      <div class="modal-header">
        <span class="modal-close" title="关闭 (ESC)"></span>
        <span class="modal-header-title">项目详情</span>
      </div>
      <div class="modal-body">${html}</div>
      ${navFooter}
    `;
    this.overlay.appendChild(this.content);
    document.body.appendChild(this.overlay);

    // Close handlers
    this.content.querySelector(".modal-close").onclick = () => this.close();
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Prev/Next buttons
    const prevBtn = this.content.querySelector(".modal-prev-btn");
    const nextBtn = this.content.querySelector(".modal-next-btn");
    if (prevBtn && onPrev) prevBtn.onclick = (e) => { e.stopPropagation(); onPrev(); };
    if (nextBtn && onNext) nextBtn.onclick = (e) => { e.stopPropagation(); onNext(); };

    // Keyboard handler
    document.addEventListener("keydown", this._keyHandler = (e) => {
      if (e.key === "Escape") { this.close(); }
      else if (e.key === "ArrowLeft" && this.onPrev) { e.preventDefault(); this.onPrev(); }
      else if (e.key === "ArrowRight" && this.onNext) { e.preventDefault(); this.onNext(); }
    });
    document.body.style.overflow = "hidden";
  }

  close() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.content = null;
      this.onPrev = null;
      this.onNext = null;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this._keyHandler);
    }
  }
}

/* === Category Filter === */
function initFilter(filterBarSelector, cardSelector) {
  const filterBar = document.querySelector(filterBarSelector);
  if (!filterBar) return;

  // Check for URL param
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get("cat");
  if (urlCat) {
    filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    const target = filterBar.querySelector(`[data-category="${urlCat}"]`);
    if (target) { target.classList.add("active"); applyFilter(urlCat, cardSelector); return; }
  }

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.category, cardSelector);
  });
}

function applyFilter(cat, cardSelector) {
  document.querySelectorAll(cardSelector).forEach(card => {
    card.style.display = (cat === "all" || card.dataset.category === cat) ? "" : "none";
  });
  document.querySelectorAll(".project-section").forEach(section => {
    const visible = section.querySelectorAll(cardSelector + ':not([style*="display: none"])');
    section.style.display = visible.length > 0 ? "" : "none";
  });
}

/* === Expand/Collapse === */
function initExpandable(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.addEventListener("click", (e) => {
    const toggle = e.target.closest(".expand-toggle");
    if (!toggle) return;
    const card = toggle.closest(".timeline-card");
    const body = card.querySelector(".expand-body");
    const arrow = toggle.querySelector(".expand-arrow");
    const wasHidden = body.style.display === "none" || !body.style.display;
    body.style.display = wasHidden ? "block" : "none";
    arrow.textContent = wasHidden ? "▼" : "▶";
    arrow.classList.toggle("open", wasHidden);
  });
}

/* === Image Lightbox === */
function initLightbox() {
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".modal-gallery img");
    if (!img) return;
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    const clone = document.createElement("img");
    clone.src = img.src;
    overlay.appendChild(clone);
    overlay.onclick = () => overlay.remove();
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", escHandler); }
    });
    document.body.appendChild(overlay);
  });
}

/* === Scroll Reveal === */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("visible");
    } else {
      observer.observe(el);
    }
  });
}

/* === Navbar Glass Effect === */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  });
}

/* === Init === */
document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initNavbarScroll();
});
