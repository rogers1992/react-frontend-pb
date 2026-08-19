import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { SalesTrendPoint } from "../../../types";

const BRAND = "#FF6A00";

interface Props {
  data: SalesTrendPoint[];
  height?: number;
}

export default function SalesTrendChart({ data, height = 310 }: Props) {
  const options = useMemo<ApexOptions>(
    () => ({
      colors: [BRAND],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "line",
        height,
        toolbar: { show: false },
      },
      stroke: { curve: "smooth", width: [2] },
      fill: {
        type: "gradient",
        gradient: { opacityFrom: 0.5, opacityTo: 0 },
      },
      markers: {
        size: 0,
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 6 },
      },
      grid: {
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        y: { formatter: (val: number) => `Bs ${val.toFixed(2)}` },
      },
      xaxis: {
        type: "category",
        categories: data.map((p) => p.date_label.slice(0, 10)),
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: {
          style: { fontSize: "11px", colors: ["#6B7280"] },
        },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px", colors: ["#6B7280"] },
        },
        title: { text: "" },
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
    <div className="max-w-full overflow-x-auto custom-scrollbar -mx-2 px-2">
      <div className="min-w-[600px]">
        <Chart options={options} series={series} type="area" height={height} />
      </div>
    </div>
  );
}