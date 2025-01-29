"use client";

import { Autocomplete, Chip, TextField } from "@mui/material";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ceruleanBlue } from "../../../styling/colors";
import { EmissionsChartProps } from "../types/emission-data-types";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function EmissionsLineChart({ data }: EmissionsChartProps) {
  const [yearRange, setYearRange] = useState({ start: 1972, end: 2022 });

  const years = Array.from({ length: 2022 - 1972 + 1 }, (_, i) =>
    (1972 + i).toString()
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const availableCountries = useMemo(
    () => Array.from(new Set(data.map((entry) => entry.countryiso3code))),
    [data]
  );

  const updateYearRange = debounce((newRange) => {
    setYearRange(newRange);
  }, 300);

  const filteredData = useMemo(() => {
    return data.filter(
      (entry) =>
        Number(entry.date) >= yearRange.start &&
        Number(entry.date) <= yearRange.end &&
        (selectedCountries.length === 0 ||
          selectedCountries.includes(entry.countryiso3code))
    );
  }, [data, yearRange, selectedCountries]);

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
    legend: {
      show: true,
      showForSingleSeries: true,
      position: "bottom",
    },
    stroke: {
      width: 2,
    },
  };

  return (
    <div className="p-4 gap-4 flex flex-col font-poppins">
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Autocomplete
            sx={{
              display: "inline-flex",
              width: "auto",
              minWidth: 200,
              maxWidth: 600,
              flexWrap: "wrap",
              fontFamily: "Poppins",
            }}
            multiple
            fullWidth
            options={availableCountries}
            value={selectedCountries}
            onChange={(_, newValue) => setSelectedCountries(newValue)}
            disableCloseOnSelect
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  sx={{
                    backgroundColor: ceruleanBlue[100],
                    color: ceruleanBlue[600],
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontFamily: "Poppins",
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  fontFamily: "Poppins",
                }}
                fullWidth
                label="Filter by Country"
              />
            )}
          />
        </div>

        <Autocomplete
          sx={{ minWidth: 120 }}
          options={years}
          value={yearRange.start.toString()}
          onChange={(_, newValue) => {
            if (newValue)
              updateYearRange({ ...yearRange, start: Number(newValue) });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Start Year"
              variant="outlined"
              size="small"
            />
          )}
        />

        <Autocomplete
          sx={{ minWidth: 120 }}
          options={years}
          value={yearRange.end.toString()}
          onChange={(_, newValue) => {
            if (newValue)
              updateYearRange({ ...yearRange, end: Number(newValue) });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="End Year"
              variant="outlined"
              size="small"
            />
          )}
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
