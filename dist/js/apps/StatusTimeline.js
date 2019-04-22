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
        min_time: null,
        max_time: null,

        setStatus: function(rest_data) {            
            var event_log = rest_data.data;
            if (event_log.length == 0){
                return 0;
            }
            
            this.data = rest_data.data;

            // Get all possible status names
            var statuses = new Set([]);
            for (var i = 0; i<this.data.length; i++) {
                var status_name = this.data[i].module + ':' + this.data[i].name.split(":")[0]
                statuses.add(status_name);
            }
            console.log(statuses);

            //Form dict with statuses names
            var dict = {};
            statuses.forEach(function(element) { dict[element] = []} );
            console.log(dict);

            // Fill the dict
            for (var i = 0; i<this.data.length; i++) {
                var status_name = this.data[i].module + ':' + this.data[i].name.split(":")[0]
                var state_start = this.data[i].time;
                var state = this.data[i].name.split('->')[1];
                var text = this.data[i].description;
                var temp = {
                    "state_start": state_start,
                    "state": state,
                    "text": text
                };
                dict[status_name].push(temp);
            }
            console.log(dict);

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
            $(this.app_holder_id).append('<div id="status_timeline"  style="widht:100%; height: 500px;"></div>');
        },

        fillStatusTableWithData: function() {
            console.log(app.Model.data);
            var chart = AmCharts.makeChart( "status_timeline", {
              "type": "gantt",
              "theme": "light",
              "marginRight": 70,
              "period": "DD",
              "dataDateFormat": "YYYY-MM-DD HH:mm:ss",
              "columnWidth": 0.5,
              "valueAxis": {
                "type": "date"
              },
              "brightnessStep": 0,
              "graph": {
                "fillAlphas": 1,
                "lineAlpha": 1,
                "lineColor": "#fff",
                "fillAlphas": 0.85,
                "balloonText": "<b>[[task]]</b>:<br />[[open]] -- [[value]]"
              },
              "rotate": true,
              "categoryField": "category",
              "segmentsField": "segments",
              "colorField": "color",
              "startDateField": "start",
              "endDateField": "end",
              "dataProvider": [ {
                "category": "Module #1",
                "segments": [ {
                  "start": "2016-01-01 08:00:00",
                  "end": "2016-01-01 10:00:00",
                  "color": "#b90000",
                  "task": "Gathering requirements"
                }, {
                  "start": "2016-01-01 10:00:00",
                  "end": "2016-01-01 16:00:00",
                  "color": "#00b900",
                  "task": "Producing specifications"
                }, {
                  "start": "2016-01-01 16:00:00",
                  "end": "2016-01-02 01:00:00",
                  "color": "#b90000",
                  "task": "Development"
                }, {
                  "start": "2016-01-02 01:00:00",
                  "end": "2016-01-02 10:00:00",
                  "color": "#0000b9",
                  "task": "Testing and QA"
                } ]
              }, {
                "category": "Module #2",
                "segments": [ {
                  "start": "2016-01-01 08:00:00",
                  "end": "2016-01-01 10:00:00",
                  "color": "#00b900",
                  "task": "Gathering requirements"
                }, {
                  "start": "2016-01-01 10:00:00",
                  "end": "2016-01-01 16:00:00",
                  "color": "#00b900",
                  "task": "Producing specifications"
                }, {
                  "start": "2016-01-01 16:00:00",
                  "end": "2016-01-02 01:00:00",
                  "color": "#b90000",
                  "task": "Development"
                }, {
                  "start": "2016-01-02 01:00:00",
                  "end": "2016-01-02 10:00:00",
                  "color": "#0000b9",
                  "task": "Testing and QA"
                } ]
              }, {
                "category": "Module #3",
                "segments": [ {
                  "start": "2016-01-01 08:00:00",
                  "end": "2016-01-01 10:00:00",
                  "color": "#b90000",
                  "task": "Gathering requirements"
                }, {
                  "start": "2016-01-01 10:00:00",
                  "end": "2016-01-01 16:00:00",
                  "color": "#00b900",
                  "task": "Producing specifications"
                }, {
                  "start": "2016-01-01 16:00:00",
                  "end": "2016-01-02 01:00:00",
                  "color": "#b90000",
                  "task": "Development"
                }, {
                  "start": "2016-01-02 01:00:00",
                  "end": "2016-01-02 10:00:00",
                  "color": "#0000b9",
                  "task": "Testing and QA"
                } ]
              }, {
                "category": "Module #4",
                "segments": [ {
                  "start": "2016-01-01 08:00:00",
                  "end": "2016-01-01 10:00:00",
                  "color": "#00b900",
                  "task": "Gathering requirements"
                }, {
                  "start": "2016-01-01 10:00:00",
                  "end": "2016-01-01 16:00:00",
                  "color": "#00b900",
                  "task": "Producing specifications"
                }, {
                  "start": "2016-01-01 16:00:00",
                  "end": "2016-01-02 01:00:00",
                  "color": "#b90000",
                  "task": "Development"
                }, {
                  "start": "2016-01-02 01:00:00",
                  "end": "2016-01-02 10:00:00",
                  "color": "#0000b9",
                  "task": "Testing and QA"
                } ]
              }, {
                "category": "Module #5",
                "segments": [ {
                  "start": "2016-01-01 08:00:00",
                  "end": "2016-01-01 10:00:00",
                  "color": "#0000b9",
                  "task": "Gathering requirements"
                }, {
                  "start": "2016-01-01 10:00:00",
                  "end": "2016-01-01 16:00:00",
                  "color": "#00b900",
                  "task": "Producing specifications"
                }, {
                  "start": "2016-01-01 16:00:00",
                  "end": "2016-01-02 01:00:00",
                  "color": "#b90000",
                  "task": "Development"
                }, {
                  "start": "2016-01-02 01:00:00",
                  "end": "2016-01-02 10:00:00",
                  "color": "#0000b9",
                  "task": "Testing and QA"
                } ]
              } ],
              "valueScrollbar": {
                "autoGridCount": true
              },
              "chartCursor": {
                "cursorColor": "#55bb76",
                "valueBalloonsEnabled": false,
                "cursorAlpha": 0,
                "valueLineAlpha": 0.5,
                "valueLineBalloonEnabled": true,
                "valueLineEnabled": true,
                "zoomable": false,
                "valueZoomable": true
              },
              "export": {
                "enabled": true
              }
            } );
        },       
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
