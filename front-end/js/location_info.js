/**
 * Gets coordinates from the clicked location and posts them to the backend
 * then builds popup and displays it
 */
function get_coordinates() {

    var lat, lng; // variables to save coordinate values

    map.on('click', function (e) {
        lat = e.latlng.lat;
        lng = e.latlng.lng;

        // ajax request to post data to backend
        $.ajax({
            url: 'http://localhost:10002/set_coordinates', //not sure if this URL is okay
            type: 'post',
            data: {
                lat: lat,
                lng: lng
            },
            success: function (data) {
                if (data.length !== 0) {
                    make_popup(data, lat, lng);
                } else {
                    swal({
                        titel: 'Error',
                        text: "No results!",
                        type: 'error',
                        customClass: 'swalCc',
                        buttonsStyling: false
                    });
                }
            },
            error: function (message) {
                swal({
                    titel: 'Error',
                    text: message,
                    type: 'error',
                    customClass: 'swalCc',
                    buttonsStyling: false
                });
            }
        });
    });
}

function make_popup(popup_content, lat, lng) {

    var circle = L.circle([lat, lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 1 //not sure if visible at this scale
    }).addTo(map);

    circle.bindPopup(popup_content);
}
//--------------------------------------------------------------------------------------

