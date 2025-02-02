"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import HeatmapChart from "./components/emissions-heatmap";
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

            if (!data || data.length < 2 || !Array.isArray(data[1])) {
              throw new Error(`Invalid response format for ${code}`);
            }

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

        if (responses.every((res) => res.length === 0)) {
          throw new Error(
            "No emissions data available for the selected countries."
          );
        }

        console.log("Fetched emissions data for all countries", responses);
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 font-poppins">
        CO₂ Emissions Data
      </h1>

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
          <EmissionsLineChart data={emissionsData} />
        ) : (
          <HeatmapChart data={emissionsData} />
        )}
      </div>
    </div>
  );
}
