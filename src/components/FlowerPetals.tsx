import { useMemo } from 'react';

interface Seed {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  xDrift: number;
  sway: number;
  opacity: number;
  rotation: number;
}

const FILAMENT_COUNT = 30;
const CX = 25, CY = 25, R_MAX = 19;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function DandelionSeedSVG({ id, size }: { id: number; size: number }) {
  const fid = `df${id}`;

  // 360도 전방향 필라멘트 — 구 형태 착시
  const filaments = Array.from({ length: FILAMENT_COUNT }, (_, i) => {
    const angleDeg = (360 / FILAMENT_COUNT) * i - 90; // 위쪽부터 시작
    const rad = angleDeg * (Math.PI / 180);
    const cosA = Math.cos(rad); // 위=1, 아래=-1

    // 아래쪽 필라멘트는 짧게 → 구 형태 착시
    const r = R_MAX * (0.68 + 0.32 * cosA);

    const ex = CX + Math.sin(rad) * r;
    const ey = CY - Math.cos(rad) * r;

    // 바깥쪽으로 볼록하게 휘는 제어점
    const qx = CX + Math.sin(rad) * (r * 0.48 + 3.5);
    const qy = CY - Math.cos(rad) * (r * 0.48 + 3.5);

    // 앞쪽(위)은 선명하고, 뒤쪽(아래)은 희미하게 → 입체감
    const depth = (1 + cosA) / 2; // 위=1.0, 아래=0.0
    const opacity = 0.28 + depth * 0.62;
    const sw = 0.38 + depth * 0.22;
    const tipR = 0.65 + depth * 0.55;

    return { ex, ey, qx, qy, opacity, sw, tipR, depth };
  });

  // 뒤쪽(depth 낮은)부터 먼저 그려서 앞쪽이 위에 올라오게
  const sorted = [...filaments].sort((a, b) => a.depth - b.depth);

  return (
    <svg
      width={size}
      height={Math.round(size * 1.5)}
      viewBox="0 0 50 75"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={fid} x="-55%" y="-55%" width="210%" height="210%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.65" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${fid})`}>
        {sorted.map((f, i) => (
          <g key={i}>
            <path
              d={`M${CX},${CY} Q${f.qx.toFixed(1)},${f.qy.toFixed(1)} ${f.ex.toFixed(1)},${f.ey.toFixed(1)}`}
              stroke={`rgba(255,255,255,${f.opacity.toFixed(2)})`}
              strokeWidth={f.sw.toFixed(2)}
              fill="none"
            />
            <circle cx={f.ex} cy={f.ey} r={f.tipR} fill={`rgba(255,255,255,${(f.opacity * 0.95).toFixed(2)})`} />
          </g>
        ))}
        {/* 중심 허브 */}
        <circle cx={CX} cy={CY} r="2.2" fill="rgba(255,240,185,0.82)" />
        <circle cx={CX} cy={CY} r="1.1" fill="rgba(255,215,100,0.92)" />
      </g>

      {/* 줄기 */}
      <path
        d={`M${CX},${CY + 1.5} Q${CX + 1.5},50 ${CX + 0.5},60`}
        stroke="rgba(150,120,70,0.60)"
        strokeWidth="0.65"
        fill="none"
        strokeLinecap="round"
      />
      {/* 씨앗 본체 */}
      <ellipse cx={CX + 0.5} cy={63.5} rx="2.2" ry="3.8" fill="#7A5C30" opacity="0.68"
        transform={`rotate(4,${CX + 0.5},63.5)`} />
      <ellipse cx={CX + 0.3} cy={61.5} rx="1.1" ry="1.6" fill="#9B7A45" opacity="0.55" />
    </svg>
  );
}

export default function FlowerPetals() {
  const { seeds, css } = useMemo(() => {
    const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;

    const seedCount = 20;
    const spawnLowThreshold = 13;

    const seeds: Seed[] = Array.from({ length: seedCount }, (_, i) => {
      // 민들레 홀씨는 더 천천히, 더 부드럽게 떠다님
      const duration = rand(13, 22);
      const spawnLow = i >= spawnLowThreshold;
      const delay = spawnLow ? -(duration * rand(0.35, 0.70)) : rand(0, 30);

      return {
        id: i,
        left: rand(-10, 90),
        delay,
        duration,
        size: rand(26, 44),
        xDrift: isPortrait ? rand(25, 45) : rand(140, 180),
        sway: rand(-5, 5),
        opacity: rand(0.60, 0.88),
        rotation: rand(80, 260) * (Math.random() > 0.5 ? 1 : -1),
      };
    });

    const css = seeds.map(p => {
      const r = (n: number) => n.toFixed(1);
      // 부드러운 S자 흔들림으로 가볍게 떠다니는 느낌
      return `
        @keyframes pf${p.id} {
          0%   { transform: translateX(0vh)                                translateY(-12vh) rotate(${r(p.rotation * -0.05)}deg); opacity: 0; }
          8%   { opacity: ${p.opacity.toFixed(2)}; }
          25%  { transform: translateX(${r(p.xDrift * 0.22 + p.sway)}vh)  translateY(${r(110 * 0.25)}vh) rotate(${r(p.rotation * 0.25)}deg); }
          50%  { transform: translateX(${r(p.xDrift * 0.50 - p.sway)}vh)  translateY(${r(110 * 0.50)}vh) rotate(${r(p.rotation * 0.50)}deg); }
          75%  { transform: translateX(${r(p.xDrift * 0.78 + p.sway * 0.5)}vh) translateY(${r(110 * 0.75)}vh) rotate(${r(p.rotation * 0.75)}deg); }
          92%  { opacity: ${(p.opacity * 0.45).toFixed(2)}; }
          100% { transform: translateX(${r(p.xDrift)}vh)                  translateY(112vh) rotate(${r(p.rotation)}deg); opacity: 0; }
        }
      `;
    }).join('');

    return { seeds, css };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      <style>{css}</style>
      {seeds.map(p => (
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
          <DandelionSeedSVG id={p.id} size={p.size} />
        </div>
      ))}
    </div>
  );
}
