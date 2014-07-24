var gjson, map, loc, start = [];
function autocomplete(where, i) {
    var autocomplete = new google.maps.places.Autocomplete((document.getElementById(where)), {types: ['geocode']});
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        start[i] = {
            'lat': place.geometry.location.lat(),
            'lng': place.geometry.location.lng(),
            'address': place.address_components[0].long_name
        };
    });
}
//change the map type
function mapType() {
    i = document.getElementById("maptype").value;
    if (i === 'HYBRID') {
        map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    }
    else if (i === "ROADMAP") {
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
    else if (i === "SATELLITE") {
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    }
    else if (i === "TERRAIN") {
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    }
}
// Get the route from google
function route() {
    var request = {
        origin: new google.maps.LatLng(start[0]['lat'], start[0]['lng']),
        destination: new google.maps.LatLng(start[1]['lat'], start[1]['lng']),
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
    };
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            gjson = result;
        }
    });
}
// Request the price
function price() {
    try {
        var distance = 0;
        var legs = [];
        var duration = 0;
        var route = gjson.routes[0];
        var n = route.legs.length;
        var points_list = new Array();
        for (i = 0; i < n; i++) {
            distance += route.legs[i].distance.value;
            duration += Math.round(route.legs[i].duration.value);
            var first_point = {
                'lng': route.legs[0].start_location.lng(),
                'lat': route.legs[0].start_location.lat(),
                "type": "p",
                "address": route.legs[0].start_address
            };
            points_list.push(first_point);
            var dropoff_point = {
                'lng': route.legs[0].end_location.lng(),
                'lat': route.legs[0].end_location.lat(),
                "type": "d",
                "address": route.legs[i].end_address
            };
            legs.push(route.legs[i].distance.value);
        }
        obj = {
            "priceList": [
                {
                    "Booking": {
                        "id_client": 102480,
                        "id_car_type": 2,
                        "payment_method": "CREDIT ONLINE",
                        "transfer_type": "local"
                    },
                    "BookingCharge": {
                        "com_cash": 1,
                        "com_credit": 2,
                        "driver_tip": 2
                    },
                    "Journey": {
                        "child_seats_number": 5,
                        "req_baby_seat": "yes",
                        "extra_duration_delay": 0,
                        "pickup_time": "2015-01-21 13:00:00",
                        "journey_type": "localaddress-localaddress"
                    },
                    "RouteInfo": {
                        "points_list": [
                            {
                                'lng': gjson.routes[0].legs[0].start_location.B,
                                'lat': gjson.routes[0].legs[0].start_location.k,
                                "type": "p",
                                "address": gjson.routes[0].legs[0].start_address
                            },
                            {
                                'lng': gjson.routes[0].legs[0].end_location.B,
                                'lat': gjson.routes[0].legs[0].end_location.k,
                                "type": "d",
                                "address": gjson.routes[0].legs[0].end_address
                            }

                        ],
                        "distance": distance,
                        "duration": duration,
                        "old_distance": 0,
                        "legs": legs
                    }
                }
            ]};
        QuoteService();
    }
    catch (err) {
        document.getElementById('info').innerHTML = "Please enter the route first.";
    }
}
// Get the Json from server
function QuoteService() {
    $.ajax({
        type: 'POST',
        url: "https://api_test_gtn.insoftd.com/v1/operator/price/new",
        dataType: "json",
        data: JSON.stringify(obj),
        contentType: 'application/json',
        success: function(data) {
            document.getElementById('info').innerHTML = 'The price will be '
                    + data.records.totalPrice
                    + ' &pound; and the distance covered is '
                    + gjson.routes[0].legs[0].distance.text;
        },
        async: true
    });
}
// The search itself
function search() {

    var markers = [];
    var input = /** @type {HTMLInputElement} */(
            document.getElementById('search'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(
            /** @type {HTMLInputElement} */(input));
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }

        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: image,
                title: place.name,
                position: place.geometry.location
            });
            markers.push(marker);
            bounds.extend(place.geometry.location);
        }

        map.fitBounds(bounds);
    });
    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}
// Add a marker to the map and push to the array.
function addMarker(lat, location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    loc = location;
    markers.push(marker);
    var infowindow = new google.maps.InfoWindow({
        content: lat.formatted_address
    });
    infowindow.open(map, marker);
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    try {
        markers[0].setMap(null);
    }
    catch (err) {
    }
    markers = [];
}
// Request the JSON for the marker.
function marker() {
    google.maps.event.addListener(map, 'click', function(event) {
        $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + event.latLng.k + "," + event.latLng.B, function(result) {
            deleteMarkers();
            addMarker(result.results[0], event.latLng);
        });
    });
}
//Function for the initialization of the map.
function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var center = new google.maps.LatLng(45.943161, 24.966760000000022);
    //Options for the map
    var mapOptions = {
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        center: center,
        mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    directionsDisplay.setMap(map);
    //input autocomplet listeners
    autocomplete('pickup', 0);
    autocomplete('dropoff', 1);
    autocomplete('search');
    search();
    marker();
}

function validateEmail() {
    var sEmail = document.getElementById('email').value;
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (filter.test(sEmail)) {
        document.getElementById('emer').style.visibility = 'hidden';
        return true;
    }
    else {
        document.getElementById('emer').style.visibility = 'visible';
        return false;
    }
}

function validatePassword() {
    var pass = document.getElementById('pass').value;
    var filter = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (filter.test(pass)) {
        document.getElementById('pass1').style.visibility = 'hidden';
        return true;
    }
    else {
        document.getElementById('pass1').style.visibility = 'visible';
        return false;
    }
}

function req() {
    fn = $("#fName").val();
    ln = $("#lName").val();
    us = $("#user").val();
    if (fn != '' && ln != '' && us != '') {
        document.getElementById("err").style.visibility = 'hidden';
        return true;
    } else {
        document.getElementById("err").style.visibility = 'visible';
        return false;
    }
}

function sentData() {
    if (validateEmail() && req() && validatePassword())
        $.ajax({
            type: "POST",
            url: "form.php",
            data: "fName=" + document.getElementById('fName').value + "&lName=" + document.getElementById('lName').value + "&email=" + document.getElementById('email').value
        }).success(function(msg) {
            alert(msg);
        }).fail(function(xmlHttpRequest, statusText, errorThrown) {
            alert(
                    "Your form submission failed.\n\n"
                    + "XML Http Request: " + JSON.stringify(xmlHttpRequest)
                    + ",\nStatus Text: " + statusText
                    + ",\nError Thrown: " + errorThrown);
        });
    else {
        alert("Plese fix the errors on the form");
    }
}

function login() {
    if ($("#luser").val() != 0 && $("#lpass").val() != 0)
        $.ajax({
            type: "POST",
            url: "form.php",
            data: "user=" + document.getElementById('luser').value + "&pass=" + document.getElementById('lpass').value
        }).success(function(msg) {
            alert(msg);
        }).fail(function(xmlHttpRequest, statusText, errorThrown) {
            alert(
                    "Your form submission failed.\n\n"
                    + "XML Http Request: " + JSON.stringify(xmlHttpRequest)
                    + ",\nStatus Text: " + statusText
                    + ",\nError Thrown: " + errorThrown);
        });
    else {
        alert("Please enter a username and a \npassword before you can continue.");
    }
}