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
            defaultValue: 1000,
            slider: [{
                min: 50,
                max: 10000,
                step: 25
            }]
        };

        $scope.where = {
            groupTitle: 'Where',
            groupIcon: 'globe',
            defaultValue: {
                'Tropical': true
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




		// google maps sdk ======================================================
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
			
			
			// remove markers from map
			var markersArray = [];
			
			function clearOverlays() {
				for (var i = 0; i < markersArray.length; i++ ) {
					markersArray[i].setMap(null);
				}
				markersArray.length = 0;
				$('.results').empty(); 
			}
			
			$("#removeIt").on( "click", function() {
				clearOverlays();
			});
			

			// init autocomplete on input search
            var input = document.getElementById('searchTextField');
            var options = {types: ['(cities)']};
            var autocomplete = new google.maps.places.Autocomplete(input, options);


			// expedia return ------------------------------------------------------------
			function expediaReturn() {
				
				// expedia required call parameters
                var place = autocomplete.getPlace(),
                	apiKey = '70303auc6h8hqutunreio3u8pl',
                    cid = '55505',
                    minorRev = '99',
                    locale = 'en_US',
                    curencyCode = 'USD',
                    adults = '2',
                    destinationString = place.formatted_address,
                    arrivalDate = '11/17/2015',
                    departureDate = '11/19/2015',
                    room = '2',
                    sort = 'PRICE', 
                    maxResults = '20';
                    
                $.ajax({
                    type: 'GET',
                    url: 'http://api.ean.com/ean-services/rs/hotel/v3/list?locale='+locale+'&destinationString='+destinationString+'&apiKey='+apiKey+'&minorRev='+minorRev+'&departureDate='+departureDate+'&room='+room+'&arrivalDate='+arrivalDate+'&curencyCode='+curencyCode+'&cid='+cid+'&numberOfResults='+maxResults+'&Room.numberOfAdults='+adults+'&sort='+sort+'',
                    async: false,
                    contentType: "application/json",
                    dataType: 'jsonp',

                    success: function(data) {
						
						console.log($scope.budget.defaultValue); 
						
                        $.each(data.HotelListResponse.HotelList.HotelSummary, function(k, v) {
	                        
	                        var averageRate = v.RoomRateDetailsList.RoomRateDetails.RateInfos.RateInfo.ChargeableRateInfo["@averageRate"];
	                        var totalRate = v.RoomRateDetailsList.RoomRateDetails.RateInfos.RateInfo.ChargeableRateInfo["@total"];
	                        
							locations.push({
	                            lat: v.latitude, 
                            	lng: v.longitude,
                            	hotelName: v.name, 
                            	hotelDescription: v.shortDescription, 
                            	hotelThumb: v.thumbNailUrl,  
                            	hotelRating: v.tripAdvisorRating, 
                            	hotelRatingImg: v.tripAdvisorRatingUrl,
                            	hotelRateAverage: averageRate, 
                            	hotelRateTotal: totalRate, 
                            	hotelLink: v.deepLink 
                            });
	                        
                        });
                        
                        
                        // build hotel template
                        for (i = 0; i < locations.length; i++) {
	                        
							if(locations[i].hotelRateTotal <= $scope.budget.defaultValue) {
								console.log(locations[i].hotelName, locations[i].hotelRateTotal);
	                        
		                        var hotelResults = "<img src=\"http://images.travelnow.com/"+locations[i].hotelThumb+"\" alt=\""+locations[i].hotelName+"\" class=\"hotelImg\"> <span class=\"hotelTitle\">"+locations[i].hotelName+"</span> <br>Average Nightly: $"+locations[i].hotelRateAverage+"<br> Total: $"+locations[i].hotelRateTotal+"<br><img src=\""+locations[i].hotelRatingImg+"\" class=\"tripAdvisorRating\"><br><button type=\"button\" class=\"btn btn-default\"><a href=\""+locations[i].hotelLink+"\" target=\"_blank\">Seek Deer <i class=\"fa fa-hand-peace-o\"></i></a></button><hr>";
	                                                        
	                                                        
	                            // set new makers on the map and side nav
	                            markersDisplay(locations[i].lat, locations[i].lng);
	                            markersArray.push(marker); // push into array to later remove markers
								$('.results').append(hotelResults);
								
								
	                            // on marker click show hotel info -- not needed for now
	                            google.maps.event.addListener(marker, 'click', (function(marker, i) {
	                                return function() {
	                                    infowindow.setContent("<img src=\"http://images.travelnow.com/"+locations[i].hotelThumb+"\" alt=\""+locations[i].hotelName+"\" class=\"hotelImg\"> <span class=\"hotelTitle\">"+locations[i].hotelName+"</span> <br>Average Nightly: $"+locations[i].hotelRateAverage+"<br> Total: $"+locations[i].hotelRateTotal+"<br><img src=\""+locations[i].hotelRatingImg+"\" class=\"tripAdvisorRating\"><br><button type=\"button\" class=\"btn btn-default\"><a href=\""+locations[i].hotelLink+"\" target=\"_blank\">Seek Deer <i class=\"fa fa-hand-peace-o\"></i></a></button><hr>"); 	                                    infowindow.open(map, marker);
	                                }
	                            })(marker, i));

							} else {
							  
							}
	                        
	                                                   
                                                        
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
			} // end expedia return ------------------------------------------------------------
			

            // event handler for autocomplete change
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
	            
	            expediaReturn();
	            $scope.getCurrentValue();
                
            }); 


        }); // end google maps sdk ======================================================




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