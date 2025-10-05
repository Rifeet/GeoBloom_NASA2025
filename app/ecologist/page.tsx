"use client";

import { useState, useEffect } from "react";
import Map from "../components/Map/ecoMap";
import VegetationChart from "../components/VegetationChart";

export default function EcologistPage() {
  const [polygonInfo, setPolygonInfo] = useState(null);
  const [csvText, setCsvText] = useState("");

  useEffect(() => {
    async function fetchCsv() {
      const res = await fetch("/ee-chart.csv");
      const text = await res.text();
      setCsvText(text);
    }
    if (polygonInfo) fetchCsv();
  }, [polygonInfo]);

  return (
    <div>
      <h2>GeoBloom: Ecologist Labeled Area</h2>
      <div style={{ display: "flex" }}>
        {/* Left: Graph shown only after polygon */}
        <div
          style={{
            flex: 1,
            background: "#f7f7f7",
            padding: "20px",
            border: "1px solid #ccc",
            minHeight: "600px",
          }}
        >
          <h2>Left Box</h2>
          {polygonInfo && csvText ? (
            <VegetationChart csvText={csvText} />
          ) : (
            <p>
              No polygon drawn yet. Draw a polygon on the map to display the
              graph.
            </p>
          )}
        </div>
        {/* Right: Map (no form) */}
        <div
          style={{
            flex: 1,
            background: "#e0e0ff",
            padding: "20px",
            border: "1px solid #ccc",
            minHeight: "600px",
          }}
        >
          <h2>Right Box</h2>
          <div style={{ height: "500px", width: "100%" }}>
            <Map
              polygonInfo={polygonInfo}
              setPolygonInfo={setPolygonInfo}
              // Don't pass plantType/plantStage or related form props
            />
          </div>
        </div>
      </div>
    </div>
  );
}
