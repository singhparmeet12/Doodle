/**
 * Scribbleverse Signature Interaction:
 * The GSAP Scroll-Tracking Squiggly Doodle Line & Mascot Tip Rider
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('homepage-interactive-container');
  const path = document.getElementById('scroll-doodle-path');
  const svg = document.getElementById('scroll-line-svg');
  const mascotTip = document.getElementById('scroll-mascot-tip');

  if (!container || !path || !svg || !mascotTip) {
    return;
  }

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildDoodlePath() {
    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || 3200;

    // Set SVG attributes to exact container dimensions
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);

    // Coordinates woven organically through sections
    // Mobile (<768px) keeps closer to center to avoid cutting off
    const isMobile = w < 768;
    const midX = w / 2;
    const leftX = isMobile ? w * 0.15 : w * 0.18;
    const rightX = isMobile ? w * 0.85 : w * 0.82;

    // Build a fun winding path down the page
    const startY = 180;
    const d = `
      M ${midX + 20},${startY}
      C ${rightX},${startY + 250} ${rightX + 40},${h * 0.15} ${midX},${h * 0.20}
      C ${leftX - 30},${h * 0.24} ${leftX},${h * 0.32} ${midX - 20},${h * 0.36}
      C ${rightX - 10},${h * 0.40} ${rightX + 30},${h * 0.48} ${midX + 40},${h * 0.52}
      C ${leftX + 20},${h * 0.56} ${leftX - 40},${h * 0.65} ${midX - 30},${h * 0.70}
      C ${rightX},${h * 0.75} ${rightX - 30},${h * 0.84} ${midX},${h * 0.89}
      C ${leftX},${h * 0.93} ${midX - 60},${h - 180} ${midX},${h - 80}
    `.replace(/\s+/g, ' ').trim();

    path.setAttribute('d', d);

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    return length;
  }

  let totalLength = buildDoodlePath();

  if (prefersReducedMotion) {
    // Reveal line immediately for reduced motion
    path.style.strokeDashoffset = 0;
    mascotTip.style.display = 'none';
    return;
  }

  // Check if GSAP & ScrollTrigger are available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    path.style.strokeDashoffset = 0;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Initial tip position
  const startPt = path.getPointAtLength(0);
  mascotTip.style.transform = `translate(${startPt.x}px, ${startPt.y}px) translate(-50%, -50%)`;
  mascotTip.style.opacity = '1';

  // GSAP ScrollTrigger animation
  const anim = gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = Math.min(Math.max(self.progress, 0), 1);
        const currentLength = progress * totalLength;
        const pt = path.getPointAtLength(currentLength);

        // Calculate angle for natural doodle direction
        let angle = 0;
        if (currentLength + 2 <= totalLength) {
          const nextPt = path.getPointAtLength(currentLength + 2);
          angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
        }

        mascotTip.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%) rotate(${angle * 0.25}deg)`;
      }
    }
  });

  // Re-calculate on window resize with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      totalLength = buildDoodlePath();
      ScrollTrigger.refresh();
    }, 250);
  });
});
