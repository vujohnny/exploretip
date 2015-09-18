'use strict';

angular.module('exploretipApp')
    .controller('MainCtrl', function($scope, $http, socket, uiGmapGoogleMapApi) {
        $scope.awesomeThings = [];

        $http.get('/api/things').then(function(response) {
            $scope.awesomeThings = response.data;
            socket.syncUpdates('thing', $scope.awesomeThings);
        });

        $scope.addThing = function() {
            if ($scope.newThing === '') {
                return;
            }
            $http.post('/api/things', {
                name: $scope.newThing
            });
            $scope.newThing = '';
        };

        $scope.deleteThing = function(thing) {
            $http.delete('/api/things/' + thing._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('thing');
        });

        // accordion functions ======================================================
        $scope.oneAtATime = true;

        $scope.budget = {
            groupTitle: 'Budget',
            groupIcon: 'money',
            valueIcon: 'usd',
            defaultValue: '1000',
            slider: [{
                min: '50',
                max: '10000',
                step: '50'
            }]
        };

        $scope.where = {
            groupTitle: 'Where',
            groupIcon: 'globe',
            defaultValue: {
                'Tropical': true,
                'Forrest': true
            },
            categories: [{
                name: 'Tropical'
            }, {
                name: 'Snow'
            }, {
                name: 'Rain'
            }, {
                name: 'Forrest'
            }]
        };

        $scope.when = {
            groupTitle: 'When',
            groupIcon: 'calendar',
            defaultValue: new Date(),
            minDate: new Date() - 1,
            maxDate: new Date().setFullYear(new Date().getFullYear() + 2),
            showweeks: false,
            mode: "month"
        };

        $scope.showSelected = function(input) {
            //console.log(input)
            var object = [];
            for (var o in input) {
                if (input[o]) {
                    object.push(o);
                }
            }
            return object;
        };

        $scope.getCurrentValue = function() {
            console.log("inside getCurrentValue");
            console.log("inside getCurrentValue2");
            $http.post('/api/things', {
                name: $scope.budget.defaultValue + " " + $scope.showSelected($scope.where.defaultValue) + " " + $scope.when.defaultValue
            });
            $scope.newThing = '';
        };

        // End accordion functions ======================================================

        uiGmapGoogleMapApi.then(function(maps) {
	        
	        // google maps variables
	        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            	labelIndex = 0,
				infowindow = new google.maps.InfoWindow(),
				marker,
				locations = [],
				i;
				
			
			// init google map on view
            var map = new google.maps.Map(document.getElementById('googleMap'), {
                center: {
                    lat: 38.4740022,
                    lng: -95.426484
                },
                zoom: 3,
                scrollwheel: false,
                draggable: false,
                disableDefaultUI: true
            });
            
            
            // set markers from results on map
			var markersDisplay = function(lat, lng) {
				marker = new google.maps.Marker({
                                position: new google.maps.LatLng(lat, lng),
                                map: map,
                                label: labels[labelIndex++ % labels.length],
                                animation: google.maps.Animation.DROP
                            });
			}
			
			
			// remove all markers on map
			var markersRemove = function() {				
				marker.setMap(null);
				marker = [];
				console.log('markers removed');
			}
            

			// init autocomplete on input search
            var input = document.getElementById('searchTextField');
            var options = {types: ['(cities)']};
            var autocomplete = new google.maps.places.Autocomplete(input, options);


            // event handler for autocomplete change
            google.maps.event.addListener(autocomplete, 'place_changed', function() {

                
                // expedia hotel list call
                var place = autocomplete.getPlace(),
                	apiKey = '70303auc6h8hqutunreio3u8pl',
                    cid = '55505',
                    minorRev = '99',
                    locale = 'en_US',
                    curencyCode = 'USD',
                    destinationString = place.formatted_address,
                    arrivalDate = '10/10/2015',
                    departureDate = '10/20/2015',
                    room = '2'
                    
                    
				// get expedia results
                $.ajax({
                    type: 'GET',
                    url: 'http://api.ean.com/ean-services/rs/hotel/v3/list?locale=' + locale + '&destinationString=' + destinationString + '&apiKey=' + apiKey + '&minorRev=' + minorRev + '&departureDate=' + departureDate + '&room=' + room + '&arrivalDate=' + arrivalDate + '&curencyCode=' + curencyCode + '&cid=' + cid + '',
                    async: false,
                    contentType: "application/json",
                    dataType: 'jsonp',

                    success: function(data) {
						
                        
                        // loop through return
                        $.each(data.HotelListResponse.HotelList.HotelSummary, function(k, v) {
	                        //console.log(v);
	                        var averageRate = v.RoomRateDetailsList.RoomRateDetails.RateInfos.RateInfo.ChargeableRateInfo["@averageRate"];
	                        var totalRate = v.RoomRateDetailsList.RoomRateDetails.RateInfos.RateInfo.ChargeableRateInfo["@total"]; // this value includes the surcharge
                            locations.push([
	                            v.latitude, 
                            	v.longitude,
                            	v.name, 
                            	v.shortDescription, 
                            	v.thumbNailUrl,  
                            	v.tripAdvisorRating, 
                            	v.tripAdvisorRatingUrl,
                            	averageRate, 
                            	totalRate, 
                            	v.deepLink 
                            ]);
                        });
                        
                        
                        // build hotel template
                        for (i = 0; i < locations.length; i++) {
                            
                            
                            // set new makers on the map
                            markersDisplay(locations[i][0], locations[i][1]);
                            
                            // remove markers from the map
                            //markersRemove();

                            
                            // on marker click show hotel info
                            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                                return function() {
                                    infowindow.setContent("<img src=\"http://images.travelnow.com/"+locations[i][4]+"\" alt=\""+locations[i][2]+"\" class=\"hotelImg\"> <span class=\"hotelTitle\">"+locations[i][2]+"</span> <br>Average Nightly: $"+locations[i][7]+"<br> Total: $"+locations[i][8]+"<br><img src=\""+locations[i][6]+"\" class=\"tripAdvisorRating\">");
                                    infowindow.open(map, marker);
                                }
                            })(marker, i));
                            
                        }

                    },
					
					// if error on return display error
                    error: function(e) {console.log(e.message);}
                    
                });
                
                // autocomplete location pan map to that city
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                }
            }); 


        }); // end google maps sdk


        $scope.showSelected = function(input) {
            //console.log(input)
            var object = [];
            for (var o in input) {
                if (input[o]) {
                    object.push(o);
                }
            }
            return object;
        };


    });