"use client";

import { useRouter } from "next/navigation"; // For Next.js 13+ app directory
import { useState, useEffect } from "react";
import L from "leaflet";
import Map from "./components/Map/Map";
import VegetationChart from "./components/VegetationChart";

interface BloomResult {
  status: string;
  intensity: string;
  ndvi_mean: number;
}

interface PolygonInfo {
  coordinates: number[][][];
  center: L.LatLng;
  bloomResult: BloomResult;
}

export default function Home() {
  const router = useRouter();
  const [polygonInfo, setPolygonInfo] = useState<PolygonInfo | null>(null);
  const [plantType, setPlantType] = useState("Almond");
  const [plantStage, setPlantStage] = useState("");
  const [csvText, setCsvText] = useState(""); // For line chart

  // Load CSV ONLY when polygonInfo is filled
  useEffect(() => {
    async function fetchCsv() {
      const res = await fetch("/ee-chart.csv"); // Ensure file is in /public
      const text = await res.text();
      setCsvText(text);
    }
    if (polygonInfo?.bloomResult) fetchCsv();
  }, [polygonInfo]);

  return (
    <div>
      <h2>GeoBloom: Detect Bloom Areas</h2>

      {/* Ecologist Labeled Button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          style={{
            background: "#4B9CD3",
            border: "1px solid #ccc",
            fontWeight: "bold",
            padding: "8px 16px",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => router.push("ecologist")} // Adjust this path if needed
        >
          farmers
        </button>
      </div>

      {/* Ecologist Labeled Button */}
      <div style={{ marginBottom: "20px" }}>
        <button
          style={{
            background: "#4B9CD3",
            border: "1px solid #ccc",
            fontWeight: "bold",
            padding: "8px 16px",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/ecologist")} // Adjust this path if needed
        >
          Ecologist Labeled
        </button>
      </div>

      <div style={{ display: "flex" }}>
        {/* Left Box */}
        <div
          style={{
            flex: 1,
            background: "#f0f0f0",
            padding: "20px",
            border: "1px solid #ccc",
          }}
        >
          <h2>Left Box</h2>
          <div style={{ flex: "1 1 100%" }}>
            {/* Show bloom info if available */}
            {polygonInfo?.bloomResult && (
              <div
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  background: "#f9f9f9",
                  marginBottom: "20px",
                }}
              >
                <h4>Bloom Detection Result:</h4>
                <p>Status: {polygonInfo.bloomResult.status}</p>
                <p>Intensity: {polygonInfo.bloomResult.intensity}</p>
                <p>NDVI Mean: {polygonInfo.bloomResult.ndvi_mean}</p>
                <p>
                  <strong>Plant Type:</strong> {plantType}
                  <br />
                  <strong>Plant Stage:</strong> {plantStage}
                </p>
              </div>
            )}
            {polygonInfo?.coordinates && (
              <div
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  marginBottom: "20px",
                  fontSize: "0.95em",
                }}
              >
                <h4>Polygon Coordinates:</h4>
                <ol>
                  {polygonInfo.coordinates[0].map(
                    (coord: number[], idx: number) => (
                      <li key={idx}>
                        Lat: {coord[1].toFixed(6)}, Lng: {coord[0].toFixed(6)}
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}

            {/* Show the vegetation chart under the bloom info */}
            {polygonInfo?.bloomResult && csvText && (
              <VegetationChart csvText={csvText} />
            )}

            {/* BEFORE DRAWING */}
            {!polygonInfo && <p>No polygon drawn yet.</p>}
          </div>
        </div>

        {/* Right Box */}
        <div
          style={{
            flex: 1,
            background: "#e0e0ff",
            padding: "20px",
            border: "1px solid #ccc",
          }}
        >
          <h2>Right Box</h2>
          <div style={{ height: "500px", width: "100%" }}>
            <Map
              polygonInfo={polygonInfo}
              setPolygonInfo={setPolygonInfo}
              plantType={plantType}
              setPlantType={setPlantType}
              plantStage={plantStage}
              setPlantStage={setPlantStage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
