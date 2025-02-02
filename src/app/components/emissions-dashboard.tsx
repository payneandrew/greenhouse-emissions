"use client";

import { useMemo, useState } from "react";
import { EmissionRecord } from "../types/emission-data-types";
import EmissionsFilter from "./emissions-filter";
import EmissionsHeatmapChart from "./emissions-heatmap";
import EmissionsLineChart from "./emissions-line-chart";
import { ChartTabs, Tabs } from "./tabs";

interface EmissionsDashboardProps {
  emissionsData: EmissionRecord[];
}

export default function EmissionsDashboard({
  emissionsData,
}: EmissionsDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.LineChart);

  const [yearRange, setYearRange] = useState({ start: 1972, end: 2022 });
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const filteredData = useMemo(
    () =>
      emissionsData.filter(
        (entry) =>
          Number(entry.date) >= yearRange.start &&
          Number(entry.date) <= yearRange.end &&
          (selectedCountries.length === 0 ||
            selectedCountries.includes(entry.countryiso3code))
      ),
    [emissionsData, yearRange, selectedCountries]
  );

  const availableCountries = useMemo(
    () =>
      Array.from(new Set(emissionsData.map((entry) => entry.countryiso3code))),
    [emissionsData]
  );

  const years = useMemo(
    () =>
      Array.from({ length: 2022 - 1972 + 1 }, (_, i) => (1972 + i).toString()),
    []
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

  return (
    <div className="p-6 flex flex-col gap-5">
      <h1 className="text-3xl font-semibold font-poppins">
        Greenhouse Gas Emissions Data
      </h1>

      <EmissionsFilter
        availableCountries={availableCountries}
        years={years}
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
        yearRange={yearRange}
        updateYearRange={setYearRange}
      />

      <ChartTabs
        activeTab={activeTab}
        tabs={Object.values(Tabs)}
        onTabChange={setActiveTab}
      />

      <div className="flex-1">
        {activeTab === Tabs.LineChart ? (
          <EmissionsLineChart series={series} />
        ) : (
          <EmissionsHeatmapChart series={series} />
        )}
      </div>
    </div>
  );
}
