import { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  colorIdx: number;
  xDrift: number;
  sway: number;
  opacity: number;
  rotation: number;
}

// 목련 색상: 백목련~자목련 계열
const COLOR_SETS = [
  { outer: '#FFF8F9', mid: '#FFE4EE', base: '#EDB8D0' }, // 백목련 (흰~연핑크)
  { outer: '#FFFAF8', mid: '#FFEEE0', base: '#F0CEB0' }, // 크림목련
  { outer: '#F8F2FF', mid: '#EAD4F8', base: '#C8A0E0' }, // 자목련 (연보라)
  { outer: '#FFF2F6', mid: '#FFD4E8', base: '#E8A0C4' }, // 연홍목련
  { outer: '#F4EEFF', mid: '#DFC8F8', base: '#B890D8' }, // 짙은 자목련
];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function MagnoliaPetalSVG({ id, colorIdx, size }: { id: number; colorIdx: number; size: number }) {
  const { outer, mid, base } = COLOR_SETS[colorIdx];
  const gid = `mg${id}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.9)}
      viewBox="0 0 44 84"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 목련: 밑동(짙음)에서 끝(연함)으로 — 두꺼운 왁스질 느낌 */}
        <radialGradient id={gid} cx="50%" cy="82%" r="88%">
          <stop offset="0%"   stopColor={base}  stopOpacity="0.95" />
          <stop offset="45%"  stopColor={mid}   stopOpacity="0.88" />
          <stop offset="100%" stopColor={outer} stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* 목련 꽃잎: 길쭉한 주걱 모양, 위아래 모두 뾰족 */}
      <path
        d="M22,81
           C8,70 1,52 2,32
           C3,14 10,2 17,2
           Q22,-1 27,2
           C34,2 41,14 42,32
           C43,52 36,70 22,81 Z"
        fill={`url(#${gid})`}
        stroke={mid}
        strokeWidth="0.4"
        strokeOpacity="0.20"
      />

      {/* 목련 특유의 세로 주름선 (왁스질 광택 표현) */}
      <path
        d="M22,79 Q21.5,42 22,3"
        stroke="rgba(255,255,255,0.50)"
        strokeWidth="0.85"
        fill="none"
        strokeLinecap="round"
      />

      {/* 좌측 광택선 */}
      <path
        d="M20,65 Q13,44 10,24"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 우측 광택선 */}
      <path
        d="M24,65 Q31,44 34,24"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 가장자리 광택 (목련 꽃잎의 두꺼운 느낌) */}
      <path
        d="M8,48 Q4,36 6,22"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M36,48 Q40,36 38,22"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FlowerPetals() {
  const { petals, css } = useMemo(() => {
    const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;

    const petalCount = 18;
    const spawnLowThreshold = 12;

    const petals: Petal[] = Array.from({ length: petalCount }, (_, i) => {
      // 목련 꽃잎은 크고 무거워서 좀 더 느리게
      const duration = rand(11, 20);
      const spawnLow = i >= spawnLowThreshold;
      const delay = spawnLow ? -(duration * rand(0.40, 0.72)) : rand(0, 28);

      return {
        id: i,
        left: rand(-10, 85),
        delay,
        duration,
        size: rand(24, 44),
        colorIdx: Math.floor(Math.random() * COLOR_SETS.length),
        xDrift: isPortrait ? rand(25, 48) : rand(140, 190),
        sway: rand(-4, 4),
        opacity: rand(0.70, 0.94),
        rotation: rand(160, 420) * (Math.random() > 0.5 ? 1 : -1),
      };
    });

    const css = petals.map(p => {
      const r = (n: number) => n.toFixed(1);
      return `
        @keyframes pf${p.id} {
          0%   { transform: translateX(0vh)                               translateY(-12vh) rotate(${r(p.rotation * -0.08)}deg); opacity: 0; }
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
          <MagnoliaPetalSVG id={p.id} colorIdx={p.colorIdx} size={p.size} />
        </div>
      ))}
    </div>
  );
}
