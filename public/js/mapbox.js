export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXN0b24tbmFpY2tlciIsImEiOiJjbHpiazYzOWYwMXNxMmpzOHh1d2J1OHE1In0.pjjNQ3SqaL3pieCdIdmKNg';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/eston-naicker/clzbkucy9008o01qy2brocnqs', // style URL
        zoom: 10, // starting zoom
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        // Create Marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

        // Exten map bounds to include the current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}