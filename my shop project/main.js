// AURA Scroll Showcase Javascript Engine (Parallax Slide-Over with Hero Text Version)

const TOTAL_FRAMES = 180;
const FRAMES_DIR = 'public/frames/';
const FRAME_PREFIX = 'ezgif-frame-';
const FRAME_EXTENSION = '.jpg';

const state = {
  images: [],
  loadedCount: 0,
  currentFrame: 1,
  targetFrame: 1
};

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const scrollTrack = document.getElementById('scroll-track');
const heroOverlay = document.getElementById('hero-overlay');

function getFrameUrl(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `${FRAMES_DIR}${FRAME_PREFIX}${paddedIndex}${FRAME_EXTENSION}`;
}

// Load all frames silently in the background
function initImages() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    img.onload = () => {
      state.loadedCount++;
      // Render the very first frame immediately once loaded, so the user sees the page content instantly
      if (i === 1 && state.currentFrame === 1) {
        drawFrame(1);
      }
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${img.src}`);
      state.loadedCount++;
    };
    state.images.push(img);
  }
}

// Canvas Sizing
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  drawFrame(Math.round(state.currentFrame));
}

// Draw Frame
function drawFrame(frameIndex) {
  const index = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex));
  const img = state.images[index - 1];
  
  if (!img || !img.complete) return;
  
  // Clear canvas (pure black to match website blackspace)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
  const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
  
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  // Calculate fit-contain sizing
  if (canvasRatio > imgRatio) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imgRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }
  
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Animation Loop (Lerp & Render)
function animationLoop() {
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  
  // Track height boundary calculations
  const trackHeight = scrollTrack.scrollHeight;
  
  // Fade out hero overlay text as we scroll down
  if (heroOverlay) {
    if (scrollTop < viewportHeight) {
      heroOverlay.style.display = 'flex';
      const fadeProgress = Math.max(0, 1 - (scrollTop / (viewportHeight * 0.75)));
      heroOverlay.style.opacity = fadeProgress;
    } else {
      heroOverlay.style.display = 'none';
    }
  }
  
  // The animation plays over the track height MINUS the viewport height
  // Since trackHeight is 450vh, the active scroll range is 350vh.
  const activeScrollRange = trackHeight - viewportHeight;
  const scrollPercent = activeScrollRange <= 0 ? 0 : scrollTop / activeScrollRange;
  
  // Map scroll percent to the target frame index (caps at TOTAL_FRAMES when scrollPercent >= 1.0)
  state.targetFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(scrollPercent * (TOTAL_FRAMES - 1)) + 1));
  
  // Smooth scroll interpolation (lerp)
  const frameDiff = state.targetFrame - state.currentFrame;
  if (Math.abs(frameDiff) > 0.05) {
    state.currentFrame += frameDiff * 0.12; // Smooth lerp coefficient
  } else {
    state.currentFrame = state.targetFrame;
  }
  
  // Performance Optimization: Hide canvas drawing completely once #content-wrapper slides over and covers it
  // #content-wrapper starts entering viewport at activeScrollRange (350vh) and covers it completely at trackHeight (450vh)
  if (scrollTop >= trackHeight) {
    canvas.style.display = 'none';
  } else {
    canvas.style.display = 'block';
    drawFrame(Math.round(state.currentFrame));
  }
  
  requestAnimationFrame(animationLoop);
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);

// Prevent scroll jumps
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// Init on Load
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  initImages();
  requestAnimationFrame(animationLoop);
});
