(function() {
    'use strict';

    var app = angular.module('app', ["chart.js", "zingchart-angularjs", "ngMaterial"]);

    app.controller('appController', function($scope, $http, $filter, $q) {
        $scope.tweet;
        $scope.allData = [];
        $scope.graph;
        $scope.page = 0;
        $scope.fromDate = new Date(2000, 2, 20);
        $scope.toDate = new Date(2016, 6, 20);

        $scope.loadNextPage = function() {
            $scope.currentPage = $scope.currentPage + 1;
            if (($scope.currentPage + 1) > ($scope.allData.length / $scope.pageSize)) {
                $scope.page = $scope.page + 1;
                $scope.getResult();
            }
        };

        /* used in pagination for page-size and active-page-number */
        $scope.currentPage = 0;
        $scope.pageSize = 10;

        /* list for storing the data and dictionary for storing fields and number of occurance*/
        $scope.location = [];
        var locationCount = {};

        /* list for storing the data and dictionary for storing fields and number of occurance*/
        $scope.days = [];
        var dayCount = {};

        /* list for storing the data and dictionary for storing fields and number of occurance*/
        $scope.dates = [];
        var dateCount = {};

        /* line graph json for days of weeks /..  */
        var dayLineGraphJson = {
            "series": ["SeriesA"],
            "data": [
                ["00", "00", "00", "00", "00", "00", "00"]
            ],
            "labels": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            "colours": [{
                "fillColor": "rgba(224, 108, 112, 1)",
                "strokeColor": "rgba(207,100,103,1)",
                "pointColor": "rgba(220,220,220,1)",
                "pointStrokeColor": "#fff",
                "pointHighlightFill": "#fff",
                "pointHighlightStroke": "rgba(151,187,205,0.8)"
            }]
        };

        /* line graph json for dates of month */
        var dateLineGraphJson = {
            "series": ["SeriesA"],
            "data": [
                ["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"]
            ],
            "labels": ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
            "colours": [{ // default
                "fillColor": "rgba(224, 108, 112, 1)",
                "strokeColor": "rgba(207,100,103,1)",
                "pointColor": "rgba(220,220,220,1)",
                "pointStrokeColor": "#fff",
                "pointHighlightFill": "#fff",
                "pointHighlightStroke": "rgba(151,187,205,0.8)"
            }]
        };
        /* pie-Graph ( circle ) json  */
        $scope.pieGraphJson = {
            type: "pie",
            backgroundColor: "#fff",
            tooltip: {
                text: "%v %text"
            },
            series: []
        };

        /* fetching all the tweets from view */
        $scope.getResult = function() {
            var deffered = $q.defer();
            $http.get('/api/v1/search/', {
                params: {
                    page: $scope.page
                }
            }).success(function(data) {
                angular.forEach(data, function(value, key) {
                    $scope.allData.push(value);
                    angular.forEach(value.user, function(value, key) {

                        /* extracting day and dates */
                        if (key == "created_at") {
                            var extract_day = new Date(value).getDay();
                            $scope.days.push(extract_day);
                            var extract_date = new Date(value).getDate();
                            $scope.dates.push(extract_date);
                        }
                        /* extracting location */
                        else if (key == "location") {
                            if (value) {
                                $scope.location.push(value);
                            }
                        }
                    });
                });

                /*count the occurance of fields and value (1:1 mapping) and update respective json */
                locationCount = $scope.countOccurance($scope.location);
                $scope.updatePieGraph(locationCount);

                dayCount = $scope.countOccurance($scope.days);
                $scope.updateLineGraph(dayCount, dayLineGraphJson);

                dateCount = $scope.countOccurance($scope.dates);
                $scope.updateLineGraph(dateCount, dateLineGraphJson);
            });

            deffered.resolve();
            return deffered.promise;
        };


        /* module for calculating the occurance of each type*/
        $scope.countOccurance = function(data) {
            var output = {};
            for (var i = 0; i < data.length; i++) {
                if (!output[data[i]])
                    output[data[i]] = 0;
                ++output[data[i]];
            }
            return output;
        };

        /* function for updating the json of line-graph */
        $scope.updateLineGraph = function(item, file) {
            Object.keys(item).forEach(function(key) {
                file.data[0][key] = String(item[key]);
            });
        };

        /* function for update the json of pie-graph( circle )*/
        $scope.updatePieGraph = function(result) {
            var i = 0;
            var color = ["#FA6E6E #FA9494", "#F1C795 #feebd2", "#FDAA97 #FC9B87", "#0D25D9 #6676ED",
                "#1CB028 #74F27F", "#DB23D8 #5C0B5A", "blue", "yellow", "brown", "black", "pink",
                "#f0f8ff", "#faebd7", "#ffefdb", "#8b8378", "#458b74", "#e0eeee", "#cdb79e", "#8a2be2"
            ];
            Object.keys(result).forEach(function(key) {
                var value = parseInt((result[key] * 360) / 200);
                var colorIndex = i % color.length;
                var data = {
                    text: key,
                    values: [value],
                    backgroundColor: color[colorIndex]
                };
                $scope.pieGraphJson['series'].push(data);
                i++;
            });
        };

        /* pagination for counting no of pages */
        $scope.numberOfPages = function() {
            return Math.ceil(($scope.getData().length) / $scope.pageSize);
        };

        /*used for finding the length of data in pagination*/
        $scope.getData = function() {
            return $filter('filter')($scope.allData, $scope.query)
        };

        /* decreasing order of date sorting*/
        $scope.decreasing_date = function(tweet) {
            var order = new Date(tweet.created_at);
            if (tweet.user) {
                order = new Date(tweet.user.created_at);
            }
            return order;
        };

        $scope.dateLine = dateLineGraphJson;
        $scope.dayLine = dayLineGraphJson;

    });


    /* for pagination */
    app.filter('startFrom', function() {
        return function(input, start) {
            if (!input || !input.length) {
                return;
            }
            start = +start; //parse to int
            return input.slice(start);
        }
    });

    /*custom date formatter */
    app.filter("asDate", function() {
        return function(input) {
            return new Date(input);
        }
    });

    /*date range filter in ng-repeat */
    app.filter('myfilter', function() {
        return function(records, from, to) {
            return records.filter(function(record) {
                var created_on = record.created_at;
                if (record.user) {
                    created_on = record.user.created_at;
                }
                var tweetDate = moment(new Date(created_on)).format('YYYY-MM-DD');
                var startDate = moment(from).format('YYYY-MM-DD');
                var endDate = moment(to).format('YYYY-MM-DD');
                return !(moment(tweetDate).isBefore(startDate)) && !(moment(tweetDate).isAfter(endDate));
            });
        }
    });

})();