"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import parseGeoraster from "georaster";

export default function Map({ setPolygonInfo, showForm = true }) {
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [plantType, setPlantType] = useState("Almond");
  const [plantStage, setPlantStage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const map = L.map("map").setView([40.147466121791986, -122.18672168103481], 16);

    // Base map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

    // ----- Prepare overlays for raster layers -----
    let overlays = {}; // will hold named overlays for the control
    let ndviLayer = null;
    let ndyiLayer = null;

    Promise.all([
      fetch("/NDVI_Feb2025.tif").then(r => r.arrayBuffer()).then(parseGeoraster),
      fetch("/NDYI_Feb2025.tif").then(r => r.arrayBuffer()).then(parseGeoraster)
    ]).then(([ndviRaster, ndyiRaster]) => {
      ndviLayer = new GeoRasterLayer({
        georaster: ndviRaster,
        opacity: 0.7,
        resolution: 256,
      });
      ndyiLayer = new GeoRasterLayer({
        georaster: ndyiRaster,
        opacity: 0.7,
        resolution: 256,
      });
      overlays = {
        "NDVI Raster": ndviLayer,
        "NDYI Raster": ndyiLayer,
      };
      L.control.layers({}, overlays, { collapsed: false }).addTo(map);
      // Optional: Show both by default
      // ndviLayer.addTo(map);
      // ndyiLayer.addTo(map);
    });

    // ----- POLYGON DRAWING -----
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      const geojsonPolygon = layer.toGeoJSON();
      const center = layer.getBounds().getCenter();

      setFormSubmitted(false);
      setPlantStage("");
      setCurrentPolygon({
        coordinates: geojsonPolygon.geometry.coordinates,
        center: center,
      });

      if (showForm) {
        // Show form popup
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

        const popup = L.popup()
          .setLatLng(center)
          .setContent(formHTML)
          .openOn(map);
        setCurrentPopup(popup);

        setTimeout(() => {
          const submitBtn = document.getElementById("submit-form");
          const plantTypeSelect = document.getElementById("plant-type");
          const plantStageSelect = document.getElementById("plant-stage");

          if (submitBtn && plantTypeSelect && plantStageSelect) {
            plantTypeSelect.addEventListener("change", (e) => {
              setPlantType(e.target.value);
            });
            plantStageSelect.addEventListener("change", (e) => {
              setPlantStage(e.target.value);
            });
            submitBtn.addEventListener("click", (e) => {
              const selectedStage = plantStageSelect.value;
              const selectedType = plantTypeSelect.value;

              if (!selectedStage) {
                alert("Please select a plant stage");
                return;
              }
              setPlantType(selectedType);
              setPlantStage(selectedStage);

              const mockResult = {
                status: "peak",
                intensity: "high",
                ndvi_mean: 0.72,
              };

              setPolygonInfo({
                coordinates: geojsonPolygon.geometry.coordinates,
                center: center,
                bloomResult: mockResult,
              });

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

      } else {
        // No form: update immediately
        const mockResult = {
          status: "peak",
          intensity: "high",
          ndvi_mean: 0.72,
        };
        setPolygonInfo({
          coordinates: geojsonPolygon.geometry.coordinates,
          center: center,
          bloomResult: mockResult,
        });
      }
    });

    return () => map.remove();
  }, [setPolygonInfo, showForm]);

  return <div id="map" style={{ height: "500px", width: "100%" }} />;
}
