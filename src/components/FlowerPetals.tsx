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

// 벚꽃 색상: [외곽(연함), 중간, 베이스(짙음)]
const COLOR_SETS = [
  { outer: '#FFF5F8', mid: '#FFCAD8', base: '#FF8FAE' },
  { outer: '#FFF0F5', mid: '#FFBDD0', base: '#FF80A8' },
  { outer: '#FFF8FA', mid: '#FFD8E8', base: '#FFB0C8' },
  { outer: '#FFECF2', mid: '#FFBACF', base: '#FF85B0' },
  { outer: '#FFFAFC', mid: '#FFE0EC', base: '#FFBAD0' },
];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function PetalSVG({ id, colorIdx, size }: { id: number; colorIdx: number; size: number }) {
  const { outer, mid, base } = COLOR_SETS[colorIdx];
  const gid = `cg${id}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.4)}
      viewBox="0 0 50 70"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 베이스(아래)에서 팁(위)으로 방사형 그라디언트 */}
        <radialGradient id={gid} cx="50%" cy="74%" r="74%">
          <stop offset="0%"   stopColor={base}  stopOpacity="0.92" />
          <stop offset="48%"  stopColor={mid}   stopOpacity="0.88" />
          <stop offset="100%" stopColor={outer} stopOpacity="0.72" />
        </radialGradient>
      </defs>

      {/* 벚꽃 꽃잎 — 위쪽이 살짝 넓고, 팁에 작은 노치, 아래가 뾰족한 형태 */}
      <path
        d="M25,68
           C8,57 1,40 4,23
           C7,7 15,-1 22,1
           Q25,-3 28,1
           C35,-1 43,7 46,23
           C49,40 42,57 25,68 Z"
        fill={`url(#${gid})`}
        stroke={mid}
        strokeWidth="0.4"
        strokeOpacity="0.28"
      />

      {/* 중심 맥 (midrib) */}
      <path
        d="M25,66 Q24.5,36 25,3"
        stroke="rgba(255,255,255,0.48)"
        strokeWidth="0.85"
        fill="none"
        strokeLinecap="round"
      />

      {/* 좌측 측맥 */}
      <path
        d="M24,50 Q17,36 12,22"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.55"
        fill="none"
        strokeLinecap="round"
      />

      {/* 우측 측맥 */}
      <path
        d="M26,50 Q33,36 38,22"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.55"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FlowerPetals() {
  const { petals, css } = useMemo(() => {
    const petals: Petal[] = Array.from({ length: 38 }, (_, i) => ({
      id: i,
      // 왼쪽 화면 밖(-45%)부터 오른쪽(75%)까지 분산 → 대각선 흐름 자연스럽게
      left: rand(-45, 75),
      delay: rand(0, 26),
      duration: rand(9, 17),
      size: rand(14, 30),
      colorIdx: Math.floor(Math.random() * COLOR_SETS.length),
      // 30° from horizontal: X = 110vh × tan(60°) ≈ 190vh
      xDrift: rand(182, 200),
      sway: rand(-3.5, 3.5),  // 자연스러운 미세 흔들림 (vh)
      opacity: rand(0.62, 0.90),
      rotation: rand(200, 500) * (Math.random() > 0.5 ? 1 : -1),
    }));

    const css = petals.map(p => {
      const r = (n: number) => n.toFixed(1);
      return `
        @keyframes pf${p.id} {
          0%   { transform: translateX(0vh)                              translateY(-10vh)  rotate(${r(p.rotation * -0.08)}deg); opacity: 0; }
          6%   { opacity: ${p.opacity.toFixed(2)}; }
          33%  { transform: translateX(${r(p.xDrift * 0.33 + p.sway)}vh) translateY(${r(110 * 0.33)}vh)  rotate(${r(p.rotation * 0.33)}deg); }
          66%  { transform: translateX(${r(p.xDrift * 0.66 - p.sway)}vh) translateY(${r(110 * 0.66)}vh)  rotate(${r(p.rotation * 0.66)}deg); }
          90%  { opacity: ${(p.opacity * 0.5).toFixed(2)}; }
          100% { transform: translateX(${r(p.xDrift)}vh)                 translateY(110vh) rotate(${r(p.rotation)}deg); opacity: 0; }
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
            animationFillMode: 'backwards',  // delay 중 -10vh 위치 유지 → 화면 위 대기 안 보임
            willChange: 'transform, opacity',
          }}
        >
          <PetalSVG id={p.id} colorIdx={p.colorIdx} size={p.size} />
        </div>
      ))}
    </div>
  );
}
