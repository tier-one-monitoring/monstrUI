var StatusTimeline = function(app_name, options) {
    var app = this;

    this.Configuration = {
        locale: 'en',
        status_url: "https://t1services.jinr.ru/rest/MonstrStatusTimeline/getEventsLog",
    };

    this.Utils ={
        getDuration: function(time) {
            var now = new Date().getTime();
            var error_time = new Date(time);
            return moment.duration(now - error_time).humanize();
        },
        createURL: function(base_url, options) {
            base_url += '?';
            for (var option in options) {
                base_url += option;
                base_url += '=';
                base_url += options[option];
                base_url += '&';
            }
            return base_url;
        },
    };

    this.Model = {
        data: [],
        detailed_series: null,
        modules: {},
        colors_map: {
            0: "rgb(127,127,127)",
            10: "rgb(60, 180, 75)",
            20: "rgb(156, 243, 18)",
            30: "rgb(255, 255, 0)",
            40: "rgb(243, 156, 18)",
            50: "rgb(255, 0, 0)"
        },

        setStatus: function(rest_data) {            
            var event_log = rest_data.data;
            if (event_log.length == 0){
                return 0;
            }
            
            this.data = rest_data.data;

            // Fill the object containing module:state
            for (var i = 0; i<this.data.length; i++) {
                var module = this.data[i].module;
                var state = this.data[i].state;
                if (!(module in this.modules)) this.modules[module] = new Set([]);
                this.modules[module].add(state);
            }

            //Form dict with statuses names
            var dict = {};
            console.log(dict);
            
            function compare( a, b ) {
                if ( a.state_start < b.state_start ){
                    return -1;
                }
                if ( a.state_start > b.state_start ){
                    return 1;
                }
                return 0;
            }


            // Fill the dict
            for (var i = 0; i<this.data.length; i++) {
                var module = this.data[i].module;
                var state = this.data[i].state;
                var category_name = module + ':' + state;
                var state_start = this.data[i].time;
                var text = this.data[i].description;
                var severity = this.data[i].severity
                var temp = {
                    "module": module,
                    "state": state,
                    "category": module + ':' + status_name,
                    "state_start": moment(state_start),
                    "state_start_str": state_start,
                    "text": text,
                    "severity": severity
                };
                if (!(category_name in dict)) { dict[category_name] = []; }
                dict[category_name].push(temp);
            }
            // Prepare data for highcharts
            // We need data of the following form
            // {
            //   name: "SSB:sam3_ce",
            //   color: "red",
            //   description: "SAM3 CE: is OK",
            //   low: 1555882213538,
            //   high: 1555896614195,
            // }
            // Sort the elements of every module:status in order to create intervals
            this.detailed_series = {};
            this.categories = [];
            this.data_series = [];
            for (var status_name in dict) {
                dict[status_name].push({
                    'module': dict[status_name][0].module,
                    'status_name': status_name,
                    'state_start': moment(),
                    'text': 'Artificial state of current moment',
                    'severity': 0                     
                })
                dict[status_name].sort(compare);
                this.categories.push(status_name);
                for (var i = 0; i<dict[status_name].length - 1; i++) {
                    var start_time = dict[status_name][i].state_start;
                    var module = dict[status_name][i].module;
                    var status_name = status_name;
                    var text = dict[status_name][i].text;
                    var color = this.colors_map[dict[status_name][i].severity];
                    var stop_time = dict[status_name][i + 1].state_start;

                    var data_point = {
                        'low': start_time.valueOf(),
                        'high': stop_time.valueOf(),
                        'name': status_name,
                        'module': module,
                        'text': text,
                        'color': color,
                        'severity': dict[status_name][i].severity
                    };
                    if (!(module in this.detailed_series)) { this.detailed_series[module] = []; }
                    this.detailed_series[module].push(data_point);
                }
            }
            for (var module in this.detailed_series) {
                this.data_series.push({'name': module, 'data': this.detailed_series[module]});
            }
            
        },
    };
    //============================================================================
    //    VIEW
    //============================================================================
    this.View = {
        app_holder_id: null,
        datatable: null,

        initialize: function(appHolderId) {
            this.app_holder_id = appHolderId;
            $(this.app_holder_id).append('<div id="status_timeline" style="widht:100%;"></div>');
        },

        fillStatusTableWithData: function() {
            console.log(app.Model.categories);
            console.log(app.Model.data_series);
            var plotLines = [];
            var current_line = -0.5;
            for (var i in app.Model.modules) {
                 current_line = app.Model.modules[i].size + current_line;
                 plotLines.push({
                     color: 'black',
                     width: 1,
                     value: current_line,
                 });
            }
            console.log(plotLines);

            this.options = {
                chart: {
                    type: 'columnrange',
                    height: app.Model.categories.length * 30,
                    inverted: true,
                    marginTop: 0,
                    zoomType: 'y',
                    animation: false
                },
             
                title:{
                    text: null
                },
             
                plotOptions: {
                    series: {
                        states: {
                            inactive: {
                                opacity: 1
                            }
                        }
                    },
                    columnrange: {
                        groupPadding: 0.5,
                        pointPadding: 0,
                        animation: false,
                        borderWidth: 0,
                    },
                },
                legend: {
                    enabled: false
                },

                xAxis: {
                     type: "category",
                     categories: app.Model.categories,
                     plotLines: plotLines,
                },
             
                yAxis: {
                    type: 'datetime',
                    //tickInterval: 1000 * 60 * 60 * 4, // 4 hours
                    gridLineWidth: 1,
                    gridZIndex: 4,
                    gridLineColor: 'black',
                },
             
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.point.name + '</b>:<br>' +
                        'Time interval <b>' + moment(this.point.low).format() +
                        '</b> is <b>' + moment(this.point.high).format() + '</b><br>' + this.point.severity + '<br>' +
                        'Info: '+ this.point.text;
                    }
                },
             
                legend: {
                    enabled: false
                },
             
                series: app.Model.data_series
            };
            
            
            var chart = $('#status_timeline').highcharts(this.options, function(chart) {
                         var height = chart.xAxis[0].height;
                         var pointRange = chart.series[0].data[1].x - chart.series[0].data[0].x;
                         pointRange = 1;
                         var max = chart.xAxis[0].max;
                         var min = chart.xAxis[0].min;
                         var pointCount = (max - min) / pointRange;
                         var colWidth = height / (pointCount + 1) - 5;
                         console.log(pointRange);
                         console.log(colWidth);
                         this.options.plotOptions.columnrange.pointWidth = colWidth;
                         var chart = $('#status_timeline').highcharts(this.options).highcharts();
            }).highcharts();
        }       
    };
    //============================================================================
    //    CONTROLLER

    //============================================================================
    this.Controller = {
        app_name: '',

        startApp: function(app_name) {
            this.app_name = app_name;
            app.View.initialize('#' + app_name + '_AppHolder');
            app.Controller.loadStatus();
        },
        // TODO: on Fail
        loadStatus: function() {
            var that = this;

            app_ajax_call({
                app_name: app.Controller.app_name,
                url: app.Utils.createURL(app.Configuration.status_url, app.Configuration.options),
                success: function(data) {
                    app.Model.setStatus(data);
                    app.View.fillStatusTableWithData();
                }
            });
            setTimeout(app.Controller.loadStatus, 60000);
        },        

        getStatusData: function() {
            return app.Model.data;
        },
    };

    app.Configuration.options = JSON.parse(options);
    app.Controller.startApp(app_name);
};

