"use client";

import { useEffect, useState } from "react";
import HeatmapChart from "./components/emissions-heatmap";
import EmissionsLineChart from "./components/emissions-line-chart";
import { ChartTabs, Tabs } from "./components/tabs";

interface PaginationInfo {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  sourceid: string;
  lastupdated: string;
}

interface Indicator {
  id: string;
  value: string;
}

interface Country {
  id: string;
  value: string;
}

interface EmissionRecord {
  indicator: Indicator;
  country: Country;
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

type EmissionsApiResponse = [PaginationInfo, EmissionRecord[]];

const countryCodes = ["USA", "JPN", "CHN", "IND", "FRA", "BRA"];
const indicatorExclusive = "EN.GHG.ALL.MT.CE.AR5"; // Total greenhouse gas emissions excluding LULUCF (Mt CO2e)
// const indicatorInclusive = "EN.GHG.ALL.LU.MT.CE.AR5"; // Total greenhouse gas emissions including LULUCF (Mt CO2e)
const baseUrl = "https://api.worldbank.org/v2/country";

async function getEmissionsData(): Promise<EmissionRecord[]> {
  const fetchPromises = countryCodes.map(async (code) => {
    try {
      const response = await fetch(
        `${baseUrl}/${code}/indicator/${indicatorExclusive}?format=json`
      );
      const data: EmissionsApiResponse = await response.json();

      if (!data || data.length < 2 || !Array.isArray(data[1])) {
        console.error(`Invalid response format for ${code}`);
        return [];
      }

      // Sorts data from earliest to latest so we display from left to right on the screen
      return data[1].reverse();
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

  console.log("Fetched emissions data for all countries", responses);
  return responses.flat();
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.LineChart);

  const [emissionsData, setEmissionsData] = useState<EmissionRecord[]>([]);

  useEffect(() => {
    getEmissionsData().then(setEmissionsData);
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
        {activeTab === Tabs.LineChart ? (
          <EmissionsLineChart data={emissionsData} />
        ) : (
          <HeatmapChart data={emissionsData} />
        )}
      </div>
      {/* <EmissionsLineChart data={emissionsData} /> */}
      {/* <StackedAreaChart data={emissionsData} /> */}
    </div>
  );
}
