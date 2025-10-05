// ecoMap.js
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

export default function Map({ setPolygonInfo, showForm }) {
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);

  useEffect(() => {
    const map = L.map("map").setView([40.147466, -122.186722], 11);

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

      setCurrentPolygon({
        coordinates: geojsonPolygon.geometry.coordinates,
        center: center,
      });

      if (showForm) {
        // Show popup form, same as before...
        // (form code omitted for brevity)
      } else {
        // No form: immediately update parent with results (for Ecologist page)
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
