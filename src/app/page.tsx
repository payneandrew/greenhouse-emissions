import EmissionsDashboard from "./components/emissions-dashboard";
import { EmissionRecord, PaginationInfo } from "./types/emission-data-types";

type EmissionsApiResponse = [PaginationInfo, EmissionRecord[]];

const countryCodes = ["USA", "JPN", "CHN", "IND", "FRA", "BRA"];
const indicatorExclusive = "EN.GHG.ALL.MT.CE.AR5"; // Total greenhouse gas emissions excluding LULUCF (Mt CO2e)
// const indicatorInclusive = "EN.GHG.ALL.LU.MT.CE.AR5"; // Total greenhouse gas emissions including LULUCF (Mt CO2e)
const baseUrl = "https://api.worldbank.org/v2/country";

async function getEmissionsData(): Promise<EmissionRecord[]> {
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
    return responses.flat();
  } catch (error) {
    console.error("Error fetching emissions data:", error);
    return [];
  }
}

export default async function Home() {
  const emissionsData = await getEmissionsData();

  return <EmissionsDashboard emissionsData={emissionsData} />;
}
