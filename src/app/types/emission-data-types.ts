export interface EmissionRecord {
  countryiso3code: string;
  country: { value: string };
  date: string;
  value: number | null;
}

export interface EmissionsChartProps {
  data: EmissionRecord[];
}
