interface Indicator {
  id: string;
  value: string;
}

interface Country {
  id: string;
  value: string;
}

export interface EmissionRecord {
  indicator: Indicator;
  country: Country;
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

export interface PaginationInfo {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  sourceid: string;
  lastupdated: string;
}
