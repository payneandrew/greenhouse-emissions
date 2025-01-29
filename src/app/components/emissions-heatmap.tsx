"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { EmissionsChartProps } from "../types/emission-data-types";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function HeatmapChart({ data }: EmissionsChartProps) {
  const series = useMemo(() => {
    const groupedData = data.reduce((acc, entry) => {
      if (!acc[entry.countryiso3code]) {
        acc[entry.countryiso3code] = { name: entry.country.value, data: [] };
      }
      acc[entry.countryiso3code].data.push({
        x: entry.date,
        y: entry.value ?? 0,
      });
      return acc;
    }, {} as Record<string, { name: string; data: { x: string; y: number }[] }>);

    return Object.values(groupedData);
  }, [data]);

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
    <div className="p-4 bg-white rounded gap-4 flex flex-col font-poppins">
      <Chart options={options} series={series} type="heatmap" height={400} />
    </div>
  );
}
