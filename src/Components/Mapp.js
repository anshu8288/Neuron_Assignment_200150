import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./CSSFiles/mapp.css";
import AnimationMap from "./AnimationMap";

const MyMap2 = () => {
  const [firstOccurrence, setFirstOccurrence] = useState({});
  const [ports, setPorts] = useState({});
  const markers = useRef({});

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw";

    const map = new mapboxgl.Map({
      container: "map-container",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-77.032, 38.913],
      zoom: 1,
    });

    const fetchShipData = async () => {
      try {
        // Fetch ship data
        const response = await fetch("/DataFiles/new_ships.csv");
        const responseText = await response.text();
        let lines = responseText.split("\n");
        lines = lines.slice(1);

        let FO = {};

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

            if (!(shipId in FO)) {
              FO[shipId] = { latitude, longitude, direction: dir };
            }
          }
        }

        setFirstOccurrence(FO);

        // Fetch port data
        const portresponse = await fetch("/DataFiles/new_ports.csv");
        const portresponseText = await portresponse.text();
        let portlines = portresponseText.split("\n");
        portlines = portlines.slice(1);

        let portData = {};

        for (let row of portlines) {
          const cells = row.split(",");
          let i = cells.length - 3;
          let name = "";
          while (i >= 0) {
            name += cells[i];
            name += " ";
            i--;
          }
          name = name.trim();
          name = name.split(" ").reverse().join(" ");

          const latitudeStr = cells[cells.length - 2];
          const longitudeStr = cells[cells.length - 1];

          if (latitudeStr && longitudeStr) {
            const latitude = parseFloat(latitudeStr);
            const longitude = parseFloat(longitudeStr);

            if (name && longitude && latitude) {
              if (!portData[name]) {
                portData[name] = [];
              }
              portData[name].push({ latitude, longitude });
            }
          }
        }

        setPorts(portData);

        const marker = new mapboxgl.Marker()
          .setLngLat([-77.032, 38.913])
          .addTo(map);

          console.log(FO)
        Object.values(FO).forEach((location) => {
          new mapboxgl.Marker({color:"yellow"})
            .setLngLat([location.longitude, location.latitude])
            .addTo(map)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h3>"Ship Coordinates:"</h3><br/><h4>${location.longitude}, ${location.latitude}</h4>`
              )
            );
        });
        console.log(portData)

        Object.values(portData).forEach((locations,index) => {
          // console.log(locations)
          locations.forEach((location)=>{
           
            new mapboxgl.Marker({color:"red"})
              .setLngLat([location.longitude, location.latitude])
              .addTo(map)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `<h3>"Port Coordinates:"</h3><br/><h4>${location.longitude}, ${location.latitude}</h4>`
                ));
          });
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchShipData();

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="map-page">
      <div className="map-box">
        <div
          id="map-container"
          style={{ width: "100%", height: "505px", color: "red" }}
        />
      </div>

      <AnimationMap />
      <div className="comment">
        <h2>Hover over any marker to see the details or Select any ship in the second map to trace its journey.</h2>
        <h3>Yellow represents ships and red represents ports. Press shift and drag the mouse over the area where you want to zoom in.</h3>
        <h5>We have used a smaller set of the given dataset here for easy display and less load time. Change the name to original data file in the JS file to visualize the original dataset.</h5>
      </div>
    </div>
  );
};

export default MyMap2;
