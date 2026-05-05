import { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  colorIdx: number;
  shapeIdx: number;
  xDrift: number;
  sway: number;
  opacity: number;
  rotation: number;
}

// 장미 색상: [중심 밝은색, 가장자리 짙은색, 테두리]
const COLOR_SETS = [
  { inner: '#F4A0C0', outer: '#B03060', stroke: '#C84878' },
  { inner: '#F07898', outer: '#961838', stroke: '#C03860' },
  { inner: '#FFB8CC', outer: '#CC6088', stroke: '#E080A0' },
  { inner: '#F090A8', outer: '#A02048', stroke: '#CC5070' },
  { inner: '#F5C0D0', outer: '#C07090', stroke: '#DC90A8' },
];

// 꽃잎 모양 변형 3종 — 자연스러운 비대칭
const PETAL_PATHS = [
  'M28,50 C11,43 2,29 5,15 C8,4 17,-1 24,2 Q28,-2 32,2 C39,-1 48,4 51,15 C54,29 45,43 28,50 Z',
  'M27,50 C10,44 2,30 4,16 C7,5 15,0 22,2 Q27,-1 33,3 C40,0 49,6 52,17 C55,31 46,44 27,50 Z',
  'M29,50 C13,44 3,30 6,15 C9,4 18,-1 25,2 Q29,-2 34,2 C41,0 50,5 52,16 C55,30 45,43 29,50 Z',
];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function RosePetalSVG({ id, colorIdx, shapeIdx, size }: { id: number; colorIdx: number; shapeIdx: number; size: number }) {
  const { inner, outer, stroke } = COLOR_SETS[colorIdx];
  const gid = `rg${id}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 0.95)}
      viewBox="0 0 56 52"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 중심에서 가장자리로 — 밝은 중심, 짙은 테두리 (벨벳 느낌) */}
        <radialGradient id={gid} cx="50%" cy="42%" r="62%">
          <stop offset="0%"   stopColor={inner} stopOpacity="0.90" />
          <stop offset="55%"  stopColor={outer} stopOpacity="0.88" />
          <stop offset="100%" stopColor={outer} stopOpacity="0.70" />
        </radialGradient>
      </defs>

      {/* 꽃잎 본체 */}
      <path
        d={PETAL_PATHS[shapeIdx]}
        fill={`url(#${gid})`}
        stroke={stroke}
        strokeWidth="0.4"
        strokeOpacity="0.25"
      />

      {/* 중심 맥 (midrib) */}
      <path
        d="M28,49 Q27.5,32 28,4"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* 좌측 측맥 */}
      <path
        d="M27,38 Q19,27 13,18"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.45"
        fill="none"
        strokeLinecap="round"
      />

      {/* 우측 측맥 */}
      <path
        d="M29,38 Q37,27 43,18"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.45"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FlowerPetals() {
  const { petals, css } = useMemo(() => {
    const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;

    const petalCount = 24;
    const spawnLowThreshold = 15;

    const petals: Petal[] = Array.from({ length: petalCount }, (_, i) => {
      const duration = rand(9, 17);
      const spawnLow = i >= spawnLowThreshold;
      const delay = spawnLow ? -(duration * rand(0.40, 0.72)) : rand(0, 26);

      return {
        id: i,
        left: rand(-10, 85),
        delay,
        duration,
        size: rand(22, 40),
        colorIdx: Math.floor(Math.random() * COLOR_SETS.length),
        shapeIdx: Math.floor(Math.random() * PETAL_PATHS.length),
        xDrift: isPortrait ? rand(30, 55) : rand(160, 200),
        sway: rand(-4, 4),
        opacity: rand(0.68, 0.92),
        rotation: rand(200, 500) * (Math.random() > 0.5 ? 1 : -1),
      };
    });

    const css = petals.map(p => {
      const r = (n: number) => n.toFixed(1);
      return `
        @keyframes pf${p.id} {
          0%   { transform: translateX(0vh)                               translateY(-10vh) rotate(${r(p.rotation * -0.08)}deg); opacity: 0; }
          6%   { opacity: ${p.opacity.toFixed(2)}; }
          33%  { transform: translateX(${r(p.xDrift * 0.33 + p.sway)}vh) translateY(${r(110 * 0.33)}vh) rotate(${r(p.rotation * 0.33)}deg); }
          66%  { transform: translateX(${r(p.xDrift * 0.66 - p.sway)}vh) translateY(${r(110 * 0.66)}vh) rotate(${r(p.rotation * 0.66)}deg); }
          90%  { opacity: ${(p.opacity * 0.5).toFixed(2)}; }
          100% { transform: translateX(${r(p.xDrift)}vh)                  translateY(110vh) rotate(${r(p.rotation)}deg); opacity: 0; }
        }
      `;
    }).join('');

    return { petals, css };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      <style>{css}</style>
      {petals.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            animation: `pf${p.id} ${p.duration}s ${p.delay}s infinite linear`,
            animationFillMode: 'backwards',
            willChange: 'transform, opacity',
          }}
        >
          <RosePetalSVG id={p.id} colorIdx={p.colorIdx} shapeIdx={p.shapeIdx} size={p.size} />
        </div>
      ))}
    </div>
  );
}
