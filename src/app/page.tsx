"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import EmissionsFilter from "./components/emissions-filter";
import EmissionsHeatmapChart from "./components/emissions-heatmap";
import EmissionsLineChart from "./components/emissions-line-chart";
import { ChartTabs, Tabs } from "./components/tabs";
import { EmissionRecord, PaginationInfo } from "./types/emission-data-types";

type EmissionsApiResponse = [PaginationInfo, EmissionRecord[]];

const countryCodes = ["USA", "JPN", "CHN", "IND", "FRA", "BRA"];
const indicatorExclusive = "EN.GHG.ALL.MT.CE.AR5"; // Total greenhouse gas emissions excluding LULUCF (Mt CO2e)
// const indicatorInclusive = "EN.GHG.ALL.LU.MT.CE.AR5"; // Total greenhouse gas emissions including LULUCF (Mt CO2e)
const baseUrl = "https://api.worldbank.org/v2/country";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.LineChart);

  const [emissionsData, setEmissionsData] = useState<EmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [yearRange, setYearRange] = useState({ start: 1972, end: 2022 });
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchEmissionsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchPromises = countryCodes.map(async (code) => {
          try {
            const response = await fetch(
              `${baseUrl}/${code}/indicator/${indicatorExclusive}?format=json`
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch data for ${code}`);
            }

            const data: EmissionsApiResponse = await response.json();

            return data[1].reverse(); // Sorts data from earliest to latest so we display from left to right on the screen
          } catch (error) {
            console.error(`Error fetching data for ${code}:`, error);
            return [];
          }
        });

        /*
        Uses Promise.all to fetch data for all countries in parallel and group them together.
        This decision was made so that all the data is accessed at once and we don't have to make subsequent requests for each country when filters are applied.
        */
        const responses = await Promise.all(fetchPromises);

        setEmissionsData(responses.flat());
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmissionsData();
  }, []);

  console.log("emissions data", emissionsData);

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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : activeTab === Tabs.LineChart ? (
          <EmissionsLineChart series={series} />
        ) : (
          <EmissionsHeatmapChart series={series} />
        )}
      </div>
    </div>
  );
}
