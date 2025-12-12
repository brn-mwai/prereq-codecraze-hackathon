# Elements AI Visuals Documentation

> **Source:** [elements.surge.studio/docs](https://elements.surge.studio/docs)
> **Creator:** Hayden Barnett @ [Surge Studio](https://surge.studio)
> **Purpose:** Animated AI visuals for Sage assistant in Prereq
> **Preset:** 7 (Sage Representative Visual)

---

## Table of Contents

1. [Overview](#overview)
2. [Available Products](#available-products)
3. [Getting Started](#getting-started)
4. [State Machines](#state-machines)
5. [Customization](#customization)
6. [Troubleshooting & Support](#troubleshooting--support)
7. [Implementation for Sage](#implementation-for-sage)

---

## Overview

Elements offers animated AI visuals powered by **Rive** for designers and developers. These visuals feature dynamic animations for different states:

- **Listening** - When receiving audio input
- **Thinking** - During processing/loading states
- **Speaking** - During text-to-speech output
- **Idle** - Default looping animation
- **Asleep** - Dormant/inactive state

### Key Features

| Feature | Description |
|---------|-------------|
| **Dynamic Animations** | Each visual includes its own dynamic animations for listening, thinking, speaking, and more |
| **Minimal File Size** | Optimized file sizes (3-14 KB) compared to alternatives |
| **Source Files Included** | Each purchase includes both runtime (.riv) and customizable source (.rev) files |
| **Cross-Platform** | Works on Web, iOS, macOS, Android, Windows, Flutter, React, React Native, and more |

### Demo Application

- **Live Demo:** [elements-ai-demo.vercel.app](https://elements-ai-demo.vercel.app/)
- **Source Code:** [github.com/surge-studio/elements-ai-demo](https://github.com/surge-studio/elements-ai-demo)

---

## Available Products

### Free Products

| Visual | Size | File Size | Description |
|--------|------|-----------|-------------|
| **Command** | Small (64x64) | 3 KB | Compact AI visual |
| **Pal** | Large (256x256) | 14 KB | Large friendly AI visual |

### Paid Products ($9 each)

| Visual | Size | File Size | Description |
|--------|------|-----------|-------------|
| **Obsidian** | Medium (128x128) | 8 KB | Dark, elegant visual |
| **Mana** | Medium (128x128) | 8 KB | Mystical visual |
| **Orb** | Medium (128x128) | 9 KB | Spherical visual |
| **Halo** | Large (256x256) | 5 KB | Ring-style visual |
| **Glint** | Medium (128x128) | 5 KB | Sparkling visual |

### Bundle Deal

**Elements Ultimate Bundle:** ~~$45~~ **$24** (includes all products)

---

## Getting Started

### Step 1: Install Rive Runtime

For React web applications, use the **WebGL2 runtime** (required for Elements' vector feathering feature):

```bash
npm install @rive-app/react-webgl2
```

> **Note:** Additional runtime options available at [rive.app/docs/runtimes](https://rive.app/docs/runtimes/choose-a-renderer/overview)

### Step 2: Basic Component Implementation

```tsx
import { useRive, useStateMachineInput } from '@rive-app/react-webgl2';
import { useEffect } from 'react';

interface AIVisualProps {
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
}

export function AIVisual({
  isListening = false,
  isThinking = false,
  isSpeaking = false,
}: AIVisualProps) {
  const { rive, RiveComponent } = useRive({
    src: '/command-2.0.riv',
    stateMachines: 'default',
    autoplay: true,
  });

  const listeningInput = useStateMachineInput(rive, 'default', 'listening');
  const thinkingInput = useStateMachineInput(rive, 'default', 'thinking');
  const speakingInput = useStateMachineInput(rive, 'default', 'speaking');

  useEffect(() => {
    if (listeningInput) listeningInput.value = isListening;
  }, [isListening, listeningInput]);

  useEffect(() => {
    if (thinkingInput) thinkingInput.value = isThinking;
  }, [isThinking, thinkingInput]);

  useEffect(() => {
    if (speakingInput) speakingInput.value = isSpeaking;
  }, [isSpeaking, speakingInput]);

  return <RiveComponent className="h-[64px] w-[64px]" />;
}
```

> **Important:** The state machine name is always `'default'` for Elements AI visuals.

---

## State Machines

State machines control the AI visual animations. Each visual supports the following states:

### Available States

| State | Type | Description | Controllable |
|-------|------|-------------|--------------|
| `idle` | - | Default looping animation | No (automatic) |
| `listening` | Boolean | Activate when receiving audio input | Yes |
| `thinking` | Boolean | Activate during processing/loading | Yes |
| `speaking` | Boolean | Activate during text-to-speech output | Yes |
| `asleep` | Boolean | Dormant/inactive state | Yes |
| `color` | Number (0-8) | Legacy color mode (v1.0 visuals only) | Yes |

### React Implementation

```tsx
import { useRive, useStateMachineInput } from '@rive-app/react-webgl2';

function AIVisualWithControls() {
  const { rive, RiveComponent } = useRive({
    src: '/command-2.0.riv',
    stateMachines: 'default',
    autoplay: true,
  });

  const listeningInput = useStateMachineInput(rive, 'default', 'listening');
  const thinkingInput = useStateMachineInput(rive, 'default', 'thinking');
  const speakingInput = useStateMachineInput(rive, 'default', 'speaking');

  const setListening = (value: boolean) => {
    if (listeningInput) listeningInput.value = value;
  };

  const setThinking = (value: boolean) => {
    if (thinkingInput) thinkingInput.value = value;
  };

  const setSpeaking = (value: boolean) => {
    if (speakingInput) speakingInput.value = value;
  };

  return (
    <div>
      <RiveComponent className="h-[128px] w-[128px]" />
      <div className="flex gap-2">
        <button onClick={() => setListening(true)}>Start Listening</button>
        <button onClick={() => setThinking(true)}>Start Thinking</button>
        <button onClick={() => setSpeaking(true)}>Start Speaking</button>
      </div>
    </div>
  );
}
```

---

## Customization

### Color Customization (v2.0 Visuals)

v2.0 visuals use **View Models** for color customization via data-binding.

#### Required Hooks

```tsx
import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceColor,
} from '@rive-app/react-webgl2';
```

#### Implementation

```tsx
function CustomColorVisual() {
  const { rive, RiveComponent } = useRive({
    src: '/glint-2.0.riv',
    stateMachines: 'default',
    autoplay: true,
  });

  const viewModel = useViewModel(rive, { useDefault: true });
  const viewModelInstance = useViewModelInstance(viewModel, rive, {
    useDefault: true,
  });
  const colorInput = useViewModelInstanceColor('color', viewModelInstance);

  const setCustomColor = (r: number, g: number, b: number) => {
    if (colorInput?.setRgb) {
      colorInput.setRgb(r, g, b);
    }
  };

  return (
    <div>
      <RiveComponent className="h-[128px] w-[128px]" />
      <button onClick={() => setCustomColor(124, 41, 216)}>
        Set Purple
      </button>
      <button onClick={() => setCustomColor(16, 185, 129)}>
        Set Emerald (Sage)
      </button>
    </div>
  );
}
```

#### setRgb Function

```typescript
setRgb(r: number, g: number, b: number): void
```

Sets the visual color using RGB values (0-255 for each channel).

### Legacy Color Modes (v1.0 Visuals)

For v1.0 products, use predefined color modes (0-8):

```tsx
const colorModeInput = useStateMachineInput(rive, 'default', 'color');

// Set color mode (0-8)
if (colorModeInput) {
  colorModeInput.value = 3; // Select color mode 3
}
```

### File Customization

Each purchase includes:

| File Type | Extension | Purpose |
|-----------|-----------|---------|
| Runtime Asset | `.riv` | Use in your application |
| Source File | `.rev` | Edit in Rive Editor for custom modifications |

#### Resources for Editing

- [Rive Editor Documentation](https://rive.app/community/doc)
- [Rive 101 YouTube Playlist](https://www.youtube.com/playlist?list=PLujDTZWVDSsFGonP9kzAnvryowW098-p5)

---

## Troubleshooting & Support

### Common Issues

#### 1. Visual Not Loading

**Problem:** The visual component fails to render.

**Solutions:**
- Add an `onLoad` callback for debugging:
  ```tsx
  const { rive, RiveComponent } = useRive({
    src: '/command-2.0.riv',
    stateMachines: 'default',
    autoplay: true,
    onLoad: () => console.log('Visual loaded successfully'),
  });
  ```
- Verify the stateMachine is set to `'default'`
- Confirm you're using a licensed product
- Check that the `src` file path is correct
- Ensure you're using the latest supported renderer (`@rive-app/react-webgl2`)

#### 2. State Machine Inputs Not Working

**Problem:** Input controls don't respond as expected.

**Solutions:**
- Input names are **case-sensitive**
- Must be one of: `'listening'`, `'thinking'`, `'speaking'`, or `'asleep'`
- Use correct state machine name (`'default'`):
  ```tsx
  useStateMachineInput(rive, 'default', 'listening')
  ```

#### 3. Browser Compatibility

**Problem:** Visual doesn't work in certain browsers.

**Solutions:**
- WebGL2 runtime requires browser support for WebGL2
- Check compatibility at [caniuse.com/webgl2](https://caniuse.com/webgl2)
- Modern browsers (Chrome, Firefox, Safari, Edge) support WebGL2

### Getting Help

| Resource | Link |
|----------|------|
| Demo Repository | [github.com/surge-studio/elements-ai-demo](https://github.com/surge-studio/elements-ai-demo) |
| Official Rive Docs | [rive.app/community/doc](https://rive.app/community/doc) |
| Direct Contact | hayden@surge.studio |

---

## Implementation for Sage

### Sage Visual Configuration

For Prereq's Sage AI assistant:

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Visual** | Orb v1.2 | Mystical, wise appearance matching Sage persona |
| **File Path** | `/Assets/orb-1.2.riv` | Located in public folder |
| **Size** | 64x64 (default) | Fits chat widget header |
| **Color Mode** | 3 (default) | Emerald-ish tone matching Sage branding |
| **Version** | v1.2 (legacy) | Uses color modes 0-8, not View Models |

### Sage States Mapping

| Sage State | Visual State | When to Activate |
|------------|--------------|------------------|
| Idle/Ready | `idle` | Default state, waiting for input |
| User typing | `listening` | When user is composing a message |
| Processing | `thinking` | While Claude API is generating response |
| Responding | `speaking` | While streaming/displaying response |
| Inactive | `asleep` | Chat minimized or inactive for extended period |

### Sage Visual Component

**Location:** `src/components/sage/sage-visual.tsx`

```tsx
import { SageVisual, useSageState } from '@/components/sage';

// Basic usage
<SageVisual state="thinking" size="large" />

// With state management hook
function SageChat() {
  const { state, setThinking, setSpeaking, setIdle } = useSageState();

  return <SageVisual state={state} size="large" />;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `'idle' \| 'listening' \| 'thinking' \| 'speaking' \| 'asleep'` | `'idle'` | Current animation state |
| `size` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | `'large'` | Size variant (32/48/64/128px) |
| `className` | `string` | `''` | Additional CSS classes |
| `colorMode` | `number` | `3` | Color mode 0-8 for v1.x visuals |
| `onLoad` | `() => void` | - | Callback when visual loads |

### Usage in Sage Chat Component

```tsx
import { SageVisual, useSageState } from '@/components/sage';

function SageChatHeader() {
  const { state, setListening, setThinking, setSpeaking, setIdle } = useSageState();

  // Call these based on chat events:
  // - setListening() → when user is typing
  // - setThinking() → when message sent, awaiting AI response
  // - setSpeaking() → when AI response is streaming
  // - setIdle() → when response complete

  return (
    <div className="flex items-center gap-3">
      <SageVisual state={state} size="large" />
      <div>
        <span className="font-semibold text-emerald-600">Sage</span>
        <span className="text-xs text-gray-500 block">
          {state === 'thinking' && 'Thinking...'}
          {state === 'speaking' && 'Responding...'}
          {state === 'listening' && 'Listening...'}
          {state === 'idle' && 'Ready to help'}
        </span>
      </div>
    </div>
  );
}
```

---

## Platform Support

Elements AI visuals work across all major platforms:

| Platform | Runtime Available |
|----------|-------------------|
| Web | Yes |
| React | Yes |
| React Native | Yes |
| iOS | Yes |
| macOS | Yes |
| Android | Yes |
| Windows | Yes |
| Flutter | Yes |
| Unity | Yes |
| Unreal | Yes |
| Rust | Yes |
| C++ | Yes |
| Framer | Yes |
| Defold | Yes |
| Tizen | Yes |
| Bevy | Yes |

---

## License & Legal

- **License Agreement:** [elements.surge.studio/legal/license](https://elements.surge.studio/legal/license)
- **Terms of Service:** [elements.surge.studio/legal/terms](https://elements.surge.studio/legal/terms)
- **Privacy Policy:** [elements.surge.studio/legal/privacy](https://elements.surge.studio/legal/privacy)

---

*Documentation scraped and compiled for Prereq/Sage implementation*
*Last updated: December 2024*
