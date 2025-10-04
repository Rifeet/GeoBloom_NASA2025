"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

export default function Map({ setPolygonInfo }) {
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [plantType, setPlantType] = useState("Almond");
  const [plantStage, setPlantStage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Update the popup with results
    if (currentPopup && currentPolygon) {
      const mockResult = {
        status: "peak",
        intensity: "high",
        ndvi_mean: 0.72,
      };

      // Update parent component
      setPolygonInfo({
        coordinates: currentPolygon.coordinates,
        center: currentPolygon.center,
        bloomResult: mockResult,
      });

      // Update popup content to show results
      currentPopup.setContent(`
        <div>
          <h4>Bloom Detection Result:</h4>
          <p><strong>Status:</strong> ${mockResult.status}</p>
          <p><strong>Intensity:</strong> ${mockResult.intensity}</p>
          <p><strong>NDVI Mean:</strong> ${mockResult.ndvi_mean}</p>
          <p><strong>Plant Type:</strong> ${plantType}</p>
          <p><strong>Plant Stage:</strong> ${plantStage}</p>
        </div>
      `);
    }
  };

  useEffect(() => {
    const map = L.map("map").setView([40.147466121791986, -122.18672168103481], 16);

    // Base tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);

      const geojsonPolygon = layer.toGeoJSON();
      const center = layer.getBounds().getCenter();
      
      // Reset form state for new polygon
      setFormSubmitted(false);
      setPlantStage("");
      
      // Store current polygon info
      setCurrentPolygon({
        coordinates: geojsonPolygon.geometry.coordinates,
        center: center,
      });

      // Create form HTML
      const formHTML = `
        <div id="polygon-form">
          <h4>Polygon Info</h4>
          <div style="margin-bottom: 10px;">
            <label>Plant Type: 
              <select id="plant-type" style="margin-left: 8px;">
                <option value="Almond">Almond</option>
              </select>
            </label>
          </div>
          <div style="margin-bottom: 10px;">
            <label>Plant Stage: 
              <select id="plant-stage" required style="margin-left: 8px;">
                <option value="" disabled selected>Select stage</option>
                <option value="Germination">Germination</option>
                <option value="Growth">Growth</option>
                <option value="Bloom">Bloom</option>
              </select>
            </label>
          </div>
          <button id="submit-form" type="button">Submit</button>
        </div>
      `;

      // Create and show popup
      const popup = L.popup()
        .setLatLng(center)
        .setContent(formHTML)
        .openOn(map);

      setCurrentPopup(popup);

      // Add event listeners after popup is opened
      setTimeout(() => {
        const submitBtn = document.getElementById("submit-form");
        const plantTypeSelect = document.getElementById("plant-type");
        const plantStageSelect = document.getElementById("plant-stage");

        if (submitBtn && plantTypeSelect && plantStageSelect) {
          // Update state when selects change
          plantTypeSelect.addEventListener("change", (e) => {
            setPlantType(e.target.value);
          });

          plantStageSelect.addEventListener("change", (e) => {
            setPlantStage(e.target.value);
          });

          // Handle form submission
          submitBtn.addEventListener("click", (e) => {
            const selectedStage = plantStageSelect.value;
            const selectedType = plantTypeSelect.value;
            
            if (!selectedStage) {
              alert("Please select a plant stage");
              return;
            }

            // Update state and trigger form submission
            setPlantType(selectedType);
            setPlantStage(selectedStage);
            
            // Mock API result
            const mockResult = {
              status: "peak",
              intensity: "high", 
              ndvi_mean: 0.72,
            };

            // Update parent component
            setPolygonInfo({
              coordinates: geojsonPolygon.geometry.coordinates,
              center: center,
              bloomResult: mockResult,
            });

            // Update popup with results
            popup.setContent(`
              <div>
                <h4>Bloom Detection Result:</h4>
                <p><strong>Status:</strong> ${mockResult.status}</p>
                <p><strong>Intensity:</strong> ${mockResult.intensity}</p>
                <p><strong>NDVI Mean:</strong> ${mockResult.ndvi_mean}</p>
                <p><strong>Plant Type:</strong> ${selectedType}</p>
                <p><strong>Plant Stage:</strong> ${selectedStage}</p>
              </div>
            `);
            
            setFormSubmitted(true);
          });
        }
      }, 100);
    });

    return () => map.remove();
  }, [setPolygonInfo]);

  return <div id="map" style={{ height: "500px", width: "100%" }} />;
}
