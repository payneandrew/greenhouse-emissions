"use client";

import { debounce } from "lodash";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";

interface EmissionRecord {
  countryiso3code: string;
  country: { value: string };
  date: string;
  value: number | null;
}

interface EmissionsChartProps {
  data: EmissionRecord[];
}

export default function EmissionsLineChart({ data }: EmissionsChartProps) {
  const [yearRange, setYearRange] = useState({ start: 1972, end: 2022 });

  const updateYearRange = debounce((newRange) => {
    setYearRange(newRange);
  }, 300);

  const filteredData = useMemo(
    () =>
      data.filter(
        (entry) =>
          Number(entry.date) >= yearRange.start &&
          Number(entry.date) <= yearRange.end
      ),
    [data, yearRange]
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
      type: "line",
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
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">GHG Emissions Over Time</h2>
      <div className="flex items-center space-x-4 mb-4">
        <label>Start Year:</label>
        <input
          type="number"
          value={yearRange.start}
          min="1972"
          max="2022"
          onChange={(e) =>
            updateYearRange({ ...yearRange, start: Number(e.target.value) })
          }
          className="border p-2 w-24"
        />

        <label>End Year:</label>
        <input
          type="number"
          value={yearRange.end}
          min="1972"
          max="2022"
          onChange={(e) =>
            updateYearRange({ ...yearRange, end: Number(e.target.value) })
          }
          className="border p-2 w-24"
        />
      </div>

      {!data || data.length === 0 ? (
        <p className="text-red-500">No emissions data available.</p>
      ) : (
        <Chart options={options} series={series} type="line" height={400} />
      )}
    </div>
  );
}
