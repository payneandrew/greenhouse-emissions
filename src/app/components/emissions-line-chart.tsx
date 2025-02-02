import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EmissionsLineChartProps {
  series: ApexAxisChartSeries;
}

export default function EmissionsLineChart({
  series,
}: EmissionsLineChartProps) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "line", height: 400, toolbar: { show: true } },
    xaxis: { type: "category", title: { text: "Year" } },
    yaxis: { title: { text: "GHG Emissions (Mt CO₂e)" } },
    tooltip: { x: { format: "yyyy" } },
    legend: { show: true, showForSingleSeries: true, position: "bottom" },
    stroke: { width: 2 },
  };

  return (
    <div className="p-4 flex flex-col font-poppins">
      {!series || series.length === 0 ? (
        <p className="text-red-500">No emissions data available.</p>
      ) : (
        <Chart options={options} series={series} type="line" height={600} />
      )}
    </div>
  );
}
