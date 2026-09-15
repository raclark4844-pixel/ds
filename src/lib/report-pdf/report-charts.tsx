import { Circle, G, Line, Rect, Svg, Text as SvgText } from "@react-pdf/renderer";

const INK = "#F4F4F1";
const MUTED = "#8B8B86";
const GREEN = "#00FF9C";
const RED = "#FF2A3A";
const YELLOW = "#FFE14A";
const TRACK = "#1A1A1A";
const GRID = "#2A2A28";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function ScoreBar({
  label,
  value,
  color = GREEN,
  width = 515,
}: {
  label: string;
  value: number;
  color?: string;
  width?: number;
}) {
  const safe = clamp(value);
  const bar = Math.max(6, (safe / 100) * (width - 8));
  return (
    <Svg width={width} height={28} viewBox={`0 0 ${width} 28`}>
      <SvgText x={0} y={10} fill={INK} fontSize={9}>
        {`${label}  ${Math.round(safe)}`}
      </SvgText>
      <Rect x={0} y={16} width={width} height={8} fill={TRACK} />
      <Rect x={0} y={16} width={bar} height={8} fill={color} />
    </Svg>
  );
}

export function CompetitorBars({
  rows,
}: {
  rows: Array<{ label: string; value: number }>;
}) {
  const height = 18 + rows.length * 22;
  return (
    <Svg width={515} height={height} viewBox={`0 0 515 ${height}`}>
      {rows.map((row, i) => {
        const y = 4 + i * 22;
        const w = Math.max(6, (clamp(row.value) / 100) * 360);
        const color = i === 0 ? GREEN : i === 1 ? RED : YELLOW;
        return (
          <G key={row.label}>
            <SvgText x={0} y={y + 10} fill={INK} fontSize={8}>
              {row.label.slice(0, 28)}
            </SvgText>
            <Rect x={150} y={y + 3} width={360} height={8} fill={TRACK} />
            <Rect x={150} y={y + 3} width={w} height={8} fill={color} />
            <SvgText x={488} y={y + 10} fill={MUTED} fontSize={8}>
              {String(Math.round(row.value))}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function CategoryComparison({
  categories,
}: {
  categories: Array<{ label: string; value: number; max: number }>;
}) {
  const height = 16 + categories.length * 20;
  return (
    <Svg width={515} height={height} viewBox={`0 0 515 ${height}`}>
      {categories.map((cat, i) => {
        const y = 2 + i * 20;
        const pct = clamp((cat.value / cat.max) * 100);
        const w = Math.max(4, (pct / 100) * 330);
        return (
          <G key={cat.label}>
            <SvgText x={0} y={y + 10} fill={INK} fontSize={8}>
              {`${cat.label} ${cat.value}/${cat.max}`}
            </SvgText>
            <Rect x={150} y={y + 3} width={330} height={8} fill={TRACK} />
            <Rect x={150} y={y + 3} width={w} height={8} fill={i % 2 ? YELLOW : GREEN} />
            <SvgText x={490} y={y + 10} fill={MUTED} fontSize={8}>
              {`${Math.round(pct)}%`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function CapabilityGapChart({
  present,
  partial,
  missing,
  unknown,
}: {
  present: number;
  partial: number;
  missing: number;
  unknown: number;
}) {
  const total = Math.max(1, present + partial + missing + unknown);
  const parts = [
    { label: "Present", n: present, color: GREEN },
    { label: "Partial", n: partial, color: YELLOW },
    { label: "Missing", n: missing, color: RED },
    { label: "Unknown", n: unknown, color: MUTED },
  ];
  let x = 0;
  return (
    <Svg width={515} height={46} viewBox="0 0 515 46">
      {parts.map((p) => {
        const w = (p.n / total) * 515;
        const node = (
          <G key={p.label}>
            <Rect x={x} y={0} width={Math.max(w, p.n ? 2 : 0)} height={14} fill={p.color} />
            <SvgText x={x + 4} y={32} fill={INK} fontSize={8}>
              {`${p.label} ${p.n}`}
            </SvgText>
          </G>
        );
        x += w;
        return node;
      })}
    </Svg>
  );
}

export function GrowthRangeGraph({
  points,
}: {
  points: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(100, ...points.map((p) => p.value));
  const w = 515;
  const h = 110;
  const pad = 18;
  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(1, points.length - 1)) * (w - pad * 2);
    const y = h - pad - (p.value / max) * (h - pad * 2);
    return { ...p, x, y };
  });
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={0} width={w} height={h} fill="#111111" />
      {[0.25, 0.5, 0.75].map((g) => (
        <Line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={pad + (1 - g) * (h - pad * 2)}
          y2={pad + (1 - g) * (h - pad * 2)}
          stroke={GRID}
          strokeWidth={1}
        />
      ))}
      {coords.map((c, i) =>
        i < coords.length - 1 ? (
          <Line key={`l-${c.label}`} x1={c.x} y1={c.y} x2={coords[i + 1].x} y2={coords[i + 1].y} stroke={GREEN} strokeWidth={2} />
        ) : null,
      )}
      {coords.map((c) => (
        <G key={c.label}>
          <Circle cx={c.x} cy={c.y} r={3} fill={YELLOW} />
          <SvgText x={Math.max(0, c.x - 16)} y={h - 4} fill={MUTED} fontSize={8}>
            {`${c.label} ${Math.round(c.value)}`}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

export function PriorityEffortMatrix({
  items,
}: {
  items: Array<{ label: string; impact: number; effort: number }>;
}) {
  const w = 515;
  const h = 150;
  const pad = 24;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={0} width={w} height={h} fill="#111111" />
      <Line x1={pad} x2={w - pad} y1={h - pad} y2={h - pad} stroke={GRID} strokeWidth={1} />
      <Line x1={pad} x2={pad} y1={pad} y2={h - pad} stroke={GRID} strokeWidth={1} />
      <SvgText x={pad} y={12} fill={MUTED} fontSize={7}>
        Higher impact
      </SvgText>
      <SvgText x={w - 90} y={h - 8} fill={MUTED} fontSize={7}>
        Higher effort
      </SvgText>
      {items.map((item) => {
        const x = pad + (clamp(item.effort) / 100) * (w - pad * 2);
        const y = h - pad - (clamp(item.impact) / 100) * (h - pad * 2);
        const color = item.impact >= 80 ? GREEN : item.effort >= 55 ? RED : YELLOW;
        return (
          <G key={item.label}>
            <Circle cx={x} cy={y} r={5} fill={color} />
            <SvgText x={x + 8} y={y + 3} fill={INK} fontSize={8}>
              {`${item.label} (I${item.impact}/E${item.effort})`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{ window: string; focus: string }>;
}) {
  const w = 515;
  return (
    <Svg width={w} height={54} viewBox={`0 0 ${w} 54`}>
      <Line x1={16} x2={w - 16} y1={16} y2={16} stroke={GREEN} strokeWidth={2} />
      {items.map((item, i) => {
        const x = 16 + (i / Math.max(1, items.length - 1)) * (w - 32);
        return (
          <G key={item.window}>
            <Circle cx={x} cy={16} r={5} fill={YELLOW} />
            <SvgText x={Math.max(0, x - 24)} y={36} fill={INK} fontSize={8}>
              {item.window}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function ConfidenceIndicator({ value }: { value: number }) {
  const safe = clamp(value);
  const color = safe >= 60 ? GREEN : safe >= 45 ? YELLOW : RED;
  return (
    <Svg width={220} height={22} viewBox="0 0 220 22">
      <SvgText x={0} y={10} fill={INK} fontSize={9}>
        {`Assessment confidence ${safe}%`}
      </SvgText>
      <Rect x={0} y={14} width={220} height={6} fill={TRACK} />
      <Rect x={0} y={14} width={(safe / 100) * 220} height={6} fill={color} />
    </Svg>
  );
}
