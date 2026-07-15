import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { TopProductRow } from "../../../types";

const BRAND = "#FF6A00";

interface Props {
  data: TopProductRow[];
  height?: number;
}

export default function TopProductsChart({ data, height = 360 }: Props) {
  const options = useMemo<ApexOptions>(
    () => ({
      colors: [BRAND],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          barHeight: "70%",
          borderRadius: 4,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        offsetX: 8,
        style: {
          fontSize: "11px",
          fontFamily: "Outfit, sans-serif",
          colors: ["#374151"],
        },
        formatter: (_val: number, opt: { w: { config: { series: { name?: string }[] } } }) =>
          String(opt.w.config.series[0]?.name ?? ""),
      },
      stroke: { show: false },
      xaxis: {
        categories: data.map((p) => p.name),
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px", fontFamily: "Outfit, sans-serif", colors: "#6B7280" },
          maxWidth: 180,
        },
      },
      legend: { show: false },
      grid: {
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: false } },
      },
      fill: { opacity: 1 },
      tooltip: {
        enabled: true,
        x: { show: true },
        y: { formatter: (val: number) => `Bs ${val.toFixed(2)}` },
      },
    }),
    [data, height],
  );

  const series = [
    {
      name: "Ingresos",
      data: data.map((p) => p.revenue),
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[420px]">
        {data.length > 0 ? (
          <Chart options={options} series={series} type="bar" height={height} />
        ) : (
          <div
            className="flex items-center justify-center text-sm text-gray-400"
            style={{ height }}
          >
            Sin datos
          </div>
        )}
      </div>
    </div>
  );
}