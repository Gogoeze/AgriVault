import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
const data = [
  { m: "Jan", temp: 10, hum: 14 }, { m: "Feb", temp: 22, hum: 24 },
  { m: "Mar", temp: 28, hum: 27 }, { m: "Apr", temp: 34, hum: 32 },
  { m: "May", temp: 44, hum: 42 }, { m: "Jun", temp: 40, hum: 38 },
  { m: "Jul", temp: 52, hum: 50 },
];

export function ClimateChart() {
  return (
    <section className="rounded-lg bg-white p-4">
      <div className="flex items-center justify-between border-b border-brand-purple-30 pb-2">
        <h2 className="text-sm text-brand-purple-50">Temperature & humidity</h2>
        <select className="rounded-md border border-brand-purple-30 px-2 py-2 text-xs text-brand-30">
          <option>Month</option>
        </select>
      </div>
      <div className="mt-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9D5CCB" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#9D5CCB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F0EAF5" />
            <XAxis dataKey="m" interval={0} padding={{ left: 16, right: 16 }} tickLine={false} axisLine={false} tick={{ fill: "#6A3A8C", fontSize: 12, fontWeight: 600 }} />
            <YAxis hide domain={[0, 60]} />
            <Area dataKey="temp" type="monotone" stroke="#9D5CCB" strokeWidth={2} fill="url(#temp)" />
            <Area dataKey="hum" type="monotone" stroke="#FF873E" strokeWidth={2} strokeDasharray="6 4" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-3 text-xs">
        <span className="text-brand-purple-50">● Temperature</span>
        <span className="text-brand-amber-30">● Humidity</span>
      </div>
    </section>
  );
}