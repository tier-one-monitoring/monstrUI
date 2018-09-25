var PhedexQuality = function(app_name, options) {
    var app = this;

    this.Configuration = {
        locale: 'en',
        phedex_quality_url: "https://t1services.jinr.ru/rest/PhedexQuality/lastStatus",
        module_status_url: "https://t1services.jinr.ru/rest/PhedexQuality/getModuleStatus",
        options: {},
    };

    this.Utils = {
        getFileSizeUnits: function(bytes){
            if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
            else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
            else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
            else if (bytes>1)           {bytes=bytes+' bytes';}
            else if (bytes==1)          {bytes=bytes+' byte';}
            else                        {bytes='0 byte';}
            return bytes;
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
        }
    };

    this.Model = {
        phedex_quality: [],

        setPhedexQuality: function(data) {
            this.phedex_quality = data;
            var sites = new Set();

            for (var i = 0; i < data.length; i++) 
                sites.add(data[i].site);
            sites = Array.from(sites).sort();

            for (i = 0; i < this.phedex_quality.length; i++) {
                var site = this.phedex_quality[i].site;
                var done_files = this.phedex_quality[i].done_files;
                var fail_files = this.phedex_quality[i].fail_files;
                var value = null;

                if (done_files + fail_files !== 0)
                  value = done_files * 1.0 / (done_files + fail_files);
                var epoch_time = new Date(this.phedex_quality[i].time).getTime();

                this.phedex_quality[i].x = sites.indexOf(site);
                this.phedex_quality[i].y = epoch_time;
                this.phedex_quality[i].value = value;
                this.phedex_quality[i].name = site;
            }
        },
    };

    this.View = {
        quality_map: null,

        createPhedexQualityPlots: function(holder_id, quality_data) {
            console.log(holder_id);
            this.quality_map = $(holder_id).highcharts({
                chart: {
                    type: 'heatmap',
                    inverted: true,
                },
                credits: {
                    enabled: false
                },
                //title: { text: 'Phedex Quality Plots' },
                title: { text: '' },
                xAxis: {
                    type: 'category',
                    opposite: true
                },
                yAxis: {
                    type: 'datetime',
                    title: { text: '' },
                    plotLines: [{
                        value: (new Date()).getTime(),
                        color: '#222222',
                        width: 1,
                        zIndex: 0
                    }],
                },                

                colorAxis: {
                    stops: [
                        [0, '#ff0000'],
                        [0.5, '#ffff00'],
                        [1, '#00ff00']
                    ],
                    min: 0,
                    max: 1,
                    startOnTick: false,
                    endOnTick: false,
                },
                legend: {
                    enabled: false
                },
                series: [{
                    rowsize: 3600000, // one hour
                    data: quality_data,
                    turboThreshold: 100000000,
                    borderWidth: 0.1,
                    borderColor: '#000000',
                    tooltip: {
                        headerFormat: '<b>{point.key}</b><br/>',
                        pointFormatter: function () {
                            var result = Highcharts.dateFormat('%e %B %H:%M',this.y) + '<br/>' +
                                   'Quality: <b>' + this.value.toFixed(2)*100 + '%</b><br/>' +
                                   'Done files: ' + this.done_files + '<br/>' +
                                   'Failed files: ' + this.fail_files + '<br/>' +
                                   'Done bytes: ' + app.Utils.getFileSizeUnits(this.done_bytes) + '<br/>' +
                                   'Fail bytes: ' + app.Utils.getFileSizeUnits(this.fail_bytes) + '<br/>';
                            return result;
                        }
                    },
                },]
            });
        }
    };

    this.Controller = {
        app_name: null,

        startApp: function(app_name) {
            this.app_name = app_name;
            this.loadStatus();
        },

        loadStatus: function() {
            var that = this;

            app_ajax_call({
                app_name: app.Controller.app_name,
                url: app.Utils.createURL(app.Configuration.phedex_quality_url, app.Configuration.options),
                success: function(data) {
                    app.Model.setPhedexQuality(data.data);
                    app.View.createPhedexQualityPlots('#' + app.Controller.app_name + '_AppHolder', app.Model.phedex_quality);
                }
            });

            get_status_ajax_call({
                app_name: app.Controller.app_name,
                url: app.Utils.createURL(app.Configuration.module_status_url, app.Configuration.options),
                filter_options: options,
                filter: function(data) {
                    var result = [];
                    console.log(this.filter_options);
                    for (var i =0; i < data.length; i++){
                        var name = data[i].name.toLowerCase();
                        if ((name.indexOf(this.filter_options.instance) !== -1) && (name.indexOf(this.filter_options.direction) !== -1)) {
                            result.push(data[i]);
                        }
                    }
                    return result;
                }
            });
            setTimeout(app.Controller.loadStatus, 600000);

        }
    };

    options = JSON.parse(options);
    app.Configuration.options = options;
    app.Controller.startApp(app_name);

};
