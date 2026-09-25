import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { PaymentMethodRow } from "../../../types";

const BRAND = "#FF6A00";
const PALETTE = ["#FF6A00", "#FEB47B", "#F97306", "#FFD3A0", "#FF8C42"];

const paymentLabels: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};

interface Props {
  data: PaymentMethodRow[];
  height?: number;
}

export default function PaymentMethodsChart({ data, height = 320 }: Props) {
  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "donut",
        height,
        toolbar: { show: false },
      },
      colors: data.length > 0 ? data.map((_, i) => PALETTE[i % PALETTE.length]) : [BRAND],
      labels: data.map((d) => paymentLabels[d.payment_method] ?? d.payment_method),
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        fontFamily: "Outfit, sans-serif",
        fontSize: "13px",
        labels: { colors: "#6B7280" },
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: "12px", fontFamily: "Outfit, sans-serif" },
      },
      stroke: { width: 0 },
      tooltip: {
        enabled: true,
        y: { formatter: (val: number) => `Bs ${val.toFixed(2)}` },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                formatter: (w: { globals: { seriesTotals: number[] } }) =>
                  `Bs ${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toFixed(2)}`,
                style: {
                  fontSize: "14px",
                  fontFamily: "Outfit, sans-serif",
                  color: "#374151",
                },
              },
            },
          },
        },
      },
    }),
    [data, height],
  );

  const series = data.map((d) => Number(d.total) || 0);

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[320px]">
        {series.length > 0 ? (
          <Chart options={options} series={series} type="donut" height={height} />
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