# leaflet-google.js

[![GitHub release](https://img.shields.io/github/v/release/Raruto/leaflet-google)](https://github.com/Raruto/leaflet-google/releases)
[![License](https://img.shields.io/badge/license-GPL%202-blue.svg?style=flat)](LICENSE)

A Leaflet plugin that allows easy integration with the Google Maps API

_For a working example (without API Key) see [demo](https://raruto.github.io/examples/leaflet-google/leaflet-google.html)_

---

[![Leaflet+Google Logos](https://raruto.github.io/img/leaflet-google.jpg)](https://raruto.github.io)

> _Initally based on the [work](http://matchingnotes.com/using-google-map-tiles-with-leaflet) of **James “Crofty” Croft**_

## How to use

1. **include CSS & JavaScript**
    ```html
    <head>
    ...
    <style> html, body, #map { height: 100%; width: 100%; padding: 0; margin: 0; } </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/Raruto/leaflet-google@master/leaflet-google.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=<INSERT_HERE_API_KEY>"></script>
    ...
    </head>
    ```
2. **choose a div container used for the slippy map**
    ```html
    <body>
    ...
	  <div id="map"></div>
    ...
    </body>
    ```
3. **create your first simple “leaflet-google” slippy map**
    ```html
    <script>
    {
      const map = new L.Map('map', {
        center: [41.4583, 12.7059],
        zoom: 5,
        markerZoomAnimation: false,
        zoomControl: false
      });

      const zoomControl = new (L.ZoomControl || L.Control.Zoom)({ position: 'topright' });

      const ggl = new L.Google('ROADMAP'); // Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN

      const url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attr =
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        otm = new L.TileLayer(url, {
          attribution: attr,
          /*subdomains:"1234"*/
        });

      const baseLayers = {
        "Google Map": ggl,
        "Leaflet Map": otm,
      };

      const layersControl = new (L.LayersControl || L.Control.Layers)(baseLayers, null, { collapsed:false });

      layersControl.addTo(map);
      zoomControl.addTo(map);

      map.addLayer(ggl);
    }
    </script>
    ```

_**NB** to be able to use the “pegman” (a.k.a. “Street View Control”) you **MUST** use a valid [Google Maps API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)._

---

**Compatible with:**
[![Leaflet 1.9.4](https://img.shields.io/badge/Leaflet-1.9.4-1EB300.svg?style=flat)](https://leafletjs.com/reference.html)
[![Leaflet 2.0.0-beta.3](https://img.shields.io/badge/Leaflet-2.0.0--beta.3-1EB300.svg?style=flat)](https://leafletjs.com/reference.html)
[![Google Maps JavaScript API v3](https://img.shields.io/badge/Google%20Maps%20JavaScript%20API-v3-1EB300.svg?style=flat)](https://developers.google.com/maps/documentation/javascript)

---

**Contributors:** [Bencevans](https://gist.github.com/bencevans/4504864), [Crofty](https://gist.github.com/crofty/2197042), [Raruto](https://github.com/Raruto/leaflet-google)