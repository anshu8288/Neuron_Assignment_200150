import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

const AnimationMap = () => {
  const [ship, setShip] = useState({});
  const [selectedShipId, setSelectedShipId] = useState("ship_80");
  const [keyframes, setKeyframes] = useState([]);

  useEffect(() => {
    const fetchShip = async () => {
      try {
        const sresponse = await fetch("/DataFiles/new_timelapse.csv");
        const sresponseText = await sresponse.text();

        let lines = sresponseText.split("\n");
        lines = lines.slice(1);

        let shipData = {};

        for (let row of lines) {
          const cells = row.split(",");
          const shipId = cells[0];
          const latitudeStr = cells[1];
          const longitudeStr = cells[2];
          const direction = cells[3];
          const time = cells[4];

          if (latitudeStr && longitudeStr && direction && time) {
            const latitude = parseFloat(latitudeStr);
            const longitude = parseFloat(longitudeStr);
            const dir = parseFloat(direction);

            if (!shipData[shipId]) {
              shipData[shipId] = [];
            }

            shipData[shipId].push({
              center: [longitude, latitude],
            });
          }
        }

        setShip(shipData);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShip();
  }, []);

  useEffect(() => {
    if (ship[selectedShipId]) {
      setKeyframes(ship[selectedShipId]);
    }
  }, [selectedShipId, ship]);

  useEffect(() => {
    if (keyframes.length > 0) {
      mapboxgl.accessToken =
        "pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw";

      const map = new mapboxgl.Map({
        container: "map-container2",
        style: "mapbox://styles/mapbox/streets-v11",
        center: keyframes[0].center,
        zoom: 3,
      });
      const portMarkerColor="yellow"

      const marker = new mapboxgl.Marker({ color: portMarkerColor })
        .setLngLat(keyframes[0].center)
        .addTo(map);

      let startTime;
      const duration = 10000;

      const animateMarker = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentKeyframeIndex = Math.floor(
          progress * (keyframes.length - 1)
        );
        const currentKeyframe = keyframes[currentKeyframeIndex];
        const nextKeyframe =
          keyframes[currentKeyframeIndex + 1] ||
          keyframes[currentKeyframeIndex];

        const lng =
          currentKeyframe.center[0] +
          (nextKeyframe.center[0] - currentKeyframe.center[0]) * progress;
        const lat =
          currentKeyframe.center[1] +
          (nextKeyframe.center[1] - currentKeyframe.center[1]) * progress;

        marker.setLngLat([lng, lat]);

        if (progress < 1) {
          requestAnimationFrame(animateMarker);
        }
      };

      requestAnimationFrame(animateMarker);

      return () => {
        map.remove();
      };
    }
  }, [keyframes]);

  const handleShipSelect = (event) => {
    setSelectedShipId(event.target.value);
  };

  return (
    <>
      <div className="anim-map">
        <div id="map-container2" style={{ width: "100%", height: "505px" }} />
      </div>
      <div className="ship-select">
        <label htmlFor="ship-select" className="label-ship">Select a Ship to trace its journey:</label>
        <select id="ship-select-1" onChange={handleShipSelect} value={selectedShipId}>
          <option value="">Select a ship...</option>
          {Object.keys(ship).map((shipId) => (
            <option key={shipId} value={shipId}>
              {shipId}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default AnimationMap;