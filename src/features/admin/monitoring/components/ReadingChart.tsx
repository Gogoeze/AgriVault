import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/shared/components/ui/Icon";

type Point = { label: string; value: number };

type ReadingChartProps = {
  title: string;
  data: Point[];
  yDomain: [number, number];
  yTicks: number[];
  unit: string;
  threshold: number;
};

const LINE = "#7B3FA0";
const SAFE_FILL = "#D5EFE6";
const THRESHOLD = "#F97316";

export function ReadingChart({ title, data, yDomain, yTicks, unit, threshold }: ReadingChartProps) {
  return (
    <section className="flex flex-1 flex-col gap-2 rounded-xl bg-white p-4">
      <div className="flex items-center justify-between border-b border-brand-purple-30 pb-2">
        <h2 className="text-sm font-semibold text-brand-purple-50">{title}</h2>
        <label className="relative">
          <select className="appearance-none rounded border border-brand-purple-50 py-0.5 pl-2 pr-6 text-xs text-brand-purple-50 outline-none">
            <option>Month</option>
            <option>Week</option>
            <option>Day</option>
          </select>
          <Icon
            name="expand_more"
            className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[16px]"
          />
        </label>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#F3E3D3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: LINE }} />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={(v) => `${v}${unit}`}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 12, fill: LINE }}
            />
            <ReferenceArea y1={yDomain[0]} y2={threshold} fill={SAFE_FILL} fillOpacity={0.8} />
            <ReferenceLine y={threshold} stroke={THRESHOLD} strokeDasharray="6 4" />
            <Area
              type="monotone"
              dataKey="value"
              stroke={LINE}
              strokeWidth={2}
              fill={LINE}
              fillOpacity={0.08}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <span className="text-xs font-medium text-brand-amber-30">Safe range</span>
    </section>
  );
}