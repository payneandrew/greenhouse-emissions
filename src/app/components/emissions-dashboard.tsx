"use client";

import { useMemo, useState } from "react";
import { EmissionRecord } from "../types/emission-data-types";
import EmissionsFilter from "./emissions-filter";
import EmissionsHeatmapChart from "./emissions-heatmap";
import EmissionsLineChart from "./emissions-line-chart";
import EmissionsTable from "./emissions-table";
import { ChartTabs, Tabs } from "./tabs";

interface EmissionsDashboardProps {
  emissionsData: EmissionRecord[];
}

export default function EmissionsDashboard({
  emissionsData,
}: EmissionsDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.LineChart);

  const [yearRange, setYearRange] = useState(defaultYearRange);
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
      Array.from(
        { length: defaultYearRange.end - defaultYearRange.start + 1 },
        (_, i) => (defaultYearRange.start + i).toString()
      ),
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

  const tabContent = () => {
    if (activeTab === Tabs.LineChart) {
      return <EmissionsLineChart series={series} />;
    } else if (activeTab === Tabs.Heatmap) {
      return <EmissionsHeatmapChart series={series} />;
    } else if (activeTab === Tabs.Table) {
      return <EmissionsTable emissionsData={filteredData} />;
    }
  };

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

      <div className="flex-1">{tabContent()}</div>
    </div>
  );
}

const defaultYearRange = { start: 1972, end: 2022 };
