import * as maplibregl from "maplibre-gl";
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import './style.css';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles",protocol.tile);

function getDay(d) {
    return d == '1' ? '日' :
           d == '2' ? '月' :
           d == '3' ? '火' :
           d == '4' ? '水' :
           d == '5' ? '木' :
           d == '6' ? '金' :
           d == '7' ? '土' :
           '-';
}

function getWeather(d) {
    return d == '1' ? '晴れ' :
           d == '2' ? '曇り' :
           d == '3' ? '雨' :
           d == '4' ? '霧' :
           d == '5' ? '雪' :
           '不明';
}

function getCondition(d) {
    return d == '1' ? '良好だった' :
           d == '2' ? '湿っていた' :
           d == '3' ? '凍結していた' :
           d == '4' ? '積雪していた' :
           d == '5' ? '舗装されていなかった' :
           '不明';
}

function getRoadtype(d) {
    return d == '1' ? '上りカーブの' :
           d == '2' ? '下りカーブの' :
           d == '3' ? '平坦なカーブの' :
           d == '4' ? '上りカーブの' :
           d == '5' ? '下りカーブの' :
           d == '6' ? '平坦なカーブの' :
           d == '7' ? '上り直線の' :
           d == '8' ? '下り直線の' :
           d == '9' ? '平坦な直線の' :
           d == '0' ? '自由通行可能な' :
           '';
}

function getLocation(d) {
    return d == '01' ? '交差点' :
           d == '07' ? '交差点' :
           d == '31' ? '交差点' :
           d == '37' ? '交差点' :
           d == '11' ? 'トンネル' :
           d == '12' ? '橋' :
           d == '13' ? '曲がり道' :
           d == '14' ? '道路' :
           d == '21' ? '踏切' :
           d == '22' ? '踏切' :
           d == '23' ? '踏切' :
           d == '00' ? '場所' :
           '場所';
}

function getSignal(d) {
    return d == '1' ? '信号機がある' :
           d == '2' ? '信号機がある' :
           d == '3' ? '信号機がある' :
           d == '4' ? '信号機がある' :
           d == '5' ? '信号機が消灯中の' :
           d == '6' ? '信号機が故障中の' :
           d == '7' ? '信号機がない' :
           d == '8' ? '信号機がある' :
           '';
}

function getType(d) {
    return d == '01' ? '人と車両' :
           d == '21' ? '車両同士' :
           d == '41' ? '車両単独' :
           d == '61' ? '列車' :
           '状況不明';
}

function getAge(d) {
    return d == '01' ? '24歳以下の若年者' :
           d == '25' ? '25～34歳' :
           d == '35' ? '35～44歳' :
           d == '45' ? '45～54歳' :
           d == '55' ? '55～64歳' :
           d == '65' ? '65～74歳' :
           d == '75' ? '75歳以上の高齢者' :
           '-'
}

const target_category = 'pedestrian_flag';//「人と車両の事故」のフラグ
const colors = ['#4169e1', '#87cefa'];//colors for pie-chart

const init_coord = [140.20, 35.45];
const init_zoom = 9;
const init_bearing = 0;
const init_pitch = 0;

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile2.openstreetmap.jp/styles/osm-bright-ja/style.json',
    center: init_coord,
    interactive: true,
    zoom: init_zoom,
    minZoom: 5,
    maxZoom: 21,
    maxPitch: 60,
    maxBounds: [[110.0000, 20.0000],[170.0000, 50.0000]],
    bearing: init_bearing,
    pitch: init_pitch,
    attributionControl:false
});

map.on('load', () => {
    map.addSource('ta_point', {
        'type': 'vector',
        'url': 'pmtiles://'+location.href+'app/ta_chiba_point.pmtiles',
        "minzoom": 0,
        "maxzoom": 12,
    });
    map.addSource('ta_cluster', {
        'type': 'vector',
        'url': 'pmtiles://'+location.href+'app/ta_chiba_flags_clustered.pmtiles',
        "minzoom": 0,
        "maxzoom": 15,
    });

    map.addLayer({
        'id':'ta_label',
        'type':'symbol',
        'source':'ta_point',
        'source-layer':'ta_chiba_point',
        'minzoom':16,
        'layout':{
            'icon-image':'',
            'text-ignore-placement':true,
            'text-field': '{発生日時　　年}/{発生日時　　月}/{発生日時　　日}',
            'text-size': 11,
            'text-font': ['Open Sans Semibold','Arial Unicode MS Bold'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top'
        },
        'paint':{
            'text-color': '#555',
        }
    });
    map.addLayer({
        'id': 'ta_record',
        'type': 'circle',
        'source': 'ta_point',
        'source-layer':'ta_chiba_point',
        "minzoom": 16,
        'layout': {
            'visibility': 'visible',
        },
        'paint': {
            'circle-color': ['step',['get','事故内容'],'#ff69b4',2,'transparent'],
            'circle-stroke-color':'#ff69b4',
            'circle-stroke-width':3,
            'circle-stroke-opacity': ['interpolate',['linear'],['zoom'],5,0.2,15,1],
            'circle-opacity': 0.9,
            'circle-radius': ['interpolate',['linear'],['zoom'],5,1,15,8]
        },
    });
    map.addLayer({
        'id': 'ta_pseudo',
        'source': 'ta_cluster',
        'source-layer':'ta_chiba_flags',
        "minzoom": 5,
        "maxzoom": 16,
        'layout': {
            'visibility': 'visible',
        },
        'type': 'circle',
        'paint': {
            'circle-color': 'transparent',
            'circle-stroke-color':'transparent',
            'circle-radius': 1
        },
    });
    map.addLayer({
        'id': 'ta_square',
        'source': 'ta_cluster',
        'source-layer':'ta_chiba_flags',
        "minzoom": 5,
        "maxzoom": 16,
        'filter': ['!=', 'clustered', true],
        'layout': {
            'visibility': 'visible',
        },
        'type': 'circle',
        'paint': {
            'circle-stroke-width':2,
            'circle-color': 'transparent',
            'circle-stroke-color':['step',['get',target_category],colors[1],1,colors[0]],
            'circle-stroke-opacity': 0.9,
            'circle-radius': 8
        },
    });
    map.addLayer({
        'id': 'ta_cluster_label',
        'type': 'symbol',
        'source': 'ta_cluster',
        'source-layer':'ta_chiba_flags',
        'minzoom': 5,
        'maxzoom': 16,
        'filter': ['!=', 'clustered', true],
        'layout': {
            'text-field': '1',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        'paint': {
            'text-color': '#111',
        }
    });
    
    //Create svg markers (see -> https://maplibre.org/maplibre-gl-js/docs/examples/cluster-html/)
    const markers = {};
    let markersOnScreen = {};

    function updateMarkers() {
        const newMarkers = {};
        const features = map.queryRenderedFeatures({layers: ['ta_pseudo']});
        
        for (let i = 0; i < features.length; i++) {
            const coords = features[i].geometry.coordinates;
            const props = features[i].properties;
            if (!props.clustered) continue;
            const id = props.fid + '_' + props.point_count;//create an unique id of each cluster

            let marker = markers[id];
            if (!marker) {
                const el = createDonutChart(props);
                marker = markers[id] = new maplibregl.Marker({
                    element: el
                }).setLngLat(coords);
            }
            newMarkers[id] = marker;
            if (!markersOnScreen[id]) marker.addTo(map);
        }
        // for every marker we've added previously, remove those that are no longer visible
        for (let id in markersOnScreen) {
            if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
    }

    //Create a legend based on the displayed layer 
    const ta_legend = document.getElementById('ta-legend')
    let legendContent;

    function generateLegend() {
        legendContent = '';
        if (map.queryRenderedFeatures({layers: ['ta_pseudo']})[0] !== undefined){
            legendContent += '<p>' +
            `
            <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><defs><clipPath id="clip0"><rect x="1159" y="256" width="28" height="28"/></clipPath><clipPath id="clip1"><rect x="1159" y="256" width="28" height="28"/></clipPath><clipPath id="clip2"><rect x="1160" y="259" width="23" height="24"/></clipPath><clipPath id="clip3"><rect x="1160" y="259" width="23" height="24"/></clipPath></defs><g clip-path="url(#clip0)" transform="translate(-1159 -256)"><g clip-path="url(#clip1)"><g clip-path="url(#clip2)"><path d="M1171.99 260.134C1178.1 260.134 1183.06 265.092 1183.06 271.208L1176.42 271.208C1176.42 268.762 1174.43 266.779 1171.99 266.779Z" stroke="#FFFFFF" stroke-width="1.14583" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" fill="${colors[0]}" fill-rule="evenodd" fill-opacity="1"/></g><g clip-path="url(#clip3)"><path d="M1183.06 271.208C1183.06 277.324 1178.1 282.282 1171.99 282.282 1165.87 282.282 1160.91 277.324 1160.91 271.208 1160.91 265.092 1165.87 260.134 1171.99 260.134L1171.99 266.779C1169.54 266.779 1167.56 268.762 1167.56 271.208 1167.56 273.655 1169.54 275.638 1171.99 275.638 1174.43 275.638 1176.42 273.655 1176.42 271.208Z" stroke="#FFFFFF" stroke-width="1.14583" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" fill="${colors[1]}" fill-rule="evenodd" fill-opacity="1"/></g></g></g></svg>
            `
            +'<br>事故件数及び、歩行者が関連した比率</p>';//24歳以下・65歳以上が関連なども可能だが、当該事故の関係者が運転者か歩行者かデータ上不明なので留意が必要
        }
        if (map.queryRenderedFeatures({layers: ['ta_record']})[0] !== undefined){
            legendContent += '<span class="circle01"></span>：死亡事故</p><p><span class="circle02"></span>：負傷事故</p>';
        }
        ta_legend.innerHTML = legendContent;
    }

    // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
    map.on('data', (e) => {
        if (e.sourceId !== 'ta_cluster' || !e.isSourceLoaded) return;
        map.on('move', updateMarkers);
        map.on('moveend', updateMarkers);
        map.on('moveend', generateLegend);
        updateMarkers();
        generateLegend();
    });
});

map.on('click', 'ta_record', function (e) {
    const a_size = Number(e.features[0].properties["負傷者数"])+Number(e.features[0].properties["死者数"])
    let popupContent = '<p class="tipstyle02"><span class="style01">'+e.features[0].properties["発生日時　　年"]+'年'+e.features[0].properties["発生日時　　月"]+'月'+e.features[0].properties["発生日時　　日"]+'日（'+getDay(e.features[0].properties["曜日(発生年月日)"])+(e.features[0].properties["祝日(発生年月日)"]==="0"?'・祝':'')+'）';
    popupContent += e.features[0].properties["発生日時　　時"]+'時'+e.features[0].properties["発生日時　　分"]+'分頃</span>に発生した<span class="style01">'+ getType(e.features[0].properties["事故類型"]) +'の事故</span>で、';
    popupContent += (e.features[0].properties["負傷者数"] != "0" ? '<span class="style01">'+e.features[0].properties["負傷者数"]+'名が負傷</span>':'')+(e.features[0].properties["死者数"] != "0" ? " ":"した。")+(e.features[0].properties["死者数"] != "0" ? '<span class="style01">'+e.features[0].properties["死者数"]+'名が亡くなった</span>。':'')+'<br>';
    popupContent += '当事者の年齢層は<span class="style01">'+ getAge(e.features[0].properties["年齢（当事者A）"]) +(getAge(e.features[0].properties["年齢（当事者B）"]) != "-" ? 'と、'+getAge(e.features[0].properties["年齢（当事者B）"]):'')+'</span>'+(a_size > 2 ? '（本票記載の２名のみ表示）':'')+'。<br>';
    popupContent += '現場は<span class="style01">'+getRoadtype(e.features[0].properties["道路線形"])+(getLocation(e.features[0].properties["道路形状"]) != "交差点" ? getLocation(e.features[0].properties["道路形状"]):getSignal(e.features[0].properties["信号機"])+"交差点")+'</span>で、';
    popupContent += '当時の天候は<span class="style01">'+getWeather(e.features[0].properties["天候"])+'</span>、路面状態は<span class="style01">'+getCondition(e.features[0].properties["路面状態"])+'</span>。</p>';
    
    new maplibregl.Popup({closeButton:true, focusAfterOpen:false, className:"t-popup", maxWidth:"280px"})
    .setLngLat(e.lngLat)
    .setHTML(popupContent)
    .addTo(map);
});
map.on('mouseenter', 'ta_record', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'ta_record', function () {
    map.getCanvas().style.cursor = '';
});

// code for creating an SVG donut chart from feature properties
function createDonutChart(props) {
    const offsets = [];
    const counts = [props[target_category], props['point_count'] - props[target_category]];
    let total = 0;
    for (let i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
    }
    const fontSize = total >= 1000 ? 18 : total >= 100 ? 15 : 11;
    const r = total >= 10000 ? 50 : total >= 5000 ? 40 : total >= 1000 ? 30 : total >= 100 ? 24 : total >= 10 ? 18 : 12;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;
    
    let html =
        `<div><svg width="${
            w
        }" height="${
            w
        }" viewbox="0 0 ${
            w
        } ${
            w
        }" text-anchor="middle" style="font: ${
            fontSize
        }px sans-serif; display: block">`;

    for (let i = 0; i < counts.length; i++) {
        html += donutSegment(
            offsets[i] / total,
            (offsets[i] + counts[i]) / total,
            r,
            r0,
            colors[i]
        );
    }
    html +=
        `<circle cx="${
            r
        }" cy="${
            r
        }" r="${
            r0
        }" fill="white" /><text dominant-baseline="central" transform="translate(${
            r
        }, ${
            r
        })">${
            total.toLocaleString()
        }</text></svg></div>`;

    const el = document.createElement('div');
    el.innerHTML = html;
    return el.firstChild;
}

function donutSegment(start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001;
    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0),
        y0 = Math.sin(a0);
    const x1 = Math.cos(a1),
        y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return [
        '<path d="M',
        r + r0 * x0,
        r + r0 * y0,
        'L',
        r + r * x0,
        r + r * y0,
        'A',
        r,
        r,
        0,
        largeArc,
        1,
        r + r * x1,
        r + r * y1,
        'L',
        r + r0 * x1,
        r + r0 * y1,
        'A',
        r0,
        r0,
        0,
        largeArc,
        0,
        r + r0 * x0,
        r + r0 * y0,
        `" fill="${color}" fill-opacity="0.8"/>`
    ].join(' ');
}

const attCntl = new maplibregl.AttributionControl({
    customAttribution: '<a href="https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html" target="_blank">警察庁オープンデータ（2019年〜2022年の交通事故統計情報）</a>に基づき作成者が独自に加工（<a href="https://twitter.com/Smille_feuille" target="_blank">Twitter</a> | <a href="https://github.com/sanskruthiya/ta-chiba2022" target="_blank">Github</a>） ',
    compact: true
});

map.addControl(attCntl, 'bottom-right');

const geocoderApi = {
    forwardGeocode: async (config) => {
        const features = [];
        try {
            const request =
        `https://nominatim.openstreetmap.org/search?q=${
            config.query
        }&format=geojson&polygon_geojson=1&addressdetails=1`;
            const response = await fetch(request);
            const geojson = await response.json();
            for (const feature of geojson.features) {
                const center = [
                    feature.bbox[0] +
                (feature.bbox[2] - feature.bbox[0]) / 2,
                    feature.bbox[1] +
                (feature.bbox[3] - feature.bbox[1]) / 2
                ];
                const point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: center
                    },
                    place_name: feature.properties.display_name,
                    properties: feature.properties,
                    text: feature.properties.display_name,
                    place_type: ['place'],
                    center
                };
                features.push(point);
            }
        } catch (e) {
            console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
            features
        };
    }
};

const geocoder = new MaplibreGeocoder(geocoderApi, {
        maplibregl,
        zoom: 10,
        placeholder: '場所を検索',
        collapsed: true,
        //bbox:[122.94, 24.04, 153.99, 45.56],
        countries:'ja',
        language:'ja'
    }
);
map.addControl(geocoder, 'top-right');

const geolocator = new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }
);
map.addControl(geolocator, 'top-right');
