var CMSJobStatus = function(app_name, options) {
    var app = this;

    this.Configuration = {
        locale: 'en',
        status_url: "https://lcgsens01o.jinr.ru/rest/CMSJobStatus/lastStatus?delta=1",
    };

    this.Utils = {
        getDuration: function(time) {
            var now = new Date().getTime();
            var error_time = new Date(time);
            return moment.duration(now - error_time).humanize();
        },
    };

    this.Model = {
        jobStatus: null,
        sites: null,
        options: ['application_failed','app_succeeded','site_failed','aborted','cancelled'],
        options_data: {
            'application_failed': {'color': 'pink', 'caption': 'App-failed'},
            'app_succeeded': {'color':'green', 'caption': 'Success'},
            'site_failed': {'color':'red', 'caption': 'Site-failed'},
            'aborted': {'color':'blue', 'caption': 'Aborted'},
            'cancelled': {'color':'black', 'caption': 'Cancelled'}
        },

        setJobStatus: function(response) {
            var data = response.data;
            var sites_summary = {};
            for (var i=0; i<data.length; i++){
                if (!(data[i].site_name in sites_summary)) {
                    sites_summary[data[i].site_name] = {};
                    for (var j=0; j<this.options.length; j++){
                        sites_summary[data[i].site_name][this.options[j]] = 0;
                    }
                }
                for (var j=0; j<this.options.length; j++){
                    sites_summary[data[i].site_name][this.options[j]] += data[i][this.options[j]];
                }            
            }
            
            this.sites = [];
            for (var site in sites_summary) {
                this.sites.push(site);
            }

            var series = [];
            for (var i=0;i<this.options.length; i++){
                var seria = {};
                seria.name = this.options_data[this.options[i]].caption;
                seria.color = this.options_data[this.options[i]].color;
                seria.data = [];
                for (var j=0; j<this.sites.length; j++){
                    seria.data.push(sites_summary[this.sites[j]][this.options[i]]);
                }
                series.push(seria);
            }
            this.jobStatus = series;
        },
    };
    //============================================================================
    //    VIEW
    //============================================================================
    this.View = {
        chart_holder_id: null,
        chart: null,
        isChartDrawn: false,
        currentSites: [],


        initialize: function(appHolderId) {
            this.chart_holder_id = appHolderId;
        },

        drawFromScratch: function (data, names) {
            this.isChartDrawn = true;
            this.currentSites = names;
            this.chart = Highcharts.chart(this.chart_holder_id.substr(1), {
                chart: {
                    type: 'bar',
                    pointWidth: 20
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: names,
                    labels: {
                formatter: function () {
                    if ('T1_RU_JINR' === this.value) {
                        return '<span style="color: red;font-weight: bold;">' + this.value + '</span>';
                    } else {
                        return this.value;
                    }
                }
            }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    }
                },
                tooltip: {
                    shared: true
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        pointPadding: 0.1, // Defaults to 0.1
                        groupPadding: 0,
                        borderWidth: 0
                    }
                },
                series: data
            });
            this.chart = $(this.chart_holder_id).highcharts();
        },

        fillStatusTableWithData: function() {
            var data = app.Controller.getJobStatusData();
            var sites = app.Controller.getSiteNames();
            if ((!this.isChartDrawn)||(JSON.stringify(sites)!=JSON.stringify(this.currentSites))){
                console.log(sites);
                console.log(this.currentSites);
                this.drawFromScratch(data, sites);                
            }
            else {
                for (var i in data){
                    this.chart.series[i].setData(data[i].data, true);
                }
            }
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
                url: app.Configuration.status_url,
                success: function(data) {
                    app.Model.setJobStatus(data);
                    app.View.fillStatusTableWithData();
                }
            });
            setTimeout(app.Controller.loadStatus, 10000);
        },        

        getJobStatusData: function (site_name) {
            return app.Model.jobStatus;
        },
        getSiteNames: function (site_name) {
            return app.Model.sites;
        },
    };
    app.Controller.startApp(app_name);
};
// var CMSJobStatus = {

//     Configuration: {
//         locale: 'en',
//         status_url: "https://lcgsens01o.jinr.ru/rest/CMSJobStatus/lastStatus?delta=1",
//     },

//     Utils: {
//         getDuration: function(time) {
//             var now = new Date().getTime();
//             var error_time = new Date(time);
//             return moment.duration(now - error_time).humanize();
//         },
//     },

//     Model: {
//         jobStatus: null,
//         sites: [],
//         options: ['application_failed','app_succeeded','site_failed','aborted','cancelled'],
//         options_data: {
//             'application_failed': {'color': 'pink', 'caption': 'App-failed'},
//             'app_succeeded': {'color':'green', 'caption': 'Success'},
//             'site_failed': {'color':'red', 'caption': 'Site-failed'},
//             'aborted': {'color':'blue', 'caption': 'Aborted'},
//             'cancelled': {'color':'black', 'caption': 'Cancelled'}
//         },

//         setJobStatus: function(response) {
//             var data = response.data;
//             console.log(data);
//             var sites_summary = {};
//             for (var i=0; i<data.length; i++){
//                 if (!(data[i].site_name in sites_summary)) {
//                     sites_summary[data[i].site_name] = {};
//                     for (var j=0; j<this.options.length; j++){
//                         sites_summary[data[i].site_name][this.options[j]] = 0;
//                     }
//                 }
//                 for (var j=0; j<this.options.length; j++){
//                     sites_summary[data[i].site_name][this.options[j]] += data[i][this.options[j]];
//                 }            
//             }

//             for (var site in sites_summary) this.sites.push(site);
//             this.sites = this.sites.sort();
//             console.log(this.sites);

//             var series = [];
//             for (var i=0;i<this.options.length; i++){
//                 var seria = {};
//                 seria.name = this.options_data[this.options[i]].caption;
//                 seria.color = this.options_data[this.options[i]].color;
//                 seria.data = [];
//                 for (var j=0; j<this.sites.length; j++){
//                     seria.data.push(sites_summary[this.sites[j]][this.options[i]]);
//                 }
//                 series.push(seria);
//             }
//             console.log(series);
//             this.jobStatus = series;
//         },
//     },
//     //============================================================================
//     //    VIEW
//     //============================================================================
//     View: {
//         chart_holder_id: null,
//         chart: null,

//         initialize: function(appHolderId) {
//             this.chart_holder_id = appHolderId;
//         },

//         fillStatusTableWithData: function() {
//             var data = CMSJobStatus.Controller.getJobStatusData();
//             var names = CMSJobStatus.Controller.getSiteNames();

//             $(this.chart_holder_id).highcharts({
//                 chart: {
//                     type: 'bar',
//                     pointWidth: 20
//                 },
//                 credits: {
//                     enabled: false
//                 },
//                 title: {
//                     text: ''
//                 },
//                 xAxis: {
//                     categories: names,
//                     labels: {
//                 formatter: function () {
//                     if ('T1_RU_JINR' === this.value) {
//                         return '<span style="color: red;font-weight: bold;">' + this.value + '</span>';
//                     } else {
//                         return this.value;
//                     }
//                 }
//             }
//                 },
//                 yAxis: {
//                     min: 0,
//                     title: {
//                         text: ''
//                     }
//                 },
//                 tooltip: {
//                     shared: true
//                 },
//                 legend: {
//                     reversed: true
//                 },
//                 plotOptions: {
//                     series: {
//                         stacking: 'normal',
//                         pointPadding: 0.1, // Defaults to 0.1
//                         groupPadding: 0,
//                         borderWidth: 0
//                     }
//                 },
//                 series: data
//             });
//         }
//     },
//     //============================================================================
//     //    CONTROLLER

//     //============================================================================
//     Controller: {
//         app_name: '',

//         startApp: function(app_name) {
//             this.app_name = app_name;
//             CMSJobStatus.View.initialize('#' + app_name + '_AppHolder');
//             CMSJobStatus.Controller.loadStatus();
//         },
//         // TODO: on Fail
//         loadStatus: function() {
//             $.ajax({
//                 url:CMSJobStatus.Configuration.status_url,  
//                 success: function(data) {
//                    CMSJobStatus.Model.setJobStatus(data);
//                    CMSJobStatus.View.fillStatusTableWithData();
//                    setTimeout(CMSJobStatus.Controller.loadStatus, 600000);
//                 }
//             });
//         },        

//         getJobStatusData: function (site_name) {
//             return CMSJobStatus.Model.jobStatus;
//         },
//         getSiteNames: function (site_name) {
//             return CMSJobStatus.Model.sites;
//         },
//     },
//     startApp: function(app_name) {
//        CMSJobStatus.Controller.startApp(app_name);
//     }
// };