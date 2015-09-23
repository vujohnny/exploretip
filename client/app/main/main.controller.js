'use strict';

angular.module('exploretipApp')
    .controller('MainCtrl', function($scope, $http, socket, uiGmapGoogleMapApi, $filter) {
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
                name: 'Snowy'
            }, {
                name: 'Romantic'
            }, {
                name: 'Party'
            }, {
                name: 'City'
            }]
        };

        $scope.when = {
            groupTitle: 'When',
            groupIcon: 'calendar',
        };
        
        $scope.arriveDate = {
	       	defaultValue: new Date(),
            minDate: new Date() - 1,
            maxDate: new Date().setFullYear(new Date().getFullYear() + 2),
            showweeks: false,
            mode: "month"
        }
        
        $scope.departDate = {
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


		// submit button && expedia api call
        $scope.getCurrentValue = function() {
            //console.log("inside getCurrentValue");
            //console.log("inside getCurrentValue2");
            $http.post('/api/things', {
                name: "$"+$scope.budget.defaultValue+" | "+$scope.showSelected($scope.where.defaultValue)+" | "+$scope.calendarArrive+" - "+$scope.calendarDepart+" | "+$scope.specificLocation
            });
            $scope.newThing = '';
            
            $scope.expediaReturn($scope.specificLocation); 
        };
        
        
        // watch functions for budget && calendar && where
		$scope.$watch("budget.defaultValue", function(){
			console.log($scope.budget.defaultValue);
		});
		
		$scope.$watch("arriveDate.defaultValue", function(){
			$scope.calendarArrive = $filter('date')($scope.arriveDate.defaultValue, 'MM/dd/yyyy');
			console.log("From: " + $scope.calendarArrive);
		});
		
		$scope.$watch("departDate.defaultValue", function(){
			$scope.calendarDepart = $filter('date')($scope.departDate.defaultValue, 'MM/dd/yyyy');
			console.log("To: " + $scope.calendarDepart);
		});
		
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


        // End accordion functions ======================================================




		// google maps sdk ======================================================
        uiGmapGoogleMapApi.then(function(maps) {
	        
	        
	        // google maps variables
	        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            	labelIndex = 0,
				infowindow = new google.maps.InfoWindow(),
				marker,
				markersArray = [],
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
			$scope.markersDisplay = function(lat, lng) {
				marker = new google.maps.Marker({
                    position: {lat, lng},
                    map: map,
                    label: labels[labelIndex++ % labels.length],
                    animation: google.maps.Animation.DROP
                });
                markersArray.push(marker);
			}
			
			// google recommended way to remove markers, 3 functions below
			$scope.setMapOnAll = function(map) {
			  for (var i = 0; i < markersArray.length; i++) {
			    markersArray[i].setMap(map);
			  }
			}
			$scope.clearMarkers = function() {
			  $scope.setMapOnAll(null);
			}
			$scope.deleteMarkers = function() {
			  $scope.clearMarkers();
			  markersArray = [];
			  $('.results').empty(); 
			}
			

			// init autocomplete on input search
            var input = document.getElementById('searchTextField');
            var options = {types: ['(cities)']};
            var autocomplete = new google.maps.places.Autocomplete(input, options);


			// move map to city and call expedia api
			$scope.panMap = function(specificLocation) {
				var place = autocomplete.getPlace();
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                }
			}
			
			
			// expedia return ------------------------------------------
			$scope.expediaReturn = function(specificLocation) {
				
				// expedia required call parameters
                var place = autocomplete.getPlace(),
                	apiKey = '70303auc6h8hqutunreio3u8pl',
                    cid = '55505',
                    minorRev = '99',
                    locale = 'en_US',
                    curencyCode = 'USD',
                    adults = '2',
                    destinationString = specificLocation,
                    arrivalDate = $scope.calendarArrive,
                    departureDate = $scope.calendarDepart,
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
	                        
							if(locations[i].hotelRateTotal < $scope.budget.defaultValue) {
								
								//console.log($scope.budget.defaultValue, locations[i].hotelName, locations[i].hotelRateTotal);
	                        
		                        var hotelResults = "<img src=\"http://images.travelnow.com/"+locations[i].hotelThumb+"\" alt=\""+locations[i].hotelName+"\" class=\"hotelImg\"> <span class=\"hotelTitle\">"+locations[i].hotelName+"</span> <br>Average Nightly: $"+locations[i].hotelRateAverage+"<br> Total: $"+locations[i].hotelRateTotal+"<br><img src=\""+locations[i].hotelRatingImg+"\" class=\"tripAdvisorRating\"><br><button type=\"button\" class=\"bookLink btn btn-primary\"><a href=\""+locations[i].hotelLink+"\" target=\"_blank\">Seek Deer <i class=\"fa fa-hand-peace-o\"></i></a></button><hr>";
	                                                        
	                                                        
	                            // set new makers on the map and side nav
	                            $scope.markersDisplay(locations[i].lat, locations[i].lng);
								$('.results').append(hotelResults);
								
								
	                            // on marker click show hotel info
	                            google.maps.event.addListener(marker, 'click', (function(marker, i) {
	                                return function() {
	                                    infowindow.setContent("<img src=\"http://images.travelnow.com/"+locations[i].hotelThumb+"\" alt=\""+locations[i].hotelName+"\" class=\"hotelImg\"> <span class=\"hotelTitle\">"+locations[i].hotelName+"</span> <br>Average Nightly: $"+locations[i].hotelRateAverage+"<br> Total: $"+locations[i].hotelRateTotal+"<br><img src=\""+locations[i].hotelRatingImg+"\" class=\"tripAdvisorRating\"><br><button type=\"button\" class=\"bookLink btn btn-primary\"><a href=\""+locations[i].hotelLink+"\" target=\"_blank\">Seek Deer <i class=\"fa fa-hand-peace-o\"></i></a></button><hr>"); 	
	                                    // ^^^ tried using var hotelResults from #212 but that only showed the first return
	                                                                        
	                                    infowindow.open(map, marker);
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
			} 

            // end expedia return --------------------------------------
            
			
            // event handler for autocomplete change
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
	            $scope.specificLocation = autocomplete.getPlace().formatted_address;
	            $scope.panMap();
            }); 


        }); 
        // end google maps sdk ======================================================



    });