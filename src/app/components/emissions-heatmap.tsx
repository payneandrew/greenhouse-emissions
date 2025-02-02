"use client";

import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { EmissionRecord } from "../types/emission-data-types";
import EmissionsFilter from "./emissions-filter";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EmissionsChartProps {
  data: EmissionRecord[];
}

export default function HeatmapChart({ data }: EmissionsChartProps) {
  const [yearRange, setYearRange] = useState({ start: 1972, end: 2022 });
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const years = Array.from({ length: 2022 - 1972 + 1 }, (_, i) =>
    (1972 + i).toString()
  );

  const availableCountries = useMemo(
    () => Array.from(new Set(data.map((entry) => entry.countryiso3code))),
    [data]
  );

  const updateYearRange = debounce((newRange) => {
    setYearRange(newRange);
  }, 300);

  const filteredData = useMemo(
    () =>
      data.filter(
        (entry) =>
          Number(entry.date) >= yearRange.start &&
          Number(entry.date) <= yearRange.end &&
          (selectedCountries.length === 0 ||
            selectedCountries.includes(entry.countryiso3code))
      ),
    [data, yearRange, selectedCountries]
  );

  const series: ApexAxisChartSeries = useMemo(() => {
    const groupedData = filteredData.reduce((acc, entry) => {
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
  }, [filteredData]);

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
    <div className="p-4 gap-4 flex flex-col font-poppins">
      <EmissionsFilter
        availableCountries={availableCountries}
        years={years}
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
        yearRange={yearRange}
        updateYearRange={updateYearRange}
      />

      {!data || data.length === 0 ? (
        <p className="text-red-500">No emissions data available.</p>
      ) : (
        <Chart options={options} series={series} type="heatmap" height={600} />
      )}
    </div>
  );
}
