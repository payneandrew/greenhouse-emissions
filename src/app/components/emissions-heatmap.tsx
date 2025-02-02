"use client";

import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EmissionsHeatmapChartProps {
  series: ApexAxisChartSeries;
}

export default function EmissionsHeatmapChart({
  series,
}: EmissionsHeatmapChartProps) {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "heatmap",
      height: 400,
      toolbar: { show: true },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#008FFB"],
    xaxis: {
      type: "category",
      title: { text: "Year" },
    },
    yaxis: {
      title: { text: "Country" },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Mt CO₂e`,
      },
    },
  };

  return (
    <div className="p-4 flex flex-col font-poppins">
      {!series || series.length === 0 ? (
        <p className="text-red-500">No emissions data available.</p>
      ) : (
        <Chart options={options} series={series} type="heatmap" height={600} />
      )}
    </div>
  );
}
