"use client";

import { Autocomplete, Chip, TextField } from "@mui/material";
import { ceruleanBlue } from "../../../styling/colors";

interface EmissionsFilterProps {
  availableCountries: string[];
  years: string[];
  selectedCountries: string[];
  setSelectedCountries: (countries: string[]) => void;
  yearRange: { start: number; end: number };
  updateYearRange: (range: { start: number; end: number }) => void;
}

export default function EmissionsFilter({
  availableCountries,
  years,
  selectedCountries,
  setSelectedCountries,
  yearRange,
  updateYearRange,
}: EmissionsFilterProps) {
  // instead of having an explicit "all" selector, all countries are loaded in by default and clearing your selections show all of the countries.
  return (
    <div className="flex gap-4 items-center">
      <Autocomplete
        sx={{
          minWidth: 200,
          width: "auto",
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
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Filter by Country"
            variant="outlined"
            size="small"
            fullWidth
          />
        )}
      />
      <Autocomplete
        sx={{ minWidth: 120 }}
        options={years}
        value={yearRange.start.toString()}
        onChange={(_, newValue) => {
          if (newValue)
            updateYearRange({ ...yearRange, start: Number(newValue) });
        }}
        renderInput={(params) => (
          <TextField {...params} label="Start Year" size="small" />
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
          <TextField {...params} label="End Year" size="small" />
        )}
      />
    </div>
  );
}
