"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Papa from "papaparse";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function VegetationChart({ csvText }: { csvText: string }) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (result: any) => {
        // Remove rows with missing NDVI or NDYI or Date
        const data = result.data.filter(
          (row: any) =>
            (row.Date || row["system:time_start"]) &&
            row.NDVI !== undefined &&
            row.NDVI !== "" &&
            row.NDYI !== undefined &&
            row.NDYI !== ""
        );
        const labels = data.map(
          (row: any) => row.Date || row["system:time_start"]
        );
        const ndvi = data.map((row: any) => row.NDVI);
        const ndyi = data.map((row: any) => row.NDYI);

        setChartData({
          labels,
          datasets: [
            {
              label: "NDVI",
              data: ndvi,
              borderColor: "green",
              backgroundColor: "rgba(0,128,0,0.2)",
              tension: 0.3,
            },
            {
              label: "NDYI",
              data: ndyi,
              borderColor: "orange",
              backgroundColor: "rgba(255,165,0,0.2)",
              tension: 0.3,
            },
          ],
        });
      },
    });
  }, [csvText]);

  return (
    <div style={{ marginTop: "20px", width: "100%" }}>
      <h4>📈 Vegetation Indices Over Time</h4>
      {chartData.labels.length > 0 && (
        <div style={{ height: "300px" }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
      )}
    </div>
  );
}
