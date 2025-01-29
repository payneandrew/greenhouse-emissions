import { Dispatch, SetStateAction } from "react";

export enum Tabs {
  LineChart = "Line Chart",
  Heatmap = "Heatmap",
}

interface TabsProps {
  activeTab: string;
  tabs: Tabs[];
  onTabChange: Dispatch<SetStateAction<Tabs>>;
}

export function ChartTabs({ activeTab, tabs, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-300 font-poppins">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 font-medium ${
            activeTab === tab
              ? "border-b-2 border-gossamerGreen-600 text-gossamerGreen-600"
              : "text-gray-500 hover:text-gossamerGreen-600"
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
