/**
 * Scribbleverse Guestbook Interactions
 * Handles sticky note submission, validation, optimistic rendering, and moderation alert.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('guestbook-note-form');
  const wallGrid = document.getElementById('stickies-wall-grid');
  const statusMsg = document.getElementById('guestbook-status-msg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    if (statusMsg) {
      statusMsg.style.display = 'block';
      statusMsg.className = 'doodle-toast';
      statusMsg.textContent = 'Pinning your note to the wall... 📌';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (statusMsg) {
          statusMsg.className = 'doodle-toast success';
          statusMsg.innerHTML = `✨ ${data.message}`;
        }

        // Prepend optimistic preview note to the wall
        if (wallGrid && data.note) {
          const previewCard = document.createElement('div');
          previewCard.className = `sticky-note-card sticky-${data.note.paper_color}`;
          previewCard.style.transform = `rotate(${data.note.tilt_deg || 2}deg)`;
          previewCard.style.border = '2px dashed #FF6B6B';
          previewCard.innerHTML = `
            <div class="sticky-pin"></div>
            <p class="sticky-message">"${escapeHtml(data.note.message)}"</p>
            <div class="sticky-author-row">
              <span>✍️ ${escapeHtml(data.note.name)}</span>
              <span>${data.note.mood}</span>
            </div>
            <div style="font-size: 0.75rem; text-align: center; margin-top: 6px; color: #7D1717; font-weight: bold;">
              ⏳ Pending Barnaby's Approval
            </div>
          `;
          wallGrid.prepend(previewCard);
        }

        form.reset();
      } else {
        if (statusMsg) {
          statusMsg.className = 'doodle-toast error';
          statusMsg.textContent = data.message || 'Oops! Could not pin your note. Please try again.';
        }
      }
    } catch (err) {
      // Fallback: standard form submit
      form.submit();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
