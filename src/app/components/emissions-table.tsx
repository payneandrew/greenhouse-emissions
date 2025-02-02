import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { useMemo, useState } from "react";
import { EmissionRecord } from "../types/emission-data-types";

interface EmissionsTableProps {
  emissionsData: EmissionRecord[];
}

export default function EmissionsTable({ emissionsData }: EmissionsTableProps) {
  const [orderBy, setOrderBy] = useState<keyof EmissionRecord>("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (property: keyof EmissionRecord) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    return [...emissionsData].sort((a, b) => {
      if (orderBy === "date") {
        return order === "asc"
          ? parseInt(a.date, 10) - parseInt(b.date, 10)
          : parseInt(b.date, 10) - parseInt(a.date, 10);
      } else {
        return order === "asc"
          ? (a.value ?? 0) - (b.value ?? 0)
          : (b.value ?? 0) - (a.value ?? 0);
      }
    });
  }, [emissionsData, orderBy, order]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 150 }}>Country</TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <TableSortLabel
                  active={orderBy === "date"}
                  direction={orderBy === "date" ? order : "asc"}
                  onClick={() => handleSort("date")}
                >
                  Year
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 150 }}>
                <TableSortLabel
                  active={orderBy === "value"}
                  direction={orderBy === "value" ? order : "asc"}
                  onClick={() => handleSort("value")}
                >
                  Emissions (Mt CO₂e)
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record, index) => (
                <TableRow
                  key={`${record.country.id}-${record.date}`}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#0000000D" : "white",
                  }}
                >
                  <TableCell>{record.country.value}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    {record.value !== null
                      ? record.value.toLocaleString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={emissionsData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}
