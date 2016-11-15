var SSB = {

    Configuration: {
        locale: 'en',
        status_url: "https://lcgsens01o.jinr.ru/rest/SSB/lastStatus?site_name=T1_RU_JINR",
    },

    Utils: {
        getDuration: function(time) {
            var now = new Date().getTime();
            var error_time = new Date(time);
            return moment.duration(now - error_time).humanize();
        },
    },

    Model: {
        status: null,

        setStatus: function(data) {
            this.status = data;
        },
    },
    //============================================================================
    //    VIEW
    //============================================================================
    View: {
        app_holder_id: null,

        initialize: function(appHolderId) {
            this.app_holder_id = appHolderId;
            console.log(this.app_holder_id);
            $(this.app_holder_id).append('<table id="ssb_table" class="table table-bordered" width="100%" cellspacing="0" style="font-size: 12px;"><tbody> </tbody></table>');

            $(this.app_holder_id + ' table tbody').append(
                '<tr><td>Time:</td><td id="time"></td><td>GGUS tickets:</td><td id="ggus"></td></tr>' +
                '<tr><td>Visible:</td><td id="visible"></td><td>Active T2s</td><td id="active_t2s"></td></tr>' +
                '<tr><td>Site Readiness:</td><td id="site_readiness"></td><td>HC Glidein</td><td id="hc_glidein"></td></tr>' +
                '<tr><td>SAM3 CE:</td><td id="sam3_ce"></td><td>Analysis:</td><td id="analysis"></td></tr>' +
                '<tr><td>SAM3 SRM</td><td id="sam3_srm"></td><td>Commissioned Links</td><td id="commissioned_links"></td></tr>' +
                '<tr><td>Good Links:</td><td id="good_links"></td><td>TopologyMaintenances</td><td id="topologymaintenances"></td></tr>' +
                '<tr><td>Running:</td><td id="running"></td><td>IN phedex rate</td><td id="in_rate_phedex"></td></tr>' +
                '<tr><td>Pending:</td><td id="pending"></td><td>OUT phedex rate</td><td id="out_rate_phedex"></td></tr>');
        },

        fillStatusTableWithData: function() {
            var data = SSB.Controller.getStatusData();
            var OK_elements = ['visible', 'site_readiness', 'sam3_ce', 'sam3_srm', 'good_links'];
            var other_elements = ['ggus', 'active_t2s', 'hc_glidein', 'commissioned_links', 'analysis', 'topologymaintenances', 'running', 'pending', 'in_rate_phedex', 'out_rate_phedex'];
            $(this.app_holder_id + ' #time').html(SSB.Utils.getDuration(data['time'])+ ' ago');
            for (var i = 0; i < OK_elements.length; i++) {
                var prop = OK_elements[i];
                var value = data[prop];
                if (value == 'OK' || value == 'Ok'){
                    $(this.app_holder_id + ' #' + prop).css('color', 'green');
                }
                $(this.app_holder_id + ' #' + prop).html(value);
            }
            for (var i = 0; i < other_elements.length; i++) {
                var prop = other_elements[i];
                var value = data[prop];
                $(this.app_holder_id + ' #' + prop).html(value);
            }
        },

       
    },
    //============================================================================
    //    CONTROLLER

    //============================================================================
    Controller: {
        app_name: '',

        startApp: function(app_name) {
            this.app_name = app_name;
            SSB.View.initialize('#' + app_name + '_AppHolder');
            SSB.Controller.loadStatus();
        },
        // TODO: on Fail
        loadStatus: function() {
            set_box_loading_initiated(SSB.Controller.app_name);

            $.ajax({
                url: SSB.Configuration.status_url,  
                success: function(data) {
                    set_box_loading_done(SSB.Controller.app_name);
                    SSB.Model.setStatus(data);
                    SSB.View.fillStatusTableWithData();
                    setTimeout(SSB.Controller.loadStatus, 60000);
                    
                },
            });
        },        

        getStatusData: function() {
            return SSB.Model.status['data'][0];
        },

    },
    startApp: function(app_name) {
        SSB.Controller.startApp(app_name);
    }
};