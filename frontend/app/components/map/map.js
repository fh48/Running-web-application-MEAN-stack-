'use strict';

/** @module navbar **/
angular.module('hfApp.map', []).directive('hfMap', function(NgMap) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "app/components/map/map.html",
		scope: {
			geoJson: '=geoJson'
		},
		link: function(scope, element, attr) {
			function displayGeoJson(geoJson) {
				NgMap.getMap({
					'id': 'map-' + scope.$id
				}).then(function(ngMap) {
					ngMap.data.forEach(function(feature) {
						ngMap.data.remove(feature);
					});
					// draw on map
					ngMap.data.addGeoJson(geoJson);
					// zoom to route
					var bounds = new google.maps.LatLngBounds();
					if (geoJson.type == "FeatureCollection") {
						geoJson.features.forEach(extendBounds);
					} else if (geoJson.type == "Feature") {
						extendBounds(geoJson);
					} else {
						console.log("Could not extract route bounds");
						return;
					}
					ngMap.fitBounds(bounds);

					function extendBounds(feature) {
						processPoints(feature.geometry.coordinates);
					}

					function processPoints(coordinates) {
						if (!isNaN(coordinates[0])) {
							bounds.extend({
								lat: coordinates[1],
								lng: coordinates[0]
							});
						} else {
							coordinates.forEach(processPoints);
						}
					}
				});
			}

			scope.mapStyle = function(feature) {
				// Create dashed line https://developers.google.com/maps/documentation/javascript/symbols?hl=en#dashed_lines
				var color = '#b90d00',
					lineSymbol = {
						path: 'M 0,-1 0,1',
						strokeOpacity: 0.8,
						scale: 3,
						fillColor: color,
						strokeColor: color
					};
				if (feature.getProperty('isColorful')) {
					color = feature.getProperty('color');
				}
				return ({
					fillColor: color,
					strokeColor: '#fff',
					strokeOpacity: 1,
					strokeWeight: 5,
					icons: [{
						icon: lineSymbol,
						offset: '0',
						repeat: '15px'
					}],
				});
			};

			//Watches the route.
			scope.$watch('geoJson', function(newValue, oldValue) {
				if (newValue) {
					displayGeoJson(newValue);
				}
			});
		}
	};
});
