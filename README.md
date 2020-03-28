# leaflet-google.js
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.2/leaflet-src.js"></script>
    <script src="https://raruto.github.io/cdn/leaflet-google/0.0.3/leaflet-google.js"></script>
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
      var map = new L.Map('map', {
        center: [41.4583, 12.7059],
        zoom: 5,
        markerZoomAnimation: false,
        zoomControl: false
      });

      var zoomControl = new L.Control.Zoom({ position: 'topright' });

      var ggl = new L.Google('ROADMAP'); // Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN

      var url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attr =
        'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        otm = new L.TileLayer(url, {
          attribution: attr,
          /*subdomains:"1234"*/
        });

      var baseLayers = {
        "Google Map": ggl,
        "Leaflet Map": otm,
      };

      var layersControl = L.control.layers(baseLayers, null, { collapsed:false });

      layersControl.addTo(map);
      zoomControl.addTo(map);

      map.addLayer(ggl);
    </script>
    ```

_**NB** to be able to use the “pegman” (a.k.a. “Street View Control”) you **MUST** use a valid [Google Maps API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)._

---

**Compatibile with:** leaflet@1.3.2, gmaps@3.34

---

**Contributors:** [Bencevans](https://gist.github.com/bencevans/4504864), [Crofty](https://gist.github.com/crofty/2197042), [Raruto](https://github.com/Raruto/leaflet-google)
