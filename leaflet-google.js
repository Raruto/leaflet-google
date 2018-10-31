/**
 * Add Google as Leaflet layer for API integration.
 * 
 * @author Bencevans, Crofty, Raruto
 *
 * @link https://gist.github.com/bencevans/4504864
 * @link https://gist.github.com/crofty/2197042
 * @link https://github.com/Raruto/leaflet-google
 */

L.Google = (L.Layer || L.Class).extend({
	includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		opacity: 1,
		continuousWorld: false,
		noWrap: false,
		mapOptions: {
			backgroundColor: '#dddddd'
		}
	},

	// Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
	initialize: function(type, options) {
		L.Util.setOptions(this, options);

		this._ready = google.maps.Map != undefined;
		if (!this._ready) L.Google.asyncWait.push(this);

		this._type = type || 'SATELLITE';

		this._GAPIPromise = this._ready ? Promise.resolve(window.google) : new Promise(function(resolve, reject) {
			var checkCounter = 0;
			var intervalId = null;
			intervalId = setInterval(function() {
				if (checkCounter >= 10) {
					clearInterval(intervalId);
					return reject(new Error('window.google not found after 10 attempts'));
				}
				if (!!window.google && !!window.google.maps && !!window.google.maps.Map) {
					clearInterval(intervalId);
					return resolve(window.google);
				}
				checkCounter++;
			}, 500);
		});
	},

	onAdd: function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;

		// create a container div for tiles
		this._initContainer();
		this._initMapObject();

		// set up events
		map.on('viewreset', this._resetCallback, this);

		this._limitedUpdate = L.Util.limitExecByInterval ? L.Util.limitExecByInterval(this._update, 150, this) : L.Util.throttle(this._update, 150, this);
		map.on('move', this._update, this);

		map.on('zoomanim', this._handleZoomAnim, this);

		//20px instead of 1em to avoid a slight overlap with google's attribution
		//map._controlCorners['bottomright'].style.marginBottom = "20px";
		map._controlCorners["bottomright"].querySelector(".leaflet-control-attribution").style.display = "none";

		this._reset();
		this._update();
	},

	onRemove: function(map) {
		this._map._container.removeChild(this._container);
		//this._container = null;

		this._map.off('viewreset', this._resetCallback, this);

		this._map.off('move', this._update, this);

		this._map.off('zoomanim', this._handleZoomAnim, this);

		//map._controlCorners['bottomright'].style.marginBottom = "0em";
		map._controlCorners["bottomright"].querySelector(".leaflet-control-attribution").style.display = "";
		//this._map.off('moveend', this._update, this);
	},

	getAttribution: function() {
		return this.options.attribution;
	},

	setOpacity: function(opacity) {
		this.options.opacity = opacity;
		if (opacity < 1) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	setElementSize: function(e, size) {
		e.style.width = size.x + "px";
		e.style.height = size.y + "px";
	},

	_initContainer: function() {
		var tilePane = this._map._container,
			first = tilePane.firstChild;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-google-layer');
			this._container.id = "_GMapContainer_" + L.Util.stamp(this);
			this._container.style.zIndex = "400";
		}

		tilePane.insertBefore(this._container, first);

		this.setOpacity(this.options.opacity);
		this.setElementSize(this._container, this._map.getSize());
	},

	_initMapObject: function() {
		if (!this._ready) return;
		this._google_center = new google.maps.LatLng(0, 0);
		var map = new google.maps.Map(this._container, {
			center: this._google_center,
			zoom: 0,
			tilt: 0,
			mapTypeId: google.maps.MapTypeId[this._type],
			disableDefaultUI: true,
			keyboardShortcuts: false,
			zoomControl: false,
			draggable: false,
			disableDoubleClickZoom: true,
			scrollwheel: false,
			streetViewControl: true,
			backgroundColor: 'transparent'
			//styles: this.options.mapOptions.styles,
			//backgroundColor: this.options.mapOptions.backgroundColor
		});

		var _this = this;
		// this._reposition = google.maps.event.addListenerOnce(map, "center_changed",
		// 	function() {
		// 		_this.onReposition();
		// 	});
		this._google = map;

		google.maps.event.addListenerOnce(map, "idle",
			function() {
				_this._checkZoomLevels();
				_this._pegamenFix();
			}
		);
	},

	_checkZoomLevels: function() {
		//setting the zoom level on the Google map may result in a different zoom level than the one requested
		//(it won't go beyond the level for which they have data).
		// verify and make sure the zoom levels on both Leaflet and Google maps are consistent
		if (this._google.getZoom() !== this._map.getZoom()) {
			//zoom levels are out of sync. Set the leaflet zoom level to match the google one
			this._map.setZoom(this._google.getZoom());
		}
	},

	_pegamenFix: function() {
		var _this = this;
		var checkExist = setInterval(function() {
			var pegamenDiv = document.querySelector('.gm-svpc')
			if (pegamenDiv) {
				// Disable dragging when user's cursor enters the element
				pegamenDiv.addEventListener('mouseover', function() {
					_this._map.dragging.disable();
				});

				// Re-enable dragging when user's cursor leaves the element
				pegamenDiv.addEventListener('mouseout', function() {
					_this._map.dragging.enable();
				});
				clearInterval(checkExist);
			}
		}, 100); // check every 100ms
	},

	_resetCallback: function(e) {
		this._reset(e.hard);
	},

	_reset: function(clearOldContainer) {
		this._initContainer();
	},

	_update: function(e) {
		if (!this._google) return;
		this._resize();

		var center = e && e.latlng ? e.latlng : this._map.getCenter();
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(this._map.getZoom());

		this._checkZoomLevels();
		//this._google.fitBounds(google_bounds);
	},

	_resize: function() {
		var size = this._map.getSize();
		if (this._container.style.width == size.x &&
			this._container.style.height == size.y)
			return;
		this.setElementSize(this._container, size);
		this.onReposition();
	},


	_handleZoomAnim: function(e) {
		var center = e.center;
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(e.zoom);
	},


	onReposition: function() {
		if (!this._google) return;
		google.maps.event.trigger(this._google, "resize");
	}
});

L.Google.asyncWait = [];
L.Google.asyncInitialize = function() {
	var i;
	for (i = 0; i < L.Google.asyncWait.length; i++) {
		var o = L.Google.asyncWait[i];
		o._ready = true;
		if (o._container) {
			o._initMapObject();
			o._update();
		}
	}
	L.Google.asyncWait = [];
};
