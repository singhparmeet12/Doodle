/**
 * Scribbleverse Gallery Lightbox
 * Displays large-format doodle inspection with caption, date, character badge, and smooth close.
 */

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxContent = document.getElementById('lightbox-body');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const doodleCards = document.querySelectorAll('.scrapbook-polaroid-item');

  if (!lightbox) return;

  function openLightbox(card) {
    const title = card.getAttribute('data-title') || 'Doodle';
    const caption = card.getAttribute('data-caption') || '';
    const character = card.getAttribute('data-character') || '';
    const date = card.getAttribute('data-date') || '';
    const svgEl = card.querySelector('.polaroid-art-stage svg');
    const imgEl = card.querySelector('.polaroid-art-stage img');

    let visualContent = '';
    if (svgEl) {
      visualContent = svgEl.outerHTML;
    } else if (imgEl) {
      visualContent = `<img src="${imgEl.src}" alt="${escapeHtml(title)}" style="max-height: 420px; margin: 0 auto;">`;
    }

    if (lightboxContent) {
      lightboxContent.innerHTML = `
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          <span class="badge-tag">${escapeHtml(character)}</span>
        </div>
        <div class="polaroid-art-stage" style="padding: 24px; min-height: 300px;">
          ${visualContent}
        </div>
        <h3 style="margin-block: 14px 6px; font-size: 1.8rem; text-align: center;">${escapeHtml(title)}</h3>
        <p class="polaroid-caption" style="text-align: center; font-size: 1.4rem;">"${escapeHtml(caption)}"</p>
        <div style="text-align: center; font-size: 0.9rem; color: var(--ink-muted); margin-top: 10px;">
          🗓️ Added to sketchbook on ${escapeHtml(date)}
        </div>
      `;
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  doodleCards.forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
