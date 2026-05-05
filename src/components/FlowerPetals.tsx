import { useMemo } from 'react';

interface Petal {
  id: number;
  spawnSide: 'top' | 'left';
  left: number;   // top-spawn: rand%, left-spawn: -8%
  top: number;    // top-spawn: 0,    left-spawn: rand%
  delay: number;
  duration: number;
  size: number;
  colorIdx: number;
  xDrift: number;
  yDrift: number; // top-spawn: 110, left-spawn: 작은 값
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
        <radialGradient id={gid} cx="50%" cy="78%" r="85%">
          <stop offset="0%"   stopColor={base}  stopOpacity="0.95" />
          <stop offset="42%"  stopColor={mid}   stopOpacity="0.88" />
          <stop offset="100%" stopColor={outer} stopOpacity="0.72" />
        </radialGradient>
        <radialGradient id={vid} cx="38%" cy="30%" r="45%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

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
      <path
        d="M17,37
           C4,29 0,18 1,10
           C2,3 9,0 17,0
           C25,0 32,3 33,10
           C34,18 30,29 17,37 Z"
        fill={`url(#${vid})`}
      />
      <path d="M17,35 Q17,18 17,2" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <path d="M15,26 Q10,18 9,10" stroke="rgba(255,255,255,0.20)" strokeWidth="0.45" fill="none" strokeLinecap="round" />
      <path d="M19,26 Q24,18 25,10" stroke="rgba(255,255,255,0.20)" strokeWidth="0.45" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function FlowerPetals() {
  const { petals, css } = useMemo(() => {
    // 상단 spawn 10개 + 좌측 spawn 8개
    const topCount = 10;
    const leftCount = 8;
    const total = topCount + leftCount;

    const petals: Petal[] = Array.from({ length: total }, (_, i) => {
      const isLeft = i >= topCount;
      const colorIdx = Math.floor(Math.random() * COLOR_SETS.length);
      const rotation = rand(180, 400) * (Math.random() > 0.5 ? 1 : -1);
      const opacity = rand(0.72, 0.95);

      if (isLeft) {
        // 좌측에서 spawn: 화면 왼쪽 밖에서 다양한 높이로 시작
        const duration = rand(14, 24);
        const topPct = rand(8, 88); // 화면 상하 전반에 걸쳐 분포
        const delay = rand(-duration * 0.8, duration * 0.5);
        return {
          id: i,
          spawnSide: 'left',
          left: -8,
          top: topPct,
          delay,
          duration,
          size: rand(16, 30),
          colorIdx,
          xDrift: rand(80, 140),  // 오른쪽으로 이동
          yDrift: rand(20, 55),   // 아래로 조금만 이동 (이미 중간 높이에서 시작)
          sway: rand(-2, 2),
          opacity,
          rotation,
        };
      } else {
        // 상단에서 spawn: 기존 방식
        const duration = rand(14, 24);
        const spawnLow = i >= Math.floor(topCount * 0.65);
        const delay = spawnLow ? -(duration * rand(0.35, 0.70)) : rand(0, 28);
        return {
          id: i,
          spawnSide: 'top',
          left: rand(-10, 80),
          top: 0,
          delay,
          duration,
          size: rand(16, 30),
          colorIdx,
          xDrift: rand(140, 190),
          yDrift: 110,
          sway: rand(-3, 3),
          opacity,
          rotation,
        };
      }
    });

    const css = petals.map(p => {
      const r = (n: number) => n.toFixed(1);

      if (p.spawnSide === 'left') {
        // 좌측에서 진입: translateX 음수에서 시작
        return `
          @keyframes pf${p.id} {
            0%   { transform: translateX(-8vh) translateY(0vh) rotate(${r(p.rotation * -0.06)}deg); opacity: 0; }
            8%   { opacity: ${p.opacity.toFixed(2)}; }
            33%  { transform: translateX(${r(p.xDrift * 0.33 + p.sway)}vh) translateY(${r(p.yDrift * 0.33)}vh) rotate(${r(p.rotation * 0.33)}deg); }
            66%  { transform: translateX(${r(p.xDrift * 0.66 - p.sway)}vh) translateY(${r(p.yDrift * 0.66)}vh) rotate(${r(p.rotation * 0.66)}deg); }
            90%  { opacity: ${(p.opacity * 0.45).toFixed(2)}; }
            100% { transform: translateX(${r(p.xDrift)}vh)   translateY(${r(p.yDrift)}vh)   rotate(${r(p.rotation)}deg); opacity: 0; }
          }
        `;
      } else {
        // 상단에서 진입: translateY 음수에서 시작
        return `
          @keyframes pf${p.id} {
            0%   { transform: translateX(0vh)                               translateY(-10vh) rotate(${r(p.rotation * -0.08)}deg); opacity: 0; }
            5%   { opacity: ${p.opacity.toFixed(2)}; }
            33%  { transform: translateX(${r(p.xDrift * 0.33 + p.sway)}vh) translateY(${r(p.yDrift * 0.33)}vh) rotate(${r(p.rotation * 0.33)}deg); }
            66%  { transform: translateX(${r(p.xDrift * 0.66 - p.sway)}vh) translateY(${r(p.yDrift * 0.66)}vh) rotate(${r(p.rotation * 0.66)}deg); }
            90%  { opacity: ${(p.opacity * 0.5).toFixed(2)}; }
            100% { transform: translateX(${r(p.xDrift)}vh)                  translateY(${r(p.yDrift)}vh) rotate(${r(p.rotation)}deg); opacity: 0; }
          }
        `;
      }
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
            top: p.spawnSide === 'left' ? `${p.top}%` : 0,
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
