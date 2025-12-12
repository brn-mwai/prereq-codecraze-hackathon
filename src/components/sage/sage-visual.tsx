'use client';

import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useEffect, useState } from 'react';

export type SageState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'asleep';

interface SageVisualProps {
  /** Current state of the Sage assistant */
  state?: SageState;
  /** Size variant */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** Optional additional className */
  className?: string;
  /** Color mode (0-8) for v1.x visuals */
  colorMode?: number;
  /** Callback when visual loads */
  onLoad?: () => void;
}

const SIZE_MAP = {
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 128,
};

/**
 * SageVisual - Animated AI visual for Sage assistant
 *
 * Uses Rive animation with the Orb visual from Elements AI
 * Supports states: idle, listening, thinking, speaking, asleep
 *
 * @example
 * ```tsx
 * <SageVisual state="thinking" size="large" />
 * ```
 */
export function SageVisual({
  state = 'idle',
  size = 'large',
  className = '',
  colorMode = 7, // Preset 7 for Sage AI
  onLoad,
}: SageVisualProps) {
  const dimensions = SIZE_MAP[size];

  const { rive, RiveComponent } = useRive({
    src: '/Assets/orb-1.2.riv',
    stateMachines: 'default',
    autoplay: true,
    onLoad: () => {
      console.log('[SageVisual] Orb visual loaded successfully');
      onLoad?.();
    },
  });

  // State machine inputs - using 'default' as per Elements AI docs
  const listeningInput = useStateMachineInput(rive, 'default', 'listening');
  const thinkingInput = useStateMachineInput(rive, 'default', 'thinking');
  const speakingInput = useStateMachineInput(rive, 'default', 'speaking');
  const asleepInput = useStateMachineInput(rive, 'default', 'asleep');

  // Color mode input (v1.x uses numeric color modes 0-8)
  const colorModeInput = useStateMachineInput(rive, 'default', 'color');

  // Set color mode on load
  useEffect(() => {
    if (colorModeInput && typeof colorMode === 'number') {
      colorModeInput.value = Math.min(Math.max(colorMode, 0), 8);
    }
  }, [colorModeInput, colorMode]);

  // Update states based on prop
  useEffect(() => {
    // Reset all states first
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
        // Idle is the default state, no inputs need to be true
        break;
    }
  }, [state, listeningInput, thinkingInput, speakingInput, asleepInput]);

  return (
    <div
      className={`sage-visual-container ${className}`}
      style={{
        width: dimensions,
        height: dimensions,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={`Sage assistant is ${state}`}
    >
      <RiveComponent
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

/**
 * Hook to manage Sage visual state based on chat interactions
 */
export function useSageState() {
  const [state, setState] = useState<SageState>('idle');

  const setListening = () => setState('listening');
  const setThinking = () => setState('thinking');
  const setSpeaking = () => setState('speaking');
  const setIdle = () => setState('idle');
  const setAsleep = () => setState('asleep');

  return {
    state,
    setState,
    setListening,
    setThinking,
    setSpeaking,
    setIdle,
    setAsleep,
  };
}
