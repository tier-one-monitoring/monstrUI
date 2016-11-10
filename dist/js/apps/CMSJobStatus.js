var CMSJobStatus = {

    Configuration: {
        locale: 'en',
        ssb_status_url: "https://lcgsens01o.jinr.ru/rest/CMSJobStatus/lastStatus?delta=1",
    },

    Utils: {
        getDuration: function(time) {
            var now = new Date().getTime();
            var error_time = new Date(time);
            return moment.duration(now - error_time).humanize();
        },
    },

    Model: {
        jobStatus: null,
        sites: [],
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
            console.log(data);
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

            for (var site in sites_summary) this.sites.push(site);
            this.sites = this.sites.sort();
            console.log(this.sites);

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
            console.log(series);
            this.jobStatus = series;
        },
    },
    //============================================================================
    //    VIEW
    //============================================================================
    View: {
        status_table_id: null,
        chart: null,

        initialize: function(appHolderId) {
            this.status_table_id = appHolderId;


        },

        fillStatusTableWithData: function() {
            var data = CMSJobStatus.Controller.getJobStatusData();
            var names = CMSJobStatus.Controller.getSiteNames();

            $(this.status_table_id).highcharts({
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
        }
    },
    //============================================================================
    //    CONTROLLER

    //============================================================================
    Controller: {
        appHolderId: '',

        startApp: function(appHolderId) {
            this.appHolderId = appHolderId;
            CMSJobStatus.View.initialize(appHolderId);
            CMSJobStatus.Controller.loadStatus();
        },
        // TODO: on Fail
        loadStatus: function() {
            $.ajax({
                url:CMSJobStatus.Configuration.ssb_status_url,  
                success: function(data) {
                   CMSJobStatus.Model.setJobStatus(data);
                   CMSJobStatus.View.fillStatusTableWithData();
                    //setTimeout(JobStatus.Controller.loadStatus, 60000);
                }
            });
        },        

        getJobStatusData: function (site_name) {
            return CMSJobStatus.Model.jobStatus;
        },
        getSiteNames: function (site_name) {
            return CMSJobStatus.Model.sites;
        },
    },
    startApp: function(appHolderId) {
       CMSJobStatus.Controller.startApp(appHolderId);
    }
};


