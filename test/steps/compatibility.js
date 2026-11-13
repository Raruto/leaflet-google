const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const { After, AfterAll, BeforeAll, Then, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(30000);
let browser;
BeforeAll(async () => { browser = await chromium.launch(); });
After(async function () { if (this.page) await this.page.close(); });
AfterAll(async () => { if (browser) await browser.close(); });

Then('the {string} bundle synchronizes a Google map with Leaflet {string}', async function (bundle, version) {
  const page = this.page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setContent('<div id="map" style="width:400px;height:300px"></div>');
  const dist = `https://unpkg.com/leaflet@${version}/dist`;
  await page.addStyleTag({ url: `${dist}/leaflet.css` });
  await page.addScriptTag({ url: `${dist}/${version === '1.9.4' ? 'leaflet.js' : 'leaflet-global.js'}` });
  await page.addScriptTag({ path: path.join(__dirname, '..', '..', `leaflet-google${bundle === 'minified' ? '.min' : ''}.js`) });
  assert.equal(await page.evaluate(() => typeof googleLayerMethods), 'undefined');
  const result = await page.evaluate(async () => {
    window.google = { maps: {
      Map: class {
        constructor(container, options) { this.container = container; this.type = options.mapTypeId; }
        setCenter(center) { this.center = center; }
        setZoom(zoom) { this.zoom = zoom; }
        getZoom() { return this.zoom; }
        getStreetView() { return null; }
      },
      LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } },
      MapTypeId: { ROADMAP: 'roadmap' },
      event: { addListenerOnce() {}, trigger() {} },
    } };
    const map = new (L.LeafletMap || L.Map)('map', { center: [1, 2], zoom: 3 });
    const layer = new L.Google('ROADMAP', { opacity: 0.5 }).addTo(map);
    map.setView([4, 5], 4, { animate: false });
    layer.setOpacity(1);
    const actual = {
      version: L.version, type: layer._google.type, center: layer._google.center,
      zoom: layer._google.zoom, opacity: layer._container.style.opacity,
    };
    layer.remove();
    actual.removed = !map.hasLayer(layer);
    const google = window.google;
    delete window.google;
    const delayed = new L.Google().addTo(map);
    window.google = google;
    L.Google.asyncInitialize();
    await delayed._GAPIPromise;
    actual.delayed = delayed._google.getZoom() === 4;
    delayed.remove();
    map.remove();
    return actual;
  });
  assert.deepEqual(result, { version, type: 'roadmap', center: { lat: 4, lng: 5 }, zoom: 4, opacity: '1', removed: true, delayed: true });
  assert.deepEqual(errors, []);
});
