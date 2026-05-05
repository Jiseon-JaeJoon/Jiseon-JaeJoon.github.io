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

// 매화 색상: 백매~홍매~연보라매 계열
const COLOR_SETS = [
  { outer: '#FFFCFD', mid: '#FFE4EF', base: '#F8B8D0' }, // 백매 (흰~연핑크)
  { outer: '#FFF0F5', mid: '#FFD0E8', base: '#F098BE' }, // 연홍매
  { outer: '#FFE4EE', mid: '#FFB4D0', base: '#E87AAC' }, // 홍매 (진핑크)
  { outer: '#FFF5FA', mid: '#FFCCE2', base: '#F4A8CA' }, // 중간 홍매
  { outer: '#FEF0FF', mid: '#F8D4F8', base: '#DFA8DF' }, // 연보라 매화
];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function PlumPetalSVG({ id, colorIdx, size }: { id: number; colorIdx: number; size: number }) {
  const { outer, mid, base } = COLOR_SETS[colorIdx];
  const gid = `mp${id}`;
  const vid = `mv${id}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 34 39"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 매화: 밑동(짙음)에서 끝(연함)으로 */}
        <radialGradient id={gid} cx="50%" cy="78%" r="85%">
          <stop offset="0%"   stopColor={base}  stopOpacity="0.95" />
          <stop offset="42%"  stopColor={mid}   stopOpacity="0.88" />
          <stop offset="100%" stopColor={outer} stopOpacity="0.72" />
        </radialGradient>
        {/* 광택 하이라이트 */}
        <radialGradient id={vid} cx="38%" cy="30%" r="45%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* 매화 꽃잎: 넓고 둥근 주걱형, 위가 넓고 아래로 갈수록 좁아짐 */}
      <path
        d="M17,37
           C4,29 0,18 1,10
           C2,3 9,0 17,0
           C25,0 32,3 33,10
           C34,18 30,29 17,37 Z"
        fill={`url(#${gid})`}
        stroke={mid}
        strokeWidth="0.35"
        strokeOpacity="0.25"
      />

      {/* 광택 하이라이트 */}
      <path
        d="M17,37
           C4,29 0,18 1,10
           C2,3 9,0 17,0
           C25,0 32,3 33,10
           C34,18 30,29 17,37 Z"
        fill={`url(#${vid})`}
      />

      {/* 중앙 주맥 */}
      <path
        d="M17,35 Q17,18 17,2"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* 좌측 측맥 */}
      <path
        d="M15,26 Q10,18 9,10"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="0.45"
        fill="none"
        strokeLinecap="round"
      />

      {/* 우측 측맥 */}
      <path
        d="M19,26 Q24,18 25,10"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="0.45"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FlowerPetals() {
  const { petals, css } = useMemo(() => {
    const petalCount = 18;
    const spawnLowThreshold = 12;

    const petals: Petal[] = Array.from({ length: petalCount }, (_, i) => {
      const duration = rand(9, 17);
      const spawnLow = i >= spawnLowThreshold;
      const delay = spawnLow ? -(duration * rand(0.40, 0.72)) : rand(0, 24);

      return {
        id: i,
        left: rand(-10, 85),
        delay,
        duration,
        size: rand(16, 30),
        colorIdx: Math.floor(Math.random() * COLOR_SETS.length),
        // portrait/landscape 구분 없이 동일 각도 유지
        xDrift: rand(140, 190),
        sway: rand(-3, 3),
        opacity: rand(0.72, 0.95),
        rotation: rand(180, 400) * (Math.random() > 0.5 ? 1 : -1),
      };
    });

    const css = petals.map(p => {
      const r = (n: number) => n.toFixed(1);
      return `
        @keyframes pf${p.id} {
          0%   { transform: translateX(0vh)                               translateY(-10vh) rotate(${r(p.rotation * -0.08)}deg); opacity: 0; }
          5%   { opacity: ${p.opacity.toFixed(2)}; }
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
          <PlumPetalSVG id={p.id} colorIdx={p.colorIdx} size={p.size} />
        </div>
      ))}
    </div>
  );
}
