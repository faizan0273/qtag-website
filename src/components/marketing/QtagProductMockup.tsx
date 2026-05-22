import type { CSSProperties } from 'react';
import { BRAND_NAME } from '@/lib/brand';

/**
 * Pure-CSS/SVG QTag product mockups, one variant per category. Designed
 * to read as branded illustrations rather than photographs — every
 * surface is QTag yellow + ink, with category-specific shapes and IDs.
 *
 * No external image dependency.
 */

export type QtagMockupVariant =
  | 'luggage'
  | 'item-label'
  | 'keychain'
  | 'iron-on'
  | 'pet'
  | 'wristband'
  | 'car'
  | 'doorbell';

interface Props {
  variant: QtagMockupVariant;
  /** Short alphanumeric shown as the tag's printed ID. */
  id?: string;
  className?: string;
}

const DEFAULT_IDS: Record<QtagMockupVariant, string> = {
  luggage: '79QP4XJR',
  'item-label': 'TARI98YG',
  keychain: 'N41KMVVT',
  'iron-on': '6XHRX3Y2',
  pet: 'O1N16D1M',
  wristband: 'WB7P2K11',
  car: 'AVZKPRXH',
  doorbell: 'W2SA343X',
};

export function QtagProductMockup({ variant, id, className = '' }: Props) {
  const tagId = id ?? DEFAULT_IDS[variant];
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Backdrop variant={variant} />
      <div className="absolute inset-0 grid place-items-center p-6">
        <Tag variant={variant} id={tagId} />
      </div>
    </div>
  );
}

/* ============================================================ */
/* Backdrops — set the contextual scene per variant.            */
/* ============================================================ */

function Backdrop({ variant }: { variant: QtagMockupVariant }) {
  switch (variant) {
    case 'luggage':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#2a2f3a_0%,#0E1116_100%)]">
          <div className="absolute inset-0 opacity-30" style={zipperPattern} />
          <SoftBlob className="-left-10 top-6 bg-brand/30" />
        </div>
      );
    case 'item-label':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#F2B11C_0%,#FCD46A_55%,#F2B11C_100%)]">
          <SealRing className="absolute right-4 bottom-4 opacity-20" />
          <SoftBlob className="-left-12 -top-12 bg-paper/40" />
        </div>
      );
    case 'keychain':
      return (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3a4150_0%,#0E1116_75%)]">
          <SoftBlob className="right-2 bottom-2 bg-brand/20" />
        </div>
      );
    case 'iron-on':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1f2a44_0%,#0E1116_100%)]">
          <div className="absolute inset-0 opacity-40" style={denimPattern} />
        </div>
      );
    case 'pet':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#F8D88A_0%,#F2B11C_100%)]">
          <PawPrint className="absolute right-3 top-3 opacity-25" />
          <PawPrint className="absolute -left-2 bottom-6 opacity-15 rotate-12" small />
          <SoftBlob className="-right-10 -bottom-10 bg-ink/15" />
        </div>
      );
    case 'wristband':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(140deg,#FCF3DC_0%,#F2B11C_100%)]">
          <SoftBlob className="-left-10 -top-10 bg-paper/60" />
        </div>
      );
    case 'car':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#9aa3b0_0%,#5B6473_60%,#1B1F27_100%)]">
          {/* faint road/window streaks */}
          <div className="absolute inset-0 opacity-30" style={streakPattern} />
        </div>
      );
    case 'doorbell':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#7d5538_0%,#3d281a_100%)]">
          <div className="absolute inset-0 opacity-40" style={brickPattern} />
        </div>
      );
  }
}

/* ============================================================ */
/* Tags — the foreground tag per variant.                       */
/* ============================================================ */

function Tag({ variant, id }: { variant: QtagMockupVariant; id: string }) {
  switch (variant) {
    case 'luggage':
      return (
        <div className="relative">
          <Ring className="absolute -top-3 left-1/2 -translate-x-1/2" />
          <div className="relative w-44 h-56 rounded-[18px] bg-brand text-ink shadow-cardHover p-3 flex flex-col">
            <div className="text-center text-[9px] font-bold uppercase tracking-[0.18em]">Scan to message owner</div>
            <div className="mt-3 flex-1 grid place-items-center">
              <QrFrame size={104} />
            </div>
            <div className="text-center text-[9px] font-semibold tracking-wide">CODE {id}</div>
            <div className="text-center text-[8px] opacity-70">{BRAND_NAME}.pk</div>
          </div>
        </div>
      );

    case 'item-label':
      return (
        <div className="flex items-center gap-3 rotate-[-2deg]">
          {[0, 1].map((i) => (
            <div key={i} className="w-28 h-32 rounded-xl bg-paper-card shadow-cardHover overflow-hidden">
              <div className="h-6 bg-brand text-ink text-[9px] font-bold uppercase tracking-wider grid place-items-center">
                Scan if found
              </div>
              <div className="p-2 grid place-items-center">
                <QrFrame size={70} />
              </div>
              <div className="text-center text-[8px] text-ink-muted -mt-1">{BRAND_NAME}.pk</div>
            </div>
          ))}
        </div>
      );

    case 'keychain':
      return (
        <div className="relative">
          <Ring className="absolute -top-3 left-1/2 -translate-x-1/2" />
          <div
            className="relative w-44 h-52 bg-ink text-paper shadow-cardHover p-3 grid place-items-center"
            style={{ borderRadius: '40% 40% 38% 38% / 18% 18% 50% 50%' }}
          >
            <div className="text-center">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Scan to message</div>
              <div className="mt-2 grid place-items-center">
                <QrFrame size={92} dark />
              </div>
              <div className="mt-2 text-[9px] font-semibold tracking-wide">ID {id}</div>
              <div className="text-[8px] opacity-70">{BRAND_NAME}.pk</div>
            </div>
          </div>
        </div>
      );

    case 'iron-on':
      return (
        <div className="relative rotate-[-3deg]">
          <div
            className="w-40 h-40 rounded-xl bg-paper-card shadow-cardHover p-3 flex flex-col"
            style={{ boxShadow: '0 0 0 2px #0E1116, 0 14px 30px -10px rgba(0,0,0,0.5)' }}
          >
            <StitchBorder />
            <div className="relative h-5 -mt-1 mb-1 bg-brand text-ink text-[9px] font-bold uppercase tracking-wider grid place-items-center rounded-sm">
              Scan if found
            </div>
            <div className="relative flex-1 grid place-items-center">
              <QrFrame size={84} />
            </div>
            <div className="relative text-center text-[8px] text-ink-muted">{BRAND_NAME}.pk</div>
          </div>
        </div>
      );

    case 'pet':
      return (
        <div className="relative">
          <Ring className="absolute -top-2 left-1/2 -translate-x-1/2" />
          <div
            className="relative w-44 h-44 bg-ink text-paper shadow-cardHover p-3 grid place-items-center rotate-[-4deg]"
            style={{ borderRadius: '45% 45% 50% 50% / 30% 30% 70% 70%' }}
          >
            <div className="text-center">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Scan to message</div>
              <div className="mt-2 grid place-items-center">
                <QrFrame size={80} dark />
              </div>
              <div className="mt-1 text-[9px] font-semibold">ID {id}</div>
            </div>
          </div>
        </div>
      );

    case 'wristband':
      return (
        <div className="relative w-56">
          <div
            className="w-full h-16 rounded-[10px] bg-brand text-ink shadow-cardHover flex items-center px-3 gap-3 rotate-[-2deg]"
          >
            <QrFrame size={48} />
            <div className="text-[10px] font-bold uppercase tracking-wider leading-tight">
              Scan code to<br />contact help
            </div>
          </div>
          <div className="w-full h-16 rounded-[10px] bg-paper-card text-ink shadow-cardHover flex items-center px-3 gap-3 mt-3 rotate-[3deg] border border-ink/5">
            <QrFrame size={48} />
            <div className="text-[10px] font-bold uppercase tracking-wider leading-tight">
              Scan code to<br />contact help
            </div>
          </div>
        </div>
      );

    case 'car':
      return (
        <div className="relative w-40 h-52 rounded-[14px] bg-ink text-paper shadow-cardHover p-3 flex flex-col rotate-[-3deg]">
          <div className="text-center text-[9px] font-bold uppercase tracking-[0.18em]">
            Scan to message owner
          </div>
          <div className="mt-3 flex-1 grid place-items-center">
            <QrFrame size={96} dark />
          </div>
          <div className="text-center text-[9px] font-semibold tracking-wide">ID {id}</div>
          <div className="text-center text-[8px] opacity-70">{BRAND_NAME}.pk</div>
        </div>
      );

    case 'doorbell':
      return (
        <div className="relative w-40 h-52 rounded-[12px] bg-ink text-paper shadow-cardHover p-3 flex flex-col">
          <div className="text-center text-[9px] font-bold uppercase tracking-[0.18em]">
            Scan to message owner
          </div>
          <div className="mt-3 flex-1 grid place-items-center">
            <QrFrame size={96} dark />
          </div>
          <div className="text-center text-[9px] font-semibold tracking-wide">ID {id}</div>
          <div className="text-center text-[8px] opacity-70">{BRAND_NAME}.pk</div>
        </div>
      );
  }
}

/* ============================================================ */
/* Atoms                                                        */
/* ============================================================ */

/** Stylised QR with the brand mark in the centre. */
export function QrFrame({ size, dark = false }: { size: number; dark?: boolean }) {
  const fg = dark ? '#FFFFFF' : '#0E1116';
  const bg = dark ? '#0E1116' : '#FFFFFF';
  // Deterministic-ish pattern, 21x21 like a real QR.
  const grid = 21;
  const cells: boolean[] = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const finder =
        (x < 7 && y < 7) || (x >= grid - 7 && y < 7) || (x < 7 && y >= grid - 7);
      if (finder) {
        const inX = x >= (x < 7 ? 1 : grid - 6);
        const inX2 = x <= (x < 7 ? 5 : grid - 2);
        const inY = y >= (y < 7 ? 1 : grid - 6);
        const inY2 = y <= (y < 7 ? 5 : grid - 2);
        const onRing = !(inX && inX2 && inY && inY2);
        const inDot = x >= (x < 7 ? 2 : grid - 5) && x <= (x < 7 ? 4 : grid - 3) && y >= (y < 7 ? 2 : grid - 5) && y <= (y < 7 ? 4 : grid - 3);
        cells.push(onRing || inDot);
        continue;
      }
      // pseudo-random fill
      const v = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      cells.push((v % 3) !== 0);
    }
  }
  const cell = size / grid;
  const brand = '#F2B11C';
  const centreStart = grid / 2 - 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md" style={{ background: bg }}>
      {cells.map((on, i) => {
        const x = (i % grid) * cell;
        const y = Math.floor(i / grid) * cell;
        // Mask out the brand badge area in the centre
        const gx = i % grid;
        const gy = Math.floor(i / grid);
        if (gx >= centreStart && gx <= centreStart + 3 && gy >= centreStart && gy <= centreStart + 3) return null;
        if (!on) return null;
        return <rect key={i} x={x} y={y} width={cell} height={cell} fill={fg} />;
      })}
      {/* centre brand pill */}
      <rect
        x={centreStart * cell - 2}
        y={centreStart * cell - 2}
        width={cell * 4 + 4}
        height={cell * 4 + 4}
        rx={4}
        fill={brand}
      />
      <text
        x={centreStart * cell + (cell * 4) / 2}
        y={centreStart * cell + (cell * 4) / 2 + 4}
        textAnchor="middle"
        fontSize={cell * 2.2}
        fontWeight={800}
        fill="#0E1116"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Qt
      </text>
    </svg>
  );
}

function Ring({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-5 w-5 rounded-full border-[3px] border-paper/80 bg-transparent ${className}`}
      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.3)' }}
    />
  );
}

function SoftBlob({ className = '' }: { className?: string }) {
  return <div className={`absolute h-32 w-32 rounded-full blur-3xl ${className}`} />;
}

function PawPrint({ className = '', small = false }: { className?: string; small?: boolean }) {
  const s = small ? 28 : 44;
  return (
    <svg className={className} width={s} height={s} viewBox="0 0 64 64" fill="#0E1116">
      <ellipse cx="32" cy="40" rx="14" ry="12" />
      <ellipse cx="18" cy="22" rx="6" ry="8" />
      <ellipse cx="46" cy="22" rx="6" ry="8" />
      <ellipse cx="9" cy="36" rx="5" ry="7" />
      <ellipse cx="55" cy="36" rx="5" ry="7" />
    </svg>
  );
}

function SealRing({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="#0E1116" strokeWidth="2" />
      <circle cx="40" cy="40" r="26" stroke="#0E1116" strokeWidth="1" strokeDasharray="2 4" />
      <text x="40" y="44" textAnchor="middle" fontSize="9" fill="#0E1116" fontWeight={700} fontFamily="ui-sans-serif">
        {BRAND_NAME.toUpperCase()}
      </text>
    </svg>
  );
}

function StitchBorder() {
  return (
    <div
      className="pointer-events-none absolute inset-1.5 rounded-md"
      style={{
        border: '1px dashed rgba(14,17,22,0.35)',
      }}
    />
  );
}

/* ---------- patterns ---------- */
const zipperPattern: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 8px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 14px)',
};

const denimPattern: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)',
};

const streakPattern: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(105deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 20px)',
};

const brickPattern: CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.25) 49%, rgba(0,0,0,0.25) 51%, transparent 51%), linear-gradient(0deg, transparent 49%, rgba(0,0,0,0.25) 49%, rgba(0,0,0,0.25) 51%, transparent 51%)',
  backgroundSize: '40px 18px',
};
