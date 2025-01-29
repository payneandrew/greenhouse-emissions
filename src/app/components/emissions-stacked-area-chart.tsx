"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { EmissionsChartProps } from "../types/emission-data-types";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StackedAreaChart({ data }: EmissionsChartProps) {
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
      type: "area",
      stacked: true,
      height: 400,
      toolbar: { show: true },
    },
    xaxis: {
      type: "category",
      title: { text: "Year" },
    },
    yaxis: {
      title: { text: "GHG Emissions (Mt CO₂e)" },
    },
    tooltip: {
      x: { format: "yyyy" },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [20, 100],
      },
    },
    legend: {
      position: "top",
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">
        Stacked Area Chart: GHG Emissions
      </h2>
      <Chart options={options} series={series} type="area" height={400} />
    </div>
  );
}
