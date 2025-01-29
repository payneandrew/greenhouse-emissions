import EmissionsLineChart from "./components/emissions-line-chart";

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

      return data[1].reverse();
    } catch (error) {
      console.error(`Error fetching data for ${code}:`, error);
      return [];
    }
  });

  const responses = await Promise.all(fetchPromises);
  return responses.flat();
}

export default async function Home() {
  const emissionsData = await getEmissionsData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CO₂ Emissions Data</h1>
      <EmissionsLineChart data={emissionsData} />
    </div>
  );
}
