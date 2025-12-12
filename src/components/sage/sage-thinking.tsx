'use client';

import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const THINKING_PHRASES = [
  'Thinking',
  'Analyzing',
  'Processing',
  'Considering',
  'Reflecting',
  'Evaluating',
  'Reasoning',
  'Pondering',
  'Computing',
  'Gathering insights',
];

interface SageThinkingProps {
  /** Size of the Lottie animation */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the text */
  showText?: boolean;
  /** Custom className */
  className?: string;
}

const SIZE_MAP = {
  small: { width: 24, height: 24 },
  medium: { width: 32, height: 32 },
  large: { width: 48, height: 48 },
};

/**
 * SageThinking - Animated thinking indicator for Sage AI
 *
 * Shows a Lottie animation with rotating "thinking" phrases
 * that have an animated blue gradient text effect.
 */
export function SageThinking({
  size = 'medium',
  showText = true,
  className = ''
}: SageThinkingProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const dimensions = SIZE_MAP[size];

  // Rotate through phrases
  useEffect(() => {
    if (!showText) return;

    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [showText]);

  return (
    <div className={`sage-thinking ${className}`}>
      <div
        className="sage-thinking-lottie"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <DotLottieReact
          src="https://lottie.host/220ceadd-12f3-4e8a-94cb-c3b1c4b9f61e/JzjN1zfCBx.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {showText && (
        <span className="sage-thinking-text">
          {THINKING_PHRASES[phraseIndex]}
          <span className="sage-thinking-dots">...</span>
        </span>
      )}
    </div>
  );
}

/**
 * Inline version for use in message bubbles
 */
export function SageThinkingInline({ className = '' }: { className?: string }) {
  return (
    <div className={`sage-thinking-inline ${className}`}>
      <div className="sage-thinking-lottie-inline">
        <DotLottieReact
          src="https://lottie.host/220ceadd-12f3-4e8a-94cb-c3b1c4b9f61e/JzjN1zfCBx.lottie"
          loop
          autoplay
          style={{ width: 20, height: 20 }}
        />
      </div>
      <span className="sage-thinking-text-inline">Thinking...</span>
    </div>
  );
}
