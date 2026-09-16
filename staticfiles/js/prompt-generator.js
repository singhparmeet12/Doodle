/**
 * Scribbleverse Random Doodle Prompt Generator
 * Fetches prompts from /api/prompts/random/, animates scroll unroll,
 * tracks daily count, copies to clipboard, and links directly to drawing pad.
 */

document.addEventListener('DOMContentLoaded', () => {
  const promptCard = document.getElementById('prompt-scroll-card');
  const promptText = document.getElementById('prompt-text-display');
  const promptCategory = document.getElementById('prompt-category-badge');
  const promptDifficulty = document.getElementById('prompt-difficulty-badge');
  const promptCounter = document.getElementById('prompts-today-count');
  const newPromptBtn = document.getElementById('get-new-prompt-btn');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const drawPromptBtn = document.getElementById('draw-prompt-btn');

  if (!newPromptBtn || !promptText) return;

  let currentPromptId = null;

  async function fetchRandomPrompt() {
    if (newPromptBtn) {
      newPromptBtn.disabled = true;
      newPromptBtn.classList.add('loading');
    }

    try {
      const url = currentPromptId ? `/api/prompts/random/?exclude=${currentPromptId}` : '/api/prompts/random/';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Could not fetch prompt');
      const data = await response.json();

      if (data.success) {
        currentPromptId = data.id;

        // Trigger reveal animation
        if (promptCard) {
          promptCard.classList.remove('revealing');
          // Force reflow
          void promptCard.offsetWidth;
          promptCard.classList.add('revealing');
        }

        // Update display
        promptText.textContent = `"${data.text}"`;

        if (promptCategory) promptCategory.textContent = data.category;
        if (promptDifficulty) promptDifficulty.textContent = data.difficulty;
        if (promptCounter) promptCounter.textContent = data.prompts_given_today;

        // Update direct link to draw studio with prompt
        if (drawPromptBtn) {
          drawPromptBtn.href = `/draw/?prompt=${encodeURIComponent(data.text)}`;
        }
      }
    } catch (err) {
      promptText.textContent = '"Draw a sleepy cloud taking a nap on top of a mountain."';
    } finally {
      if (newPromptBtn) {
        newPromptBtn.disabled = false;
        newPromptBtn.classList.remove('loading');
      }
    }
  }

  // Event listener for button
  newPromptBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fetchRandomPrompt();
  });

  // Copy prompt button
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', () => {
      const text = promptText.textContent.replace(/^"|"$/g, '');
      navigator.clipboard.writeText(text).then(() => {
        const origText = copyPromptBtn.textContent;
        copyPromptBtn.textContent = 'Copied! ✨';
        setTimeout(() => {
          copyPromptBtn.textContent = origText;
        }, 2000);
      });
    });
  }
});
