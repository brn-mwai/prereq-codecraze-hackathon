// ============================================
// PREREQ EXTENSION - Sage Orb (Rive Animation)
// ============================================

/**
 * Initialize a Sage orb with Rive animation
 * @param {HTMLCanvasElement} canvas - The canvas element to render to
 * @param {Object} options - Configuration options
 * @returns {Object} - Control functions for the orb
 */
export async function initSageOrb(canvas, options = {}) {
  const {
    size = 48,
    colorMode = 7, // Preset 7 for Sage AI
    initialState = 'idle',
  } = options;

  // Set canvas size
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  // Wait for Rive to be available
  if (typeof rive === 'undefined') {
    console.warn('[SageOrb] Rive not loaded, using fallback');
    return createFallbackOrb(canvas, size);
  }

  try {
    const riveInstance = new rive.Rive({
      src: chrome.runtime.getURL('assets/orb.riv'),
      canvas: canvas,
      autoplay: true,
      stateMachines: 'default',
      onLoad: () => {
        console.log('[SageOrb] Rive orb loaded');

        // Set color mode
        const inputs = riveInstance.stateMachineInputs('default');
        const colorInput = inputs?.find(i => i.name === 'color');
        if (colorInput) {
          colorInput.value = colorMode;
        }

        // Set initial state
        setState(initialState);
      },
      onLoadError: (err) => {
        console.error('[SageOrb] Failed to load:', err);
      },
    });

    // State control functions
    const setState = (state) => {
      const inputs = riveInstance.stateMachineInputs('default');
      if (!inputs) return;

      // Reset all states
      const listeningInput = inputs.find(i => i.name === 'listening');
      const thinkingInput = inputs.find(i => i.name === 'thinking');
      const speakingInput = inputs.find(i => i.name === 'speaking');
      const asleepInput = inputs.find(i => i.name === 'asleep');

      if (listeningInput) listeningInput.value = false;
      if (thinkingInput) thinkingInput.value = false;
      if (speakingInput) speakingInput.value = false;
      if (asleepInput) asleepInput.value = false;

      // Set active state
      switch (state) {
        case 'listening':
          if (listeningInput) listeningInput.value = true;
          break;
        case 'thinking':
          if (thinkingInput) thinkingInput.value = true;
          break;
        case 'speaking':
          if (speakingInput) speakingInput.value = true;
          break;
        case 'asleep':
          if (asleepInput) asleepInput.value = true;
          break;
        case 'idle':
        default:
          // Idle is default, no inputs need to be true
          break;
      }
    };

    return {
      setState,
      setIdle: () => setState('idle'),
      setThinking: () => setState('thinking'),
      setSpeaking: () => setState('speaking'),
      setListening: () => setState('listening'),
      setAsleep: () => setState('asleep'),
      cleanup: () => riveInstance.cleanup(),
    };
  } catch (error) {
    console.error('[SageOrb] Error initializing Rive:', error);
    return createFallbackOrb(canvas, size);
  }
}

/**
 * Create a CSS-animated fallback orb if Rive fails to load
 */
function createFallbackOrb(canvas, size) {
  const ctx = canvas.getContext('2d');
  let animationFrame;
  let currentState = 'idle';
  let pulsePhase = 0;

  const draw = () => {
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.35;

    // Pulse effect based on state
    let pulseAmount = 0;
    let pulseSpeed = 0.02;

    if (currentState === 'thinking') {
      pulseSpeed = 0.06;
      pulseAmount = Math.sin(pulsePhase) * 4;
    } else if (currentState === 'speaking') {
      pulseSpeed = 0.08;
      pulseAmount = Math.sin(pulsePhase) * 6;
    } else if (currentState === 'listening') {
      pulseSpeed = 0.04;
      pulseAmount = Math.sin(pulsePhase) * 3;
    } else {
      pulseAmount = Math.sin(pulsePhase) * 2;
    }

    pulsePhase += pulseSpeed;

    // Outer glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, baseRadius * 0.5,
      centerX, centerY, baseRadius + pulseAmount + 8
    );
    gradient.addColorStop(0, 'rgba(25, 84, 250, 0.4)');
    gradient.addColorStop(0.7, 'rgba(25, 84, 250, 0.1)');
    gradient.addColorStop(1, 'rgba(25, 84, 250, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + pulseAmount + 8, 0, Math.PI * 2);
    ctx.fill();

    // Main orb
    const orbGradient = ctx.createRadialGradient(
      centerX - baseRadius * 0.3, centerY - baseRadius * 0.3, 0,
      centerX, centerY, baseRadius + pulseAmount
    );
    orbGradient.addColorStop(0, '#5a91ff');
    orbGradient.addColorStop(0.5, '#1954FA');
    orbGradient.addColorStop(1, '#1447d4');

    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + pulseAmount, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      centerX - baseRadius * 0.25,
      centerY - baseRadius * 0.25,
      baseRadius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    animationFrame = requestAnimationFrame(draw);
  };

  draw();

  return {
    setState: (state) => { currentState = state; },
    setIdle: () => { currentState = 'idle'; },
    setThinking: () => { currentState = 'thinking'; },
    setSpeaking: () => { currentState = 'speaking'; },
    setListening: () => { currentState = 'listening'; },
    setAsleep: () => { currentState = 'asleep'; },
    cleanup: () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    },
  };
}

/**
 * Simple helper to create an orb in a container element
 */
export function createOrbInContainer(container, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'sage-orb-canvas';
  container.appendChild(canvas);
  return initSageOrb(canvas, options);
}
