import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

const COLORS = ["#00b8d9", "#6366f1", "#ffab00", "#36b37e", "#ff5630"];

export default function VolumePie({ data }) {
  if (!data?.length) return null;

  // ✅ FIX 1: compute total volume
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);

  // ✅ FIX 2: enrich data with percent
  const chartData = data.map(d => ({
    ...d,
    percent: totalVolume ? (d.volume / totalVolume) * 100 : 0
  }));

  return (
    <ResponsiveContainer width="100%" height={350} minWidth={450}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="volume"
          nameKey="symbol"
          cx="50%"
          cy="48%"
          innerRadius={80}
          outerRadius={125}
          paddingAngle={3}
         
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, _, props) => [
            `${value.toLocaleString()} (${props.payload.percent.toFixed(1)}%)`,
            props.payload.symbol
          ]}
        />

        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value, entry) =>
            `${value} (${entry.payload.percent.toFixed(1)}%)`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
