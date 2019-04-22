var SSB = function(app_name, options) {
    var app = this;

    this.Configuration = {
        locale: 'en',
        status_url: "https://t1services.jinr.ru/rest/SSB/lastStatus?site_name=T1_RU_JINR",
        module_status_url: "https://t1services.jinr.ru/rest/SSB/getModuleStatus",
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
        status: null,

        setStatus: function(data) {
            this.status = data;
        },
    };
    //============================================================================
    //    VIEW
    //============================================================================
    this.View = {
        app_holder_id: null,

        initialize: function(appHolderId) {
            this.app_holder_id = appHolderId;
            $(this.app_holder_id).append('<table id="ssb_table" class="table table-bordered" width="100%" cellspacing="0" style="font-size: 12px;"><tbody> </tbody></table>');

            $(this.app_holder_id + ' table tbody').append(
                '<tr><td>Time:</td><td id="time"></td><td>GGUS tickets:</td><td id="ggus"></td></tr>' +
                '<tr><td>Visible:</td><td id="visible"></td><td>Active T2s</td><td id="active_t2s"></td></tr>' +
                '<tr><td>Site Ready:</td><td id="site_readiness"></td><td>HC Glidein</td><td id="hc_glidein"></td></tr>' +
                '<tr><td>SAM3 CE:</td><td id="sam3_ce"></td><td>Analysis:</td><td id="analysis"></td></tr>' +
                '<tr><td>SAM3 SRM</td><td id="sam3_srm"></td><td>Com. Links</td><td id="commissioned_links"></td></tr>' +
                '<tr><td>Good Links:</td><td id="good_links"></td><td>Topology</td><td id="topologymaintenances"></td></tr>' +
                '<tr><td>Running:</td><td id="running"></td><td>IN phedex rate</td><td id="in_rate_phedex"></td></tr>' +
                '<tr><td>Pending:</td><td id="pending"></td><td>OUT phedex rate</td><td id="out_rate_phedex"></td></tr>');
        },

        fillStatusTableWithData: function() {
            var data = app.Controller.getStatusData();
            var OK_elements = ['visible', 'site_readiness', 'sam3_ce', 'sam3_srm', 'good_links'];
            var other_elements = ['ggus', 'active_t2s', 'hc_glidein', 'commissioned_links', 'analysis', 'topologymaintenances', 'running', 'pending', 'in_rate_phedex', 'out_rate_phedex'];
            $(this.app_holder_id + ' #time').html(app.Utils.getDuration(data['time'])+ ' ago');
            for (var i = 0; i < OK_elements.length; i++) {
                var prop = OK_elements[i];
                var value = data[prop];
                if (value == 'OK' || value == 'Ok'){
                    $(this.app_holder_id + ' #' + prop).css('color', 'green');
                }
                else {
                    if (value == 'DOWNTIME' || value == 'Downtime'){
                        $(this.app_holder_id + ' #' + prop).css('color', 'blue');
                    }
                    else {
                        $(this.app_holder_id + ' #' + prop).css('color', 'red');
                    }
                }
                $(this.app_holder_id + ' #' + prop).html(value);
            }
            for (var i = 0; i < other_elements.length; i++) {
                var prop = other_elements[i];
                var value = data[prop];
                $(this.app_holder_id + ' #' + prop).html(value);
            }
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
                url: app.Configuration.status_url,
                success: function(data) {
                    app.Model.setStatus(data);
                    app.View.fillStatusTableWithData();
                }
            });

            get_status_ajax_call({
                app_name: app.Controller.app_name,
                url: app.Utils.createURL(app.Configuration.module_status_url, app.Configuration.options),
            });
            setTimeout(app.Controller.loadStatus, 60000);
        },        

        getStatusData: function() {
            return app.Model.status['data'][0];
        },

    };
    //options = JSON.parse(options);
    //app.Configuration.options = options;
    app.Controller.startApp(app_name);
};
 