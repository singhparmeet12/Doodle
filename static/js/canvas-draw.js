/**
 * Scribbleverse "Draw With Me" Professional & Cute HTML5 Canvas Studio
 * Includes pre-made coloring templates, multi-brush engine (Crayon, Pencil, Marker, Sparkle, Bucket, Stamp),
 * custom color picker, paper backgrounds, undo/redo, and PNG export with celebratory confetti.
 */

document.addEventListener('DOMContentLoaded', () => {
  const visibleCanvas = document.getElementById('doodle-canvas');
  if (!visibleCanvas) return;

  const visibleCtx = visibleCanvas.getContext('2d');
  // Offscreen transparent layer for user artwork (strokes, templates, stamps, bucket fills)
  const drawCanvas = document.createElement('canvas');
  const ctx = drawCanvas.getContext('2d', { willReadFrequently: true });
  // Pointer alias so existing references like canvas.getBoundingClientRect() or canvas.addEventListener() continue working seamlessly
  const canvas = visibleCanvas;
  const swatches = document.querySelectorAll('.crayon-swatch');
  const brushSlider = document.getElementById('brush-size-slider');
  const brushSizeNum = document.getElementById('brush-size-num');
  const opacitySlider = document.getElementById('brush-opacity-slider');
  const opacityNum = document.getElementById('brush-opacity-num');
  const brushPreviewDot = document.getElementById('brush-preview-dot');
  const customColorInput = document.getElementById('custom-color-picker');
  const customColorBtn = document.getElementById('custom-color-btn');
  const recentColorsRow = document.getElementById('recent-colors-row');

  // Tool buttons
  const brushTypeBtns = document.querySelectorAll('.brush-type-btn');
  const stampBtns = document.querySelectorAll('.stamp-picker-btn');
  const paperBtns = document.querySelectorAll('.paper-texture-btn');
  const templateBtns = document.querySelectorAll('.template-choice-btn');
  const eraserBtn = document.getElementById('eraser-btn');
  const clearBtn = document.getElementById('clear-btn');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const downloadBtn = document.getElementById('download-doodle-btn');
  const copyBtn = document.getElementById('copy-doodle-btn');
  const stampDrawer = document.getElementById('stamp-tools-drawer');
  const promptBanner = document.getElementById('active-prompt-banner');

  // Check URL prompt
  const urlParams = new URLSearchParams(window.location.search);
  const promptParam = urlParams.get('prompt');
  if (promptParam && promptBanner) {
    promptBanner.style.display = 'block';
    const promptTextEl = promptBanner.querySelector('.prompt-mission-text');
    if (promptTextEl) promptTextEl.textContent = decodeURIComponent(promptParam);
  }

  // State
  let isDrawing = false;
  let currentColor = '#FF6B6B';
  let currentSize = parseInt(brushSlider ? brushSlider.value : 8, 10);
  let currentOpacity = parseFloat(opacitySlider ? opacitySlider.value : 1);
  let currentTool = 'crayon'; // 'crayon', 'pencil', 'marker', 'sparkle', 'bucket', 'stamp'
  let currentStamp = '⭐';
  let currentPaper = 'plain'; // 'plain', 'lined', 'grid', 'dots', 'chalkboard'
  let isEraser = false;
  let points = [];
  let hue = 0; // For sparkle rainbow brush

  // History stacks
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 25;
  const recentColors = [];

  // Current template name
  let currentTemplate = 'blank';

  // --------------------------------------------------------------------------
  // 1. CANVAS SETUP, PAPER BACKGROUND & COMPOSITING
  // --------------------------------------------------------------------------
  function renderComposite() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // 1. Draw paper pattern onto visible on-screen canvas
    drawPaperBackground(visibleCtx);

    // 2. Composite user artwork & templates from offscreen canvas on top
    visibleCtx.drawImage(drawCanvas, 0, 0, w, h);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);

    // Save existing drawing from drawCanvas
    let tempCanvas = null;
    if (drawCanvas.width > 0 && drawCanvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = drawCanvas.width;
      tempCanvas.height = drawCanvas.height;
      tempCanvas.getContext('2d').drawImage(drawCanvas, 0, 0);
    }

    canvas.width = w;
    canvas.height = h;
    drawCanvas.width = w;
    drawCanvas.height = h;

    visibleCtx.scale(dpr, dpr);
    ctx.scale(dpr, dpr);

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      renderComposite();
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (currentTemplate !== 'blank') {
        renderTemplateOutline(currentTemplate);
      }
      renderComposite();
      saveState();
    }
  }

    function isDarkMode() {
    return currentPaper === 'chalkboard' || document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function getTemplateStrokeColor() {
    return isDarkMode() ? '#FFFFFF' : '#2B2B2B';
  }

  function getTemplateEyeShine() {
    return isDarkMode() ? '#222428' : '#FFFDF9';
  }

  function getBaseBgColor() {
    if (currentPaper === 'chalkboard') return '#222428';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#282A2E' : '#FFFDF9';
  }

  function drawPaperBackground(targetCtx = visibleCtx) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    targetCtx.save();
    targetCtx.fillStyle = getBaseBgColor();
    targetCtx.fillRect(0, 0, w, h);

    const isDark = currentPaper === 'chalkboard' || document.documentElement.getAttribute('data-theme') === 'dark';
    const lineCol = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(107, 203, 255, 0.35)';
    const marginCol = isDark ? 'rgba(255, 107, 107, 0.25)' : 'rgba(255, 107, 107, 0.4)';

    if (currentPaper === 'lined') {
      // Notebook ruling
      const spacing = 32;
      targetCtx.strokeStyle = lineCol;
      targetCtx.lineWidth = 1;
      for (let y = 60; y < h; y += spacing) {
        targetCtx.beginPath();
        targetCtx.moveTo(0, y);
        targetCtx.lineTo(w, y);
        targetCtx.stroke();
      }
      // Red left margin line
      targetCtx.strokeStyle = marginCol;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(70, 0);
      targetCtx.lineTo(70, h);
      targetCtx.stroke();
    } else if (currentPaper === 'grid') {
      // Graph paper grid
      const grid = 24;
      targetCtx.strokeStyle = lineCol;
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      for (let x = 0; x < w; x += grid) {
        targetCtx.moveTo(x, 0);
        targetCtx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += grid) {
        targetCtx.moveTo(0, y);
        targetCtx.lineTo(w, y);
      }
      targetCtx.stroke();
    } else if (currentPaper === 'dots') {
      // Bullet journal dot grid
      const dotSpacing = 26;
      targetCtx.fillStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(43,43,43,0.22)';
      for (let x = 20; x < w; x += dotSpacing) {
        for (let y = 20; y < h; y += dotSpacing) {
          targetCtx.beginPath();
          targetCtx.arc(x, y, 1.2, 0, Math.PI * 2);
          targetCtx.fill();
        }
      }
    }
    targetCtx.restore();
  }

  // --------------------------------------------------------------------------
  // 2. UNDO & REDO STATE MANAGEMENT
  // --------------------------------------------------------------------------
  function saveState() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if (undoStack.length >= MAX_HISTORY) {
      undoStack.shift();
    }
    undoStack.push({
      img: ctx.getImageData(0, 0, w, h),
      paper: currentPaper
    });
    redoStack.length = 0; // Clear redo on new action
  }

  function undo() {
    if (undoStack.length <= 1) return;
    const current = undoStack.pop();
    redoStack.push(current);
    const prev = undoStack[undoStack.length - 1];
    ctx.putImageData(prev.img, 0, 0);
    if (prev.paper && prev.paper !== currentPaper) {
      currentPaper = prev.paper;
      paperBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-paper') === currentPaper));
    }
    renderComposite();
    if (window.CuteAudio) window.CuteAudio.pop();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const next = redoStack.pop();
    undoStack.push(next);
    ctx.putImageData(next.img, 0, 0);
    if (next.paper && next.paper !== currentPaper) {
      currentPaper = next.paper;
      paperBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-paper') === currentPaper));
    }
    renderComposite();
    if (window.CuteAudio) window.CuteAudio.pop();
  }

  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);

  // --------------------------------------------------------------------------
  // 3. COLORING BOOK & PRE-MADE CUTE TEMPLATES
  // --------------------------------------------------------------------------
  const templates = {
    blank: (w, h) => {},

    melting: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 15;
      const r = Math.min(w, h) * 0.28;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Top Dome
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.98, Math.PI * 0.02, false);
      // Melting puddles at bottom
      ctx.bezierCurveTo(cx + r * 1.15, cy + r * 0.4, cx + r * 1.25, cy + r * 0.85, cx + r * 0.9, cy + r * 0.9);
      ctx.bezierCurveTo(cx + r * 0.6, cy + r * 0.95, cx + r * 0.4, cy + r * 0.75, cx + r * 0.2, cy + r * 0.88);
      ctx.bezierCurveTo(cx - r * 0.1, cy + r * 1.05, cx - r * 0.4, cy + r * 0.7, cx - r * 0.7, cy + r * 0.95);
      ctx.bezierCurveTo(cx - r * 1.1, cy + r * 0.9, cx - r * 1.2, cy + r * 0.4, cx - r, cy);
      ctx.stroke();

      // Dropping tear/melt drop
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.85, cy + r * 1.2, 7, 13, 0.2, 0, Math.PI * 2);
      ctx.stroke();

      // Sleepy relaxed melting eyes
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.35, cy - r * 0.15, 6, 7, -0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.35, cy - r * 0.08, 6, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine
      ctx.fillStyle = getTemplateEyeShine();
      ctx.beginPath();
      ctx.arc(cx - r * 0.35 + 2, cy - r * 0.15 - 2, 2.2, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.35 + 2, cy - r * 0.08 - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Melty sagging wavy smile
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.4, cy + r * 0.22);
      ctx.quadraticCurveTo(cx, cy + r * 0.48, cx + r * 0.42, cy + r * 0.58);
      ctx.stroke();

      // Soft melt puddle ripples underneath
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy + r * 1.15);
      ctx.quadraticCurveTo(cx, cy + r * 1.35, cx + r * 0.6, cy + r * 1.12);
      ctx.stroke();

      ctx.restore();
    },

    puppyeyes: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 15;
      const r = Math.min(w, h) * 0.28;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Cute round head
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Pleading arched eyebrows
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.42);
      ctx.quadraticCurveTo(cx - r * 0.35, cy - r * 0.55, cx - r * 0.18, cy - r * 0.38);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.55, cy - r * 0.42);
      ctx.quadraticCurveTo(cx + r * 0.35, cy - r * 0.55, cx + r * 0.18, cy - r * 0.38);
      ctx.stroke();

      // GIANT SPARKLY PUPPY EYES
      // Left Eye
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.05, r * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.arc(cx + r * 0.35, cy - r * 0.05, r * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // Big sparkle highlights
      ctx.fillStyle = getTemplateEyeShine();
      ctx.beginPath();
      ctx.arc(cx - r * 0.35 + 8, cy - r * 0.05 - 8, r * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.35 + 8, cy - r * 0.05 - 8, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Secondary little sparkles
      ctx.beginPath();
      ctx.arc(cx - r * 0.35 - 7, cy - r * 0.05 + 8, r * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.35 - 7, cy - r * 0.05 + 8, r * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Rosy blush
      ctx.fillStyle = 'rgba(255, 107, 107, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.5, cy + r * 0.25, 16, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.5, cy + r * 0.25, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Quivering little mouth
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + r * 0.42);
      ctx.quadraticCurveTo(cx, cy + r * 0.34, cx + 14, cy + r * 0.42);
      ctx.stroke();

      ctx.restore();
    },

    cool: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 15;
      const r = Math.min(w, h) * 0.28;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Sunglasses Left Frame
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.roundRect(cx - r * 0.78, cy - r * 0.25, r * 0.68, r * 0.45, [6, 6, 18, 18]);
      ctx.fill();
      ctx.stroke();

      // Sunglasses Right Frame
      ctx.beginPath();
      ctx.roundRect(cx + r * 0.1, cy - r * 0.25, r * 0.68, r * 0.45, [6, 6, 18, 18]);
      ctx.fill();
      ctx.stroke();

      // Sunglasses Bridge
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.1, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.15);
      ctx.lineWidth = 6;
      ctx.stroke();

      // Glasses Glint (White diagonal reflections)
      ctx.strokeStyle = '#FFFDF9';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.68, cy + r * 0.12);
      ctx.lineTo(cx - r * 0.45, cy - r * 0.18);
      ctx.moveTo(cx - r * 0.35, cy + r * 0.12);
      ctx.lineTo(cx - r * 0.22, cy - r * 0.05);

      ctx.moveTo(cx + r * 0.22, cy + r * 0.12);
      ctx.lineTo(cx + r * 0.45, cy - r * 0.18);
      ctx.moveTo(cx + r * 0.55, cy + r * 0.12);
      ctx.lineTo(cx + r * 0.68, cy - r * 0.05);
      ctx.stroke();

      // Cheeky Confident Grin
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy + r * 0.38);
      ctx.quadraticCurveTo(cx + r * 0.1, cy + r * 0.6, cx + r * 0.45, cy + r * 0.3);
      ctx.stroke();

      // Smile dimple
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.42, cy + r * 0.22);
      ctx.lineTo(cx + r * 0.48, cy + r * 0.35);
      ctx.stroke();

      ctx.restore();
    },

    ghost: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 15;
      const r = Math.min(w, h) * 0.28;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Ghost outline
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.4, r * 0.65, Math.PI, 0, false);
      // Right arm waving
      ctx.bezierCurveTo(cx + r * 0.75, cy - r * 0.1, cx + r * 1.1, cy - r * 0.2, cx + r * 1.05, cy);
      ctx.bezierCurveTo(cx + r * 0.85, cy + r * 0.2, cx + r * 0.65, cy + r * 0.3, cx + r * 0.65, cy + r * 0.75);
      // Wavy ripples at bottom
      ctx.quadraticCurveTo(cx + r * 0.45, cy + r * 0.95, cx + r * 0.25, cy + r * 0.75);
      ctx.quadraticCurveTo(cx + r * 0.05, cy + r * 0.95, cx - r * 0.15, cy + r * 0.75);
      ctx.quadraticCurveTo(cx - r * 0.35, cy + r * 0.95, cx - r * 0.55, cy + r * 0.75);
      ctx.bezierCurveTo(cx - r * 0.6, cy + r * 0.3, cx - r * 0.8, cy + r * 0.2, cx - r * 1.05, cy);
      // Left arm waving
      ctx.bezierCurveTo(cx - r * 1.1, cy - r * 0.2, cx - r * 0.75, cy - r * 0.1, cx - r * 0.65, cy - r * 0.4);
      ctx.stroke();

      // Playful face: wink + cute open mouth
      // Left wink
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.32, cy - r * 0.3);
      ctx.quadraticCurveTo(cx - r * 0.22, cy - r * 0.4, cx - r * 0.12, cy - r * 0.3);
      ctx.stroke();

      // Right round eye
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx + r * 0.22, cy - r * 0.3, 7, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight
      ctx.fillStyle = getTemplateEyeShine();
      ctx.beginPath();
      ctx.arc(cx + r * 0.22 + 2, cy - r * 0.3 - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Cute open oval mouth
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.1, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Little stars around ghost
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.9, cy - r * 0.5); ctx.lineTo(cx + r * 0.9, cy - r * 0.35);
      ctx.moveTo(cx + r * 0.82, cy - r * 0.42); ctx.lineTo(cx + r * 0.98, cy - r * 0.42);
      ctx.stroke();

      ctx.restore();
    },

    mindblown: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 + 10;
      const r = Math.min(w, h) * 0.26;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Lower Head / Jaw
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - r * 0.2);
      ctx.bezierCurveTo(cx - r, cy + r * 0.8, cx - r * 0.5, cy + r * 1.1, cx, cy + r * 1.1);
      ctx.bezierCurveTo(cx + r * 0.5, cy + r * 1.1, cx + r, cy + r * 0.8, cx + r, cy - r * 0.2);
      ctx.stroke();

      // Big Mushroom Cloud / Brain Pop out of top!
      ctx.beginPath();
      ctx.arc(cx - r * 0.7, cy - r * 0.4, r * 0.35, Math.PI * 0.8, Math.PI * 1.8);
      ctx.arc(cx - r * 0.3, cy - r * 0.85, r * 0.42, Math.PI * 1.0, Math.PI * 1.9);
      ctx.arc(cx + r * 0.3, cy - r * 0.85, r * 0.42, Math.PI * 1.1, Math.PI * 2.0);
      ctx.arc(cx + r * 0.7, cy - r * 0.4, r * 0.35, Math.PI * 1.2, Math.PI * 0.2);
      ctx.stroke();

      // Sparks bursting out
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy - r * 1.0);
      ctx.lineTo(cx - r * 0.65, cy - r * 1.2);
      ctx.lineTo(cx - r * 0.75, cy - r * 1.25);
      ctx.lineTo(cx - r * 0.6, cy - r * 1.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.8, cy - r * 1.0);
      ctx.lineTo(cx + r * 0.65, cy - r * 1.2);
      ctx.lineTo(cx + r * 0.75, cy - r * 1.25);
      ctx.lineTo(cx + r * 0.6, cy - r * 1.45);
      ctx.stroke();

      // Wide shock eyes
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx - r * 0.38, cy + r * 0.15, 6, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.38, cy + r * 0.15, 6, 0, Math.PI * 2);
      ctx.fill();

      // Open "O" mouth
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.62, r * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },

    joy: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 15;
      const r = Math.min(w, h) * 0.28;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Laughing crescent eyes
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.05);
      ctx.quadraticCurveTo(cx - r * 0.35, cy - r * 0.35, cx - r * 0.15, cy - r * 0.05);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.15, cy - r * 0.05);
      ctx.quadraticCurveTo(cx + r * 0.35, cy - r * 0.35, cx + r * 0.55, cy - r * 0.05);
      ctx.stroke();

      // Giant open laughing mouth
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy + r * 0.15);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.15);
      ctx.quadraticCurveTo(cx, cy + r * 0.95, cx - r * 0.55, cy + r * 0.15);
      ctx.stroke();

      // Tongue inside mouth
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.65, r * 0.2, Math.PI * 1.1, Math.PI * 1.9, false);
      ctx.stroke();

      // Splashing tears on both sides
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.75, cy - r * 0.05);
      ctx.bezierCurveTo(cx - r * 1.15, cy - r * 0.35, cx - r * 1.35, cy + r * 0.15, cx - r * 0.85, cy + r * 0.15);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.75, cy - r * 0.05);
      ctx.bezierCurveTo(cx + r * 1.15, cy - r * 0.35, cx + r * 1.35, cy + r * 0.15, cx + r * 0.85, cy + r * 0.15);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    },

    star: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 20;
      const r = Math.min(w, h) * 0.32;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 5-point Star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const aOuter = (i * 72 - 18) * (Math.PI / 180);
        const aInner = (i * 72 + 18) * (Math.PI / 180);
        const xO = cx + r * Math.cos(aOuter);
        const yO = cy + r * Math.sin(aOuter);
        const xI = cx + (r * 0.48) * Math.cos(aInner);
        const yI = cy + (r * 0.48) * Math.sin(aInner);
        if (i === 0) ctx.moveTo(xO, yO);
        else ctx.lineTo(xO, yO);
        ctx.lineTo(xI, yI);
      }
      ctx.closePath();
      ctx.stroke();

      // Cute Eyes
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx - 30, cy - 10, 7, 0, Math.PI * 2);
      ctx.arc(cx + 30, cy - 10, 7, 0, Math.PI * 2);
      ctx.fill();

      // Eye catchlights
      ctx.fillStyle = '#FFF9F0';
      ctx.beginPath();
      ctx.arc(cx - 28, cy - 12, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 32, cy - 12, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Rosy Cheeks
      ctx.fillStyle = 'rgba(255, 107, 107, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - 45, cy + 8, 14, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 45, cy + 8, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Happy Smile
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 18, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.restore();
    },

    barnaby: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 20;
      const s = Math.min(w, h) * 0.0055;
      ctx.save();
      ctx.translate(cx - 80 * s, cy - 80 * s);
      ctx.scale(s, s);
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Blob Body
      ctx.beginPath();
      ctx.moveTo(35, 80);
      ctx.bezierCurveTo(25, 40, 60, 20, 85, 25);
      ctx.bezierCurveTo(115, 30, 135, 45, 130, 85);
      ctx.bezierCurveTo(125, 120, 105, 135, 75, 130);
      ctx.bezierCurveTo(45, 125, 45, 105, 35, 80);
      ctx.closePath();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(65, 68, 5.5, 0, Math.PI * 2);
      ctx.arc(95, 69, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.moveTo(74, 82);
      ctx.quadraticCurveTo(80, 90, 88, 82);
      ctx.stroke();

      // Crayon in hand
      ctx.beginPath();
      ctx.moveTo(115, 88);
      ctx.lineTo(142, 65);
      ctx.lineTo(148, 71);
      ctx.lineTo(121, 94);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(142, 65);
      ctx.lineTo(154, 58);
      ctx.lineTo(148, 71);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },

    cat: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Cat Head
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Ears
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 35);
      ctx.lineTo(cx - 85, cy - 110);
      ctx.lineTo(cx - 20, cy - 75);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 75);
      ctx.lineTo(cx + 85, cy - 110);
      ctx.lineTo(cx + 70, cy - 35);
      ctx.stroke();

      // Detective Hat
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 75, 70, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - 80, 45, Math.PI, 0);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.ellipse(cx - 32, cy - 10, 8, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 32, cy - 10, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute Nose & Mouth
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 16);
      ctx.lineTo(cx + 8, cy + 16);
      ctx.lineTo(cx, cy + 25);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy + 25);
      ctx.lineTo(cx, cy + 35);
      ctx.moveTo(cx, cy + 35);
      ctx.quadraticCurveTo(cx - 16, cy + 45, cx - 25, cy + 35);
      ctx.moveTo(cx, cy + 35);
      ctx.quadraticCurveTo(cx + 16, cy + 45, cx + 25, cy + 35);
      ctx.stroke();

      // Whiskers
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy + 20); ctx.lineTo(cx - 105, cy + 12);
      ctx.moveTo(cx - 45, cy + 30); ctx.lineTo(cx - 100, cy + 32);
      ctx.moveTo(cx + 45, cy + 20); ctx.lineTo(cx + 105, cy + 12);
      ctx.moveTo(cx + 45, cy + 30); ctx.lineTo(cx + 100, cy + 32);
      ctx.stroke();
      ctx.restore();
    },

    cloud: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 10;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Cloud puffs
      ctx.beginPath();
      ctx.arc(cx - 90, cy + 20, 50, 0.4 * Math.PI, 1.4 * Math.PI);
      ctx.arc(cx - 45, cy - 40, 55, 0.9 * Math.PI, 1.9 * Math.PI);
      ctx.arc(cx + 45, cy - 45, 60, 1.1 * Math.PI, 0.1 * Math.PI);
      ctx.arc(cx + 95, cy + 20, 50, 1.6 * Math.PI, 0.6 * Math.PI);
      ctx.lineTo(cx - 90, cy + 65);
      ctx.closePath();
      ctx.stroke();

      // Top Hat
      ctx.beginPath();
      ctx.rect(cx - 30, cy - 130, 60, 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 80);
      ctx.lineTo(cx + 50, cy - 80);
      ctx.stroke();

      // Monocle
      ctx.beginPath();
      ctx.arc(cx + 35, cy + 10, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 48, cy + 22);
      ctx.lineTo(cx + 65, cy + 50);
      ctx.stroke();

      // Mustache
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 35);
      ctx.quadraticCurveTo(cx - 5, cy + 22, cx, cy + 38);
      ctx.quadraticCurveTo(cx + 5, cy + 22, cx + 20, cy + 35);
      ctx.stroke();
      ctx.restore();
    },

    rocket: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Rocket body
      ctx.beginPath();
      ctx.moveTo(cx, cy - 130);
      ctx.bezierCurveTo(cx + 65, cy - 40, cx + 60, cy + 60, cx + 45, cy + 85);
      ctx.lineTo(cx - 45, cy + 85);
      ctx.bezierCurveTo(cx - 60, cy + 60, cx - 65, cy - 40, cx, cy - 130);
      ctx.closePath();
      ctx.stroke();

      // Porthole Window with alien
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Wings / Fins
      ctx.beginPath();
      ctx.moveTo(cx - 48, cy + 30);
      ctx.lineTo(cx - 95, cy + 90);
      ctx.lineTo(cx - 45, cy + 85);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 48, cy + 30);
      ctx.lineTo(cx + 95, cy + 90);
      ctx.lineTo(cx + 45, cy + 85);
      ctx.stroke();

      // Rocket Flame
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 85);
      ctx.lineTo(cx - 35, cy + 130);
      ctx.lineTo(cx, cy + 110);
      ctx.lineTo(cx + 35, cy + 130);
      ctx.lineTo(cx + 30, cy + 85);
      ctx.stroke();

      // Tiny Planet Nearby
      ctx.beginPath();
      ctx.arc(cx + 120, cy - 80, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 120, cy - 80, 36, 9, -20 * Math.PI / 180, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },

    mushroom: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Mushroom Cap
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy);
      ctx.bezierCurveTo(cx - 100, cy - 130, cx + 100, cy - 130, cx + 110, cy);
      ctx.quadraticCurveTo(cx, cy + 20, cx - 110, cy);
      ctx.closePath();
      ctx.stroke();

      // Cap Spots
      ctx.beginPath();
      ctx.arc(cx - 50, cy - 60, 22, 0, Math.PI * 2);
      ctx.arc(cx + 45, cy - 50, 26, 0, Math.PI * 2);
      ctx.arc(cx, cy - 85, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Stem (House)
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy + 12);
      ctx.lineTo(cx - 75, cy + 110);
      ctx.quadraticCurveTo(cx, cy + 125, cx + 75, cy + 110);
      ctx.lineTo(cx + 65, cy + 12);
      ctx.stroke();

      // Door
      ctx.beginPath();
      ctx.arc(cx, cy + 80, 22, Math.PI, 0);
      ctx.lineTo(cx + 22, cy + 118);
      ctx.lineTo(cx - 22, cy + 118);
      ctx.closePath();
      ctx.stroke();

      // Circular Window
      ctx.beginPath();
      ctx.arc(cx, cy + 40, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.moveTo(cx - 14, cy + 40); ctx.lineTo(cx + 14, cy + 40);
      ctx.moveTo(cx, cy + 26); ctx.lineTo(cx, cy + 54);
      ctx.stroke();

      // Chimney with heart puff
      ctx.beginPath();
      ctx.rect(cx + 50, cy - 120, 24, 34);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 62, cy - 135, 8, 0, Math.PI * 2);
      ctx.arc(cx + 70, cy - 150, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },

    coffee: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 + 10;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Mug body
      ctx.beginPath();
      ctx.moveTo(cx - 75, cy - 70);
      ctx.lineTo(cx + 75, cy - 70);
      ctx.lineTo(cx + 65, cy + 80);
      ctx.quadraticCurveTo(cx, cy + 98, cx - 65, cy + 80);
      ctx.closePath();
      ctx.stroke();

      // Handle
      ctx.beginPath();
      ctx.arc(cx + 70, cy + 5, 45, -0.4 * Math.PI, 0.4 * Math.PI);
      ctx.stroke();

      // Smiling face
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx - 28, cy - 5, 6, 0, Math.PI * 2);
      ctx.arc(cx + 28, cy - 5, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rosy cheeks
      ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 42, cy + 12, 11, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 42, cy + 12, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.beginPath();
      ctx.arc(cx, cy + 12, 14, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Swirling Steam
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 90);
      ctx.bezierCurveTo(cx - 45, cy - 130, cx - 15, cy - 150, cx - 30, cy - 180);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy - 90);
      ctx.bezierCurveTo(cx + 15, cy - 130, cx + 45, cy - 150, cx + 30, cy - 180);
      ctx.stroke();
      ctx.restore();
    },

    icecream: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 20;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Cone
      ctx.beginPath();
      ctx.moveTo(cx - 55, cy + 40);
      ctx.lineTo(cx, cy + 160);
      ctx.lineTo(cx + 55, cy + 40);
      ctx.closePath();
      ctx.stroke();

      // Crosshatch on cone
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 60); ctx.lineTo(cx + 18, cy + 120);
      ctx.moveTo(cx - 20, cy + 90); ctx.lineTo(cx + 32, cy + 90);
      ctx.moveTo(cx + 35, cy + 60); ctx.lineTo(cx - 18, cy + 120);
      ctx.stroke();

      // Bottom Scoop
      ctx.beginPath();
      ctx.arc(cx, cy + 15, 60, Math.PI, 0);
      ctx.stroke();

      // Top Scoop
      ctx.beginPath();
      ctx.arc(cx, cy - 45, 52, Math.PI, 0);
      ctx.stroke();

      // Cherry on top
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 105, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 120);
      ctx.quadraticCurveTo(cx + 35, cy - 145, cx + 25, cy - 165);
      ctx.stroke();

      // Face on scoop
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx - 22, cy + 5, 5, 0, Math.PI * 2);
      ctx.arc(cx + 22, cy + 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 18, 12, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.restore();
    },

    dino: (w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Dino body outline
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 60);
      ctx.lineTo(cx - 130, cy + 30); // Tail tip
      ctx.lineTo(cx - 60, cy - 10);
      ctx.lineTo(cx - 30, cy - 90); // Head back
      ctx.lineTo(cx + 40, cy - 90); // Snout
      ctx.lineTo(cx + 40, cy - 60);
      ctx.lineTo(cx + 10, cy - 50); // Mouth
      ctx.lineTo(cx + 25, cy - 20); // Chest
      ctx.lineTo(cx + 40, cy - 15); // Tiny arm
      ctx.lineTo(cx + 25, cy - 5);
      ctx.lineTo(cx + 35, cy + 70); // Belly
      ctx.lineTo(cx + 35, cy + 120); // Leg 1
      ctx.lineTo(cx + 15, cy + 120);
      ctx.lineTo(cx + 15, cy + 75);
      ctx.lineTo(cx - 20, cy + 75);
      ctx.lineTo(cx - 20, cy + 120); // Leg 2
      ctx.lineTo(cx - 40, cy + 120);
      ctx.lineTo(cx - 40, cy + 65);
      ctx.closePath();
      ctx.stroke();

      // Eye
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 75, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Spikes on back
      const spikes = [[cx - 20, cy - 90], [cx - 40, cy - 50], [cx - 65, cy - 15], [cx - 95, cy + 15]];
      spikes.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy);
        ctx.lineTo(sx, sy - 18);
        ctx.lineTo(sx + 8, sy);
        ctx.stroke();
      });
      ctx.restore();
    },

    flower: (w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 30;
      ctx.save();
      ctx.strokeStyle = getTemplateStrokeColor();
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Flower Center
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.stroke();

      // Petals
      for (let i = 0; i < 8; i++) {
        const a = (i * 45) * (Math.PI / 180);
        const px = cx + Math.cos(a) * 65;
        const py = cy + Math.sin(a) * 65;
        ctx.beginPath();
        ctx.arc(px, py, 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Stem
      ctx.beginPath();
      ctx.moveTo(cx, cy + 40);
      ctx.quadraticCurveTo(cx - 15, cy + 100, cx, cy + 140);
      ctx.stroke();

      // Leaves
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 80);
      ctx.quadraticCurveTo(cx - 50, cy + 65, cx - 60, cy + 85);
      ctx.quadraticCurveTo(cx - 30, cy + 100, cx - 5, cy + 95);
      ctx.stroke();

      // Flowerpot
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy + 140);
      ctx.lineTo(cx + 50, cy + 140);
      ctx.lineTo(cx + 40, cy + 210);
      ctx.lineTo(cx - 40, cy + 210);
      ctx.closePath();
      ctx.stroke();

      // Face on center
      ctx.fillStyle = getTemplateStrokeColor();
      ctx.beginPath();
      ctx.arc(cx - 14, cy - 6, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + 14, cy - 6, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 12, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  };

  function renderTemplateOutline(templateName) {
    const rect = canvas.getBoundingClientRect();
    if (templates[templateName]) {
      templates[templateName](rect.width, rect.height);
    }
  }

  // Template button selection
  templateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tName = btn.getAttribute('data-template');
      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentTemplate = tName;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (tName !== 'blank') {
        renderTemplateOutline(tName);
      }
      renderComposite();
      saveState();

      if (window.CuteAudio) window.CuteAudio.sparkle();
    });
  });

  // Paper Texture selection (Real-time background switch under existing drawing!)
  paperBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      paperBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPaper = btn.getAttribute('data-paper');

      // Instantly update the background at this exact moment!
      renderComposite();
      saveState();

      if (window.CuteAudio) window.CuteAudio.swatch();
    });
  });

  // --------------------------------------------------------------------------
  // 4. COORDINATE HELPERS
  // --------------------------------------------------------------------------
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // --------------------------------------------------------------------------
  // 5. BRUSH ENGINES
  // --------------------------------------------------------------------------
  function startDrawing(e) {
    e.preventDefault();
    const pt = getCoordinates(e);

    // If eraser is active, it takes priority and can erase ANY stroke, fill, stamp, or outline!
    if (isEraser) {
      // Proceed to eraser drawing!
    } else {
      if (currentTool === 'bucket') {
        floodFill(Math.round(pt.x), Math.round(pt.y), currentColor);
        renderComposite();
        saveState();
        return;
      }

      if (currentTool === 'stamp') {
        drawStamp(pt.x, pt.y, currentStamp);
        renderComposite();
        saveState();
        return;
      }
    }

    isDrawing = true;
    points = [pt];

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(currentSize * 2, 16);
    } else {
      applyBrushStyle(ctx);
    }

    // Dot at start
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, (isEraser ? Math.max(currentSize * 2, 16) : currentSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : currentColor;
    ctx.fill();
    ctx.restore();

    renderComposite();
  }

  function applyBrushStyle(c) {
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = currentOpacity;

    if (currentTool === 'crayon') {
      c.lineWidth = currentSize;
      c.strokeStyle = currentColor;
      c.shadowBlur = 1.2;
      c.shadowColor = currentColor;
    } else if (currentTool === 'pencil') {
      c.lineWidth = Math.max(1.8, currentSize * 0.45);
      c.strokeStyle = currentColor;
      c.globalAlpha = Math.min(currentOpacity, 0.75);
    } else if (currentTool === 'marker') {
      c.lineWidth = currentSize * 1.3;
      c.strokeStyle = currentColor;
      c.globalAlpha = Math.min(currentOpacity, 0.45); // Semi-translucent layering
    } else if (currentTool === 'sparkle') {
      hue = (hue + 12) % 360;
      c.lineWidth = currentSize;
      c.strokeStyle = `hsl(${hue}, 95%, 60%)`;
      c.shadowBlur = 8;
      c.shadowColor = `hsl(${hue}, 95%, 60%)`;
    } else {
      c.lineWidth = currentSize;
      c.strokeStyle = currentColor;
    }
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pt = getCoordinates(e);
    points.push(pt);

    if (points.length < 2) return;

    ctx.save();
    if (isEraser) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(currentSize * 2, 16);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      applyBrushStyle(ctx);
    }

    // Smooth quadratic curve interpolation
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    if (points.length >= 3) {
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    } else {
      ctx.lineTo(points[1].x, points[1].y);
    }
    ctx.stroke();

    // Extra sparkle particles for the Magic Sparkle brush
    if (currentTool === 'sparkle' && !isEraser && Math.random() > 0.45) {
      drawSparkleStar(pt.x + (Math.random() * 20 - 10), pt.y + (Math.random() * 20 - 10), Math.random() * 6 + 4);
    }

    ctx.restore();
    renderComposite();
  }

  function drawSparkleStar(x, y, r) {
    ctx.save();
    ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.3, y - r * 0.3);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x + r * 0.3, y + r * 0.3);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * 0.3, y + r * 0.3);
    ctx.lineTo(x - r, y);
    ctx.lineTo(x - r * 0.3, y - r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    points = [];
    renderComposite();
    saveState();
  }

  // Mouse Listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  // Touch Listeners (Mobile & Tablet)
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('touchend', stopDrawing);
  window.addEventListener('touchcancel', stopDrawing);

  // --------------------------------------------------------------------------
  // 6. STAMP TOOL
  // --------------------------------------------------------------------------
  function drawStamp(x, y, stampChar) {
    ctx.save();
    ctx.font = `${currentSize * 2.8}px 'Patrick Hand', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stampChar, x, y);
    ctx.restore();

    renderComposite();
    if (window.CuteAudio) window.CuteAudio.stamp();
  }

  stampBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stampBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStamp = btn.getAttribute('data-stamp') || '⭐';
      setTool('stamp');
    });
  });

  // --------------------------------------------------------------------------
  // 7. FLOOD FILL (PAINT BUCKET)
  // --------------------------------------------------------------------------
  function hexToRgba(hex) {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    if (c.length === 3) {
      const r = ((num >> 8) & 0xf) * 17;
      const g = ((num >> 4) & 0xf) * 17;
      const b = (num & 0xf) * 17;
      return [r, g, b, 255];
    }
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255];
  }

  function floodFill(startX, startY, fillHex) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    const sx = Math.floor(startX * dpr);
    const sy = Math.floor(startY * dpr);

    if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const startPos = (sy * w + sx) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    const [fillR, fillG, fillB, fillA] = hexToRgba(fillHex);

    // If clicking same color, return
    if (Math.abs(startR - fillR) < 5 && Math.abs(startG - fillG) < 5 && Math.abs(startB - fillB) < 5) {
      return;
    }

    const colorMatch = (pos) => {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];
      // Tolerance
      return Math.abs(r - startR) < 32 && Math.abs(g - startG) < 32 && Math.abs(b - startB) < 32 && Math.abs(a - startA) < 32;
    };

    const queue = [[sx, sy]];
    const visited = new Uint8Array(w * h);
    visited[sy * w + sx] = 1;

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const pos = (y * w + x) * 4;

      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      data[pos + 3] = fillA;

      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const [nx, ny] = neighbors[i];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            const nPos = nIdx * 4;
            if (colorMatch(nPos)) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    renderComposite();
    if (window.CuteAudio) window.CuteAudio.sparkle();
  }

  // --------------------------------------------------------------------------
  // 8. BRUSH TYPE & TOOL SELECTOR
  // --------------------------------------------------------------------------
  function setTool(toolName) {
    currentTool = toolName;
    isEraser = false;
    if (eraserBtn) eraserBtn.classList.remove('active');

    brushTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tool') === toolName);
    });

    if (stampDrawer) {
      stampDrawer.style.display = toolName === 'stamp' ? 'flex' : 'none';
    }

    updateBrushPreview();
    if (window.CuteAudio) window.CuteAudio.pop();
  }

  brushTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-tool');
      setTool(t);
    });
  });

  // Eraser Toggle
  if (eraserBtn) {
    eraserBtn.addEventListener('click', () => {
      isEraser = !isEraser;
      eraserBtn.classList.toggle('active', isEraser);
      if (isEraser) {
        brushTypeBtns.forEach(b => b.classList.remove('active'));
      } else {
        brushTypeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tool') === currentTool));
      }
      updateBrushPreview();
      if (window.CuteAudio) window.CuteAudio.pop();
    });
  }

  // Clear Canvas (Immediate action, wipes to 100% blank page!)
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      visibleCtx.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);

      currentTemplate = 'blank';
      templateBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-template') === 'blank');
      });

      renderComposite();
      saveState();

      // Fun tactile bounce
      clearBtn.animate([
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(-14deg) scale(1.15)' },
        { transform: 'rotate(10deg) scale(1.05)' },
        { transform: 'rotate(0deg) scale(1)' }
      ], { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });

      if (window.CuteAudio) window.CuteAudio.pop();
    });
  }

  // --------------------------------------------------------------------------
  // 9. COLOR PICKER & RECENT SWATCHES
  // --------------------------------------------------------------------------
  function setColor(hex) {
    currentColor = hex;
    isEraser = false;
    if (eraserBtn) eraserBtn.classList.remove('active');

    // Update active swatch
    swatches.forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-color').toLowerCase() === hex.toLowerCase());
    });

    // Add to recent colors if not exists
    if (!recentColors.includes(hex)) {
      recentColors.unshift(hex);
      if (recentColors.length > 8) recentColors.pop();
      renderRecentColors();
    }

    updateBrushPreview();
    if (window.CuteAudio) window.CuteAudio.swatch();
  }

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const col = swatch.getAttribute('data-color');
      setColor(col);
    });
  });

  if (customColorInput) {
    customColorInput.addEventListener('input', (e) => {
      setColor(e.target.value);
    });
  }

  if (customColorBtn && customColorInput) {
    customColorBtn.addEventListener('click', () => {
      customColorInput.click();
    });
  }

  function renderRecentColors() {
    if (!recentColorsRow) return;
    recentColorsRow.innerHTML = '';
    if (recentColors.length === 0) {
      recentColorsRow.style.display = 'none';
      return;
    }
    recentColorsRow.style.display = 'flex';
    recentColors.forEach(col => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `recent-color-chip ${col.toLowerCase() === currentColor.toLowerCase() ? 'active' : ''}`;
      btn.style.backgroundColor = col;
      btn.title = `Color ${col}`;
      btn.addEventListener('click', () => setColor(col));
      recentColorsRow.appendChild(btn);
    });
  }
  renderRecentColors();

  // Slider controls
  if (brushSlider) {
    brushSlider.addEventListener('input', () => {
      currentSize = parseInt(brushSlider.value, 10);
      if (brushSizeNum) brushSizeNum.textContent = `${currentSize}px`;
      updateBrushPreview();
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', () => {
      currentOpacity = parseFloat(opacitySlider.value);
      if (opacityNum) opacityNum.textContent = `${Math.round(currentOpacity * 100)}%`;
      updateBrushPreview();
    });
  }

  function updateBrushPreview() {
    if (!brushPreviewDot) return;
    const previewSize = Math.min(Math.max(currentSize, 4), 36);
    brushPreviewDot.style.width = `${previewSize}px`;
    brushPreviewDot.style.height = `${previewSize}px`;
    brushPreviewDot.style.opacity = currentOpacity;
    brushPreviewDot.style.backgroundColor = isEraser ? '#999' : currentColor;
  }

  // --------------------------------------------------------------------------
  // 10. DOWNLOAD & CLIPBOARD ACTIONS
  // --------------------------------------------------------------------------
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `scribbleverse-${currentTemplate}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      if (window.CuteAudio) window.CuteAudio.fanfare();
      launchConfetti();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            const orig = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>Copied to Clipboard!</span> ✨';
            if (window.CuteAudio) window.CuteAudio.sparkle();
            setTimeout(() => copyBtn.innerHTML = orig, 2200);
          } else {
            alert('Right-click the canvas and select "Copy Image".');
          }
        });
      } catch (err) {
        alert('Could not copy image automatically in this browser.');
      }
    });
  }

  function launchConfetti() {
    const container = document.getElementById('confetti-doodle-container') || document.body;
    const colors = ['#FF6B6B', '#FFD93D', '#6BCBFF', '#6BCB77', '#A06BFF', '#FF85B3'];
    const totalPieces = 50;

    for (let i = 0; i < totalPieces; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = `${50 + (Math.random() * 40 - 20)}vw`;
      confetti.style.top = `${50 + (Math.random() * 20 - 10)}vh`;
      confetti.style.width = `${Math.random() * 12 + 8}px`;
      confetti.style.height = `${Math.random() * 10 + 6}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '3px';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '10002';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(confetti);

      const destX = (Math.random() - 0.5) * window.innerWidth * 0.7;
      const destY = (Math.random() - 0.8) * window.innerHeight * 0.6;
      const rotation = Math.random() * 720;

      confetti.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY + 300}px) rotate(${rotation}deg) scale(0.6)`, opacity: 0 }
      ], {
        duration: 1800 + Math.random() * 600,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
      }).onfinish = () => confetti.remove();
    }
  }

  // --------------------------------------------------------------------------
  // INITIALIZE
  // --------------------------------------------------------------------------
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  updateBrushPreview();

  // Watch for dark/light theme switch to update paper background
  const themeObserver = new MutationObserver(() => {
    renderComposite();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

  // Dynamic dark/light mode canvas redraw
  window.addEventListener('themeChanged', () => {
    if (currentTemplate !== 'blank') {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      renderTemplateOutline(currentTemplate);
    }
    renderComposite();
  });
