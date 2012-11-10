
function initMap() {
    window.Map = new BaseMap("map", TXConfig, i18n);
}

function BaseMap(id, config, i18n) {
    this.tileUrl = config.osm_tile_url;
    this.zoomAvaliable = config.osm_available_zoom;
    this.searchUrl =  config.osm_nominatim_search_url;
    this.i18n = i18n;
    this.id = id;

    var lat = config.osm_center_lat,
        lon = config.osm_center_lon,
        zoom = config.osm_initial_zoom;
    this.createMap(lat, lon, zoom);
}

BaseMap.prototype.fillStatistic = function(data)
{
    var self = this;
    var refreshStat = function(layer) {
        layer.features.forEach(function(feature) {

            var regionStat = _.find(data.data, function(regData) {
                return regData.region == feature.attributes.region;
            });

            if (regionStat !== undefined)
                feature.attributes.data = regionStat;
        });
        layer.redraw();
    };

    refreshStat(self.country_layer);
    refreshStat(self.federal_layer);
    refreshStat(self.region_layer);

}

BaseMap.prototype.createMap = function(lat, lon, zoom) {
    var self = this,
        map = new OpenLayers.Map( self.id, {
            numZoomLevels:20,
            units:'m',
            projection:new OpenLayers.Projection( "EPSG:900913" ),
            displayProjection:new OpenLayers.Projection( "EPSG:4326" ),
            controls:[
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.ScaleLine( { geodesic:true } ),
                new OpenLayers.Control.MousePosition( {
                    displayProjection:new OpenLayers.Projection( "EPSG:4326" )
                } ),
                new OpenLayers.Control.OverviewMap(),
                new OpenLayers.Control.Navigation( {
                    dragPanOptions:{ enableKinetic:true }
                } )
            ]
        } );

    var mapnik = new OpenLayers.Layer.OSM(self.i18n.main_layer,
        self.tileUrl, {
            numZoomLevels : self.zoomAvaliable,
            layers: 'basic',
            transitionEffect: 'resize'
        });

    map.addLayer(mapnik);

    OpenLayers.Feature.Vector.style['default']['fillColor'] = "green";
    OpenLayers.Feature.Vector.style['default']['fillOpacity'] = 0.4;
    OpenLayers.Feature.Vector.style['default']['strokeColor'] = "#000000";
    OpenLayers.Feature.Vector.style['default']['strokeOpacity'] = 0.1;
    OpenLayers.Feature.Vector.style['default']['stroke'] = true;
    OpenLayers.Feature.Vector.style['select']['fillColor'] = "#yellow";
    OpenLayers.Feature.Vector.style['select']['fillOpacity'] = 0.5;
    OpenLayers.Feature.Vector.style['select']['strokeColor'] = "yellow";

    var country_layer = new OpenLayers.Layer.Vector(self.i18n.country_layer, {
        isBaseLayer:false,
        visibility: true,
        transparent: true,
        renderers:["SVG", "VML", "Canvas"],
        projection:new OpenLayers.Projection("EPSG:4326")
    });
    map.addLayer(country_layer);

    var federal_layer = new OpenLayers.Layer.Vector(self.i18n.federal_layer, {
        isBaseLayer:false,
        visibility: false,
        transparent: true,
        renderers:["SVG", "VML", "Canvas"],
        projection:new OpenLayers.Projection("EPSG:4326")
    });
    map.addLayer(federal_layer);

    var region_layer = new OpenLayers.Layer.Vector(self.i18n.region_layer, {
        isBaseLayer:false,
        visibility: false,
        transparent: true,
        renderers:["SVG", "VML", "Canvas"]
    });
    map.addLayer(region_layer);

    map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
            "EPSG:900913")), zoom);

    map.toNormalLonLat = function(lonLat) {
        return lonLat.transform(map.projection, map.displayProjection);
    };

    var geoJSON = new OpenLayers.Format.GeoJSON({
        'internalProjection': map.baseLayer.projection,
        'externalProjection': new OpenLayers.Projection("EPSG:4326")
    });

    var countryFeatures = geoJSON.read(russia);
    var federalFeatures = geoJSON.read(rus_federal);
    var regionFeatures = geoJSON.read(regions);

    country_layer.strategies = [new OpenLayers.Strategy.Fixed()];
    country_layer.addFeatures(countryFeatures);
    federal_layer.strategies = [new OpenLayers.Strategy.Fixed()];
    federal_layer.addFeatures(federalFeatures);
    region_layer.strategies = [new OpenLayers.Strategy.Fixed()];
    region_layer.addFeatures(regionFeatures);

    map.events.register("mousemove", map, function (e) {
        self.mousePosition = map.getLonLatFromViewPortPx(e.xy);
    });

    self.map = map;
    self.country_layer = country_layer;
    self.federal_layer = federal_layer;
    self.region_layer = region_layer;

    self.addClickAndHighlight();

}

BaseMap.prototype.addClickAndHighlight = function() {
    var self = this;
    var map = self.map;
    var country_layer = self.country_layer;
    var federal_layer = self.federal_layer;
    var region_layer = self.region_layer;

    // create select for tooltips (OpenLayers Feature Tooltip)
    var highlightCtrl = new OpenLayers.Control.SelectFeature(
        [country_layer, federal_layer, region_layer],
        {
            hover: true,
            highlightOnly: true,
            renderIntent: "temporary",
            eventListeners: {
                featurehighlighted: self.tooltipSelect(self),
                featureunhighlighted: self.tooltipUnselect(self)
            }
        });
    map.addControl(highlightCtrl);
    highlightCtrl.handlers.feature.stopDown = false;
    highlightCtrl.activate();

    var selectCtrl = new OpenLayers.Control.SelectFeature(
        [country_layer, federal_layer, region_layer],
        {
            clickout: true
        }
    );
    map.addControl(selectCtrl);
    selectCtrl.handlers.feature.stopDown = false;
    selectCtrl.activate();

}

function generatePopup(center, htmlContent, closable) {
    var tooltipPopup = new OpenLayers.Popup("activetooltip",
        center,
        new OpenLayers.Size(240, 25),
        htmlContent,
        closable);
    tooltipPopup.closeOnMove = true;
    tooltipPopup.autoSize = true;
    // set tooltip style
    tooltipPopup.backgroundColor = '#000';
    tooltipPopup.opacity = 0.85;
    tooltipPopup.panMapIfOutOfView = false;
    // jQuery wrapper
    $(tooltipPopup.div).css({
        'border-width': '1px',
        'border-color': '#000',
        'border-radius': '4px',
        'border-style': 'solid',
        'padding': '1px',
        'margin-left': '10px',
        'margin-top': '4px'
    });
    // jQuery wrapper
    $(tooltipPopup.contentDiv).css({
        'overflow': 'hidden',
        'padding': '8px',
        'color': '#fff'
    });

    return tooltipPopup;
}

BaseMap.prototype.tooltipSelect = function(self) {
    return function(e) {

        var map = self.map;

        var htmlContent = '<span style="font-weight:bold">' + e.feature.attributes.region + '</span><hr/>';
        if (e.feature.attributes.data !== undefined)
        {
            htmlContent += "Всего ДТП: " + e.feature.attributes.data.rtc_total + "<br />";
            htmlContent += "Количество пострадавших: " + e.feature.attributes.data.injury_total;
        }
        var center = self.mousePosition;

        self.tooltipPopup = generatePopup(center, htmlContent, false);
        map.addPopup(self.tooltipPopup, true);

    }
}

BaseMap.prototype.tooltipUnselect = function(self) {
    return function(e) {
        map = self.map;

        map.popups.forEach(function(p) { map.removePopup(p); });
        // fix: map property
        self.tooltipPopup = null;
    }
}

BaseMap.prototype.searchAddress = function(address, cb) {

    var self = this;
    $.ajax({
        url: self.searchUrl,
        data: {
            format: "json",
            q: address,
            addressdetails: 1,
            limit: 10,
            countrycodes: "ru"
        },
        success: function(data) {
            cb(data);
        },
        error: function() {
            cb(null);
        }
    });
}

BaseMap.prototype.installSearch = function(searchField) {
    var self = this,
        map = self.map;

    $(searchField).on("keypress", function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);

        // enter keycode
        if(code == 13) {
            var query = $(this).val();

            self.searchAddress(query, function(places) {
                if (places != null && places.length > 0) {

                    var place = places[0];

                    map.setCenter(
                        new OpenLayers.LonLat(+place["lon"], +place["lat"])
                            .transform(map.displayProjection, map.projection));
                } else {
                    console.error("address not found");
                }
            });
        }
    });
}

/**
 * Creates a choropleth stylemap to define the map shading colors.
 */
BaseMap.prototype.createStyles = function(direction, maxCount) {
    var themeDefault = new OpenLayers.Style();

    var fillColor = '#B40404';
    range5 = new OpenLayers.Rule({
        filter:new OpenLayers.Filter.Comparison({
            type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
            property:"total",
            value:maxCount*0.8
        }),
        symbolizer:{Polygon:{fillColor: fillColor}}
    });

    fillColor = '#DF0101';
    range4 = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.AND,
            filters:[
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.LESS_THAN,
                    property:"total",
                    value:maxCount*0.8
                }),
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                    property:"total",
                    value:maxCount*0.6
                })
            ]
        }),
        symbolizer: {Polygon:{fillColor:fillColor}}
    });

    fillColor = '#FF0000';
    range3 = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.AND,
            filters:[
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.LESS_THAN,
                    property:"total",
                    value:maxCount*0.6
                }),
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                    property:"total",
                    value:maxCount*0.4
                })
            ]
        }),
        symbolizer: {Polygon:{fillColor:fillColor}}
    });

    fillColor = '#FE2E2E';
    range2 = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.AND,
            filters:[
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.LESS_THAN,
                    property:"total",
                    value:maxCount*0.4
                }),
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                    property:"total",
                    value:maxCount*0.2
                })
            ]
        }),
        symbolizer: {Polygon:{fillColor:fillColor}}
    });

    fillColor = '#FA5858';
    range1 = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.AND,
            filters:[
                new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.LESS_THAN,
                    property: "total",
                    value: maxCount*0.2
                }),
                new OpenLayers.Filter.Comparison({
                    type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                    property:"total",
                    value: 1
                })
            ]
        }),
        symbolizer:{Polygon:{fillColor:fillColor}}
    });

    themeDefault.addRules([range1, range2, range3, range4, range5]);

    return new OpenLayers.StyleMap({'default':themeDefault});
}

BaseMap.prototype.drawCountries = function() {

}

BaseMap.prototype.drawCities = function() {

}
