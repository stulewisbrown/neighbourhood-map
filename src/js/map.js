// Create a map variable
var map;
// Create a new blank array for all the listing markers.
var markers = ko.observableArray();
// Create global var for infowindow
var infowindow;

initMap = function() {

        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 40.7413549,
                lng: -73.9980244
            },
            zoom: 13
        });
        // These are the real estate listings that will be shown to the user.
        // Normally we'd have these in a database instead.
        //var largeInfowindow = new google.maps.InfoWindow();

        var bounds = new google.maps.LatLngBounds();
        getAllMarkers(dataArray);
        loadMarkers();
    }
    // This function will loop through the markers array and display them all.
function loadMarkers() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers().length; i++) {
        markers()[i].setMap(map);
        bounds.extend(markers()[i].position);
    }
    map.fitBounds(bounds);
}

// The following group uses the location array to create an array of markers on initialize.
function getAllMarkers(locations) {
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        var genre = locations[i].genre;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            genre: genre,
            animation: google.maps.Animation.DROP,
            id: i
        });

        infowindow = new google.maps.InfoWindow();
        getFS(marker);
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, infowindow);
            toggleBounce(this);
        });

    }
}
// console.log(markers());

function getFS(marker) {
    // BEGIN FOURSQUARE AJAX INIT
    var url = "https://api.foursquare.com/v2/venues/explore";
    //foursquare client ID
    var idFSq = 'CAD3EEXMNHQFJ4HD215D4EA0KB10WHQGXSRQCV2LFOGFSFCF';
    //foursquare client Secret
    var secretFsq = 'WN4UXNSSMR25SNOMT5VCEBWVVONFQ4HUBGQZZ3DLDI1T5O5F';
    //console.log(marker.position);
    $.ajax({
        url: url,
        dataType: 'json',
        data: "limit=1&ll=" + marker.position.lat() + "," + marker.position.lng() + "&query=" + marker.title + "&" + "client_id=" + idFSq +
            "&client_secret=" + secretFsq + "&v=20161106&m=foursquare",
        method: 'GET',
        async: true,
    }).done(function(result) {

        //callback function if succes - Will add the rating received from foursquare to the content of the info window
        marker.rating = result.response.groups[0].items[0].venue.rating;

        if (!marker.rating) {
            marker.rating = 'No rating in foursquare';
        }

        marker.content = '<br><div class="labels">' + '<div class="title">' + marker.title +
            '</div><div class="rating">Foursquare rating: ' + marker.rating + '</div>' + '</div>';

    }).fail(function(err) {

        alert("Could not load data from foursquare!");
    });

    // END FOURSQUARE AJAX
}


// Set animation 
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 750);
    }
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.content + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
    }
}