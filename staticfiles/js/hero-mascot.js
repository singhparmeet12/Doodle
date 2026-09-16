/**
 * Scribbleverse Interactive Hero Mascot (Barnaby)
 * Features eye-tracking cursor follower, click reactions, speech bubble dialog,
 * floating particle burst, wardrobe dress-up hats, and color switcher.
 */

document.addEventListener('DOMContentLoaded', () => {
  const mascotCard = document.querySelector('.mascot-hero-card');
  const mascotSvg = document.getElementById('hero-interactive-barnaby');
  const speechBubble = document.getElementById('hero-speech-bubble');
  const pupilLeft = document.getElementById('hero-pupil-left');
  const pupilRight = document.getElementById('hero-pupil-right');
  const barnabyBody = document.getElementById('hero-barnaby-body');
  const hatLayer = document.getElementById('hero-hat-layer');
  const cheekLeft = document.getElementById('hero-cheek-left');
  const cheekRight = document.getElementById('hero-cheek-right');
  const mouthPath = document.getElementById('hero-barnaby-mouth');

  if (!mascotSvg) return;

  // --------------------------------------------------------------------------
  // 1. EYE TRACKING (Pupils look at cursor)
  // --------------------------------------------------------------------------
  const eyeLeftCenter = { x: 65, y: 68 };
  const eyeRightCenter = { x: 95, y: 69 };
  const MAX_PUPIL_OFFSET = 4.5;

  function handleMouseMove(e) {
    if (!pupilLeft || !pupilRight) return;
    const rect = mascotSvg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Convert screen coordinates to SVG viewBox (0 0 160 160)
    const svgX = ((e.clientX - rect.left) / rect.width) * 160;
    const svgY = ((e.clientY - rect.top) / rect.height) * 160;

    // Left Pupil
    const dxL = svgX - eyeLeftCenter.x;
    const dyL = svgY - eyeLeftCenter.y;
    const distL = Math.hypot(dxL, dyL);
    const offsetL = Math.min(distL * 0.1, MAX_PUPIL_OFFSET);
    const angleL = Math.atan2(dyL, dxL);
    const curXL = eyeLeftCenter.x + Math.cos(angleL) * offsetL;
    const curYL = eyeLeftCenter.y + Math.sin(angleL) * offsetL;

    pupilLeft.setAttribute('cx', curXL);
    pupilLeft.setAttribute('cy', curYL);

    // Right Pupil
    const dxR = svgX - eyeRightCenter.x;
    const dyR = svgY - eyeRightCenter.y;
    const distR = Math.hypot(dxR, dyR);
    const offsetR = Math.min(distR * 0.1, MAX_PUPIL_OFFSET);
    const angleR = Math.atan2(dyR, dxR);
    const curXR = eyeRightCenter.x + Math.cos(angleR) * offsetR;
    const curYR = eyeRightCenter.y + Math.sin(angleR) * offsetR;

    pupilRight.setAttribute('cx', curXR);
    pupilRight.setAttribute('cy', curYR);
  }

  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  // --------------------------------------------------------------------------
  // 2. CLICK INTERACTIONS & SILLY REACTIONS
  // --------------------------------------------------------------------------
  const quotes = [
    "Hehe! That tickles! 🖍️",
    "You're an artist! Let's make some art! ✨",
    "Wobbly lines are proof that you're alive! 🌟",
    "Have you tried my Draw With Me pad yet? 🎨",
    "My cheeks are blush-level: maximum! 💖",
    "Did you know my favorite snack is strawberry toast? 🍞",
    "Pick a cute hat for me below! 🎩",
    "Look at me bounce! Wheeeee! 🧸",
    "Imperfect art is the best art! ✏️",
    "A blank page is just a party waiting to happen! 🎈"
  ];

  let quoteIndex = 0;

  function triggerBarnabyReaction(e) {
    if (e) e.stopPropagation();

    // Sound
    if (window.CuteAudio) window.CuteAudio.giggle();

    // Mascot bounce animation
    mascotSvg.classList.remove('mascot-bounce-active');
    void mascotSvg.offsetWidth; // force reflow
    mascotSvg.classList.add('mascot-bounce-active');

    // Speech bubble update
    if (speechBubble) {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      speechBubble.classList.remove('bubble-pop');
      void speechBubble.offsetWidth;
      speechBubble.textContent = quotes[quoteIndex];
      speechBubble.classList.add('bubble-pop');
    }

    // Floating heart / sparkle particle burst
    spawnDoodleParticles(mascotCard);
  }

  mascotSvg.addEventListener('click', triggerBarnabyReaction);
  if (mascotCard) {
    const speechEl = mascotCard.querySelector('.mascot-speech-bubble');
    if (speechEl) {
      speechEl.addEventListener('click', triggerBarnabyReaction);
    }
  }

  function spawnDoodleParticles(target) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const symbols = ['💖', '✨', '⭐', '🖍️', '🌸', '💫'];

    for (let i = 0; i < 6; i++) {
      const p = document.createElement('span');
      p.className = 'floating-doodle-particle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.position = 'fixed';
      p.style.left = `${rect.left + rect.width / 2 + (Math.random() * 80 - 40)}px`;
      p.style.top = `${rect.top + 70 + (Math.random() * 40 - 20)}px`;
      p.style.fontSize = `${Math.random() * 12 + 16}px`;
      p.style.pointerEvents = 'none';
      p.style.zIndex = '10005';

      document.body.appendChild(p);

      const destX = (Math.random() - 0.5) * 120;
      const destY = -60 - Math.random() * 70;

      p.animate([
        { transform: 'translate(0, 0) scale(0.5)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(1.3) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0 }
      ], {
        duration: 900 + Math.random() * 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }).onfinish = () => p.remove();
    }
  }

  // --------------------------------------------------------------------------
  // 3. WARDROBE ACCESSORIES (HATS & DECORATIONS)
  // --------------------------------------------------------------------------
  const hatDefinitions = {
    none: '',
    beret: `
      <!-- Artist French Beret -->
      <path d="M38,42 C38,18 100,10 118,34 C125,38 120,48 105,48 C75,48 40,48 38,42 Z" fill="#FF6B6B" stroke="var(--ink-main)" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="82" cy="14" r="4.5" fill="#FF6B6B" stroke="var(--ink-main)" stroke-width="2.5"/>
    `,
    party: `
      <!-- Party Cone Hat -->
      <polygon points="56,44 82,2 106,44" fill="#FFD93D" stroke="var(--ink-main)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M63,33 L99,33" stroke="#FF6B6B" stroke-width="4"/>
      <path d="M70,20 L92,20" stroke="#6BCBFF" stroke-width="4"/>
      <circle cx="82" cy="2" r="6" fill="#FF6B6B" stroke="var(--ink-main)" stroke-width="2"/>
    `,
    tophat: `
      <!-- Classy Top Hat & Monocle -->
      <rect x="60" y="8" width="44" height="34" rx="3" fill="var(--ink-main)"/>
      <line x1="46" y1="42" x2="118" y2="42" stroke="var(--ink-main)" stroke-width="5" stroke-linecap="round"/>
      <rect x="60" y="28" width="44" height="7" fill="#FF6B6B"/>
      <!-- Tiny Monocle -->
      <circle cx="95" cy="69" r="11" fill="none" stroke="#FFD93D" stroke-width="2.5"/>
      <line x1="104" y1="77" x2="114" y2="92" stroke="#FFD93D" stroke-width="1.8"/>
    `,
    flower: `
      <!-- Daisy Flower on Head -->
      <circle cx="68" cy="28" r="8" fill="#FFF9F0" stroke="var(--ink-main)" stroke-width="2"/>
      <circle cx="82" cy="22" r="8" fill="#FFF9F0" stroke="var(--ink-main)" stroke-width="2"/>
      <circle cx="96" cy="28" r="8" fill="#FFF9F0" stroke="var(--ink-main)" stroke-width="2"/>
      <circle cx="94" cy="40" r="8" fill="#FFF9F0" stroke="var(--ink-main)" stroke-width="2"/>
      <circle cx="70" cy="40" r="8" fill="#FFF9F0" stroke="var(--ink-main)" stroke-width="2"/>
      <circle cx="82" cy="31" r="9" fill="#FFD93D" stroke="var(--ink-main)" stroke-width="2.5"/>
    `,
    crown: `
      <!-- Gold Wobbly Crown -->
      <polygon points="58,40 60,18 72,28 82,14 92,28 104,18 106,40" fill="#FFD93D" stroke="var(--ink-main)" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="18" r="3" fill="#FF6B6B"/>
      <circle cx="82" cy="14" r="3.5" fill="#6BCBFF"/>
      <circle cx="104" cy="18" r="3" fill="#6BCB77"/>
    `,
    bowtie: `
      <!-- Cute Bowtie -->
      <polygon points="62,118 78,124 62,130" fill="#FF6B6B" stroke="var(--ink-main)" stroke-width="2"/>
      <polygon points="98,118 82,124 98,130" fill="#FF6B6B" stroke="var(--ink-main)" stroke-width="2"/>
      <circle cx="80" cy="124" r="4.5" fill="#FFD93D" stroke="var(--ink-main)" stroke-width="2"/>
    `
  };

  const hatButtons = document.querySelectorAll('.wardrobe-hat-btn');
  hatButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const hatType = btn.getAttribute('data-hat') || 'none';

      hatButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (hatLayer) {
        hatLayer.innerHTML = hatDefinitions[hatType] || '';
      }

      if (window.CuteAudio) window.CuteAudio.sparkle();

      if (speechBubble) {
        if (hatType === 'beret') speechBubble.textContent = "Bonjour! Ready to paint masterpieces! 🎨";
        else if (hatType === 'party') speechBubble.textContent = "Party mode activated! Woohoo! 🥳";
        else if (hatType === 'tophat') speechBubble.textContent = "Quite distinguished, old chap! 🧐";
        else if (hatType === 'flower') speechBubble.textContent = "A flower for a sweet day! 🌸";
        else if (hatType === 'crown') speechBubble.textContent = "All hail Barnaby, King of Margins! 👑";
        else speechBubble.textContent = "Back to natural squishy mode! 🧸";
      }

      triggerBarnabyReaction();
    });
  });

  // --------------------------------------------------------------------------
  // 4. COLOR PICKER FOR BARNABY'S BLOB BODY
  // --------------------------------------------------------------------------
  const colorButtons = document.querySelectorAll('.wardrobe-color-btn');
  colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const newColor = btn.getAttribute('data-color') || '#FFD93D';

      colorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (barnabyBody) {
        barnabyBody.setAttribute('fill', newColor);
      }

      if (window.CuteAudio) window.CuteAudio.swatch();

      if (speechBubble) {
        speechBubble.textContent = "Ooh! I love this color on me! ✨";
      }

      triggerBarnabyReaction();
    });
  });
});
