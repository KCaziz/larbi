import { useEffect, useId, useRef } from 'react';
import './Waves.css';

// P13-03 (2026-11-22): the waves of the client's model — the card at the foot of
// the menu — on the two home pages, one at the top and one at the bottom, and
// moving with the scroll: the layers slide in opposite directions, so they cross
// as the page goes by.
//
// A wave that looks like one: several layers, each the sum of two swells of
// different length (an irregular crest, not a regular sine), in sea colours
// fading downwards. Each layer is drawn over TWO widths of the same period, so
// sliding it by any amount never shows its end.
const WIDTH = 1440;
const STEP = 12;

const LAYERS = [
  { swells: [[0.16, 2, 0.4], [0.06, 5, 1.7]], level: 0.42, from: '#10a9b6', to: '#055686', opacity: 0.22, speed: 0.18, dir: 1 },
  { swells: [[0.13, 3, 2.1], [0.05, 7, 0.3]], level: 0.58, from: '#4fe5d3', to: '#0b8f9b', opacity: 0.34, speed: 0.3, dir: -1 },
  { swells: [[0.1, 2, 4.2], [0.04, 6, 2.6]], level: 0.74, from: '#7ff0e2', to: '#10a9b6', opacity: 0.5, speed: 0.45, dir: 1 },
];

// A narrow box (the menu card): longer swells, so the crests are not crowded,
// and brighter water on the dark card.
const CALM_LAYERS = [
  { swells: [[0.14, 1, 0.6], [0.06, 2, 2.2]], level: 0.38, from: '#10a9b6', to: '#0b8f9b', opacity: 0.45, speed: 0.08, dir: 1 },
  { swells: [[0.12, 1, 2.9], [0.05, 3, 0.8]], level: 0.56, from: '#4fe5d3', to: '#10a9b6', opacity: 0.55, speed: 0.12, dir: -1 },
  { swells: [[0.09, 2, 4.4], [0.03, 3, 1.5]], level: 0.74, from: '#a8f5ec', to: '#4fe5d3', opacity: 0.7, speed: 0.16, dir: 1 },
];

// The outline of one layer, `height` high, filled towards the bottom (a wave
// rising from the foot) or towards the top (`hanging`, a wave at the head).
function wavePath({ swells, level }, height, hanging = false) {
  const points = [];
  for (let x = 0; x <= WIDTH * 2; x += STEP) {
    const lift = swells.reduce((sum, [amplitude, periods, phase]) => sum + amplitude * Math.sin((2 * Math.PI * periods * x) / WIDTH + phase), 0);
    const y = (hanging ? 1 - level - lift : level + lift) * height;
    points.push(`${x},${Math.round(y * 10) / 10}`);
  }
  const edge = hanging ? 0 : height;
  return `M0,${edge} L${points.join(' L')} L${WIDTH * 2},${edge} Z`;
}

// Moves every layer of `ref` with the window's scroll (no motion when the
// visitor asked for less).
function useScrollWaves(ref, enabled) {
  useEffect(() => {
    const box = ref.current;
    if (!enabled || !box || typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const layers = [...box.querySelectorAll('.waves-layer')];
    let frame = 0;
    const paint = () => {
      frame = 0;
      const width = box.clientWidth || 1;
      const scrolled = window.scrollY;
      for (const layer of layers) {
        const speed = Number(layer.dataset.speed);
        const shift = (scrolled * speed) % width;
        const x = layer.dataset.dir === '1' ? -shift : shift - width;
        layer.style.transform = `translate3d(${x}px, 0, 0)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref, enabled]);
}

// `position`: 'top' (hanging from the top edge) or 'bottom' (rising from the
// bottom edge). `height` in pixels. Decoration only: hidden from screen readers.
// `calm`: the variant for a narrow box.
export default function Waves({ position = 'bottom', height = 120, moving = true, calm = false, className = '' }) {
  const id = useId().replace(/:/g, '');
  const ref = useRef(null);
  const hanging = position === 'top';
  useScrollWaves(ref, moving);
  return (
    <div ref={ref} className={`waves waves-${position} ${className}`.trim()} style={{ blockSize: height }} aria-hidden="true">
      {(calm ? CALM_LAYERS : LAYERS).map((layer, index) => (
        <svg key={index} className="waves-layer" data-speed={layer.speed} data-dir={layer.dir} viewBox={`0 0 ${WIDTH * 2} ${height}`} preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id={`${id}-${index}`} x1="0" y1={hanging ? '1' : '0'} x2="0" y2={hanging ? '0' : '1'}>
              <stop offset="0%" stopColor={layer.from} />
              <stop offset="100%" stopColor={layer.to} />
            </linearGradient>
          </defs>
          <path d={wavePath(layer, height, hanging)} fill={`url(#${id}-${index})`} fillOpacity={layer.opacity} />
        </svg>
      ))}
    </div>
  );
}
