var PhedexTransfers = function(app_name, options) {
    var app = this;

    this.Configuration = {
        locale: 'en',
        status_url: "https://lcgsens01o.jinr.ru/rest/PhedexTransfers/lastStatus",
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
        getFileSizeUnits: function(bytes){
            if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
            else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
            else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
            else if (bytes>1)           {bytes=bytes+' bytes';}
            else if (bytes==1)          {bytes=bytes+' byte';}
            else                        {bytes='0 byte';}
            return bytes;
        },
    };

    this.Model = {
        status: [],
        min_time: null,
        max_time: null,

        setStatus: function(rest_data) {            
            var transfer_log = rest_data.data;
            if (transfer_log.length == 0){
                return 0;
            }
            var min_time = new Date(transfer_log[0].time);
            var max_time = new Date(transfer_log[0].time);
            var max_time_binwidth = 0;
            var result = {};
            for (var i=0; i< transfer_log.length; i++) {
                var row_time = new Date(transfer_log[i].time);
                
                if (row_time < min_time){
                    min_time = row_time;
                }
                if (row_time > max_time){
                    max_time = row_time;
                    console.log(max_time);
                    max_time_binwidth = transfer_log[i].binwidth;
                }
                if (!(transfer_log[i].from in result)) {
                    result[transfer_log[i].from] = {};
                }
                if (!(transfer_log[i].to in result[transfer_log[i].from])) {
                    result[transfer_log[i].from][transfer_log[i].to] = {'done_files': 0,
                                                        'fail_files': 0,
                                                        'done_bytes': 0,
                                                        'fail_bytes': 0,
                                                        };
                }
                result[transfer_log[i].from][transfer_log[i].to]['done_files'] += transfer_log[i].done_files;
                result[transfer_log[i].from][transfer_log[i].to]['fail_files'] += transfer_log[i].fail_files;
                result[transfer_log[i].from][transfer_log[i].to]['done_bytes'] += transfer_log[i].done_bytes;
                result[transfer_log[i].from][transfer_log[i].to]['fail_bytes'] += transfer_log[i].fail_bytes;
            }
            var result_list = [];
            for (var i in result) {
                for (var j in result[i]) {
                    result_list.push([i, j, 
                                      result[i][j]['done_files'],
                                      result[i][j]['fail_files'],
                                      result[i][j]['done_bytes'],
                                      result[i][j]['fail_bytes'],
                                       ]);
                }
            }
            this.status = result_list;
            this.min_time = min_time;
            max_time.setSeconds(max_time.getSeconds() + max_time_binwidth);
            this.max_time = max_time;
            console.log(this);
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
            $(this.app_holder_id).append('<table id="phedex_transfers_table" class="display" width="100%" cellspacing="0" style="font-size: 12px;"><tbody> </tbody></table>');

            this.datatable = $(this.app_holder_id + ' #phedex_transfers_table').DataTable({
                data: app.Model.status,
                order: [[ 3, "desc" ]],
                columns: [
                    { 
                        title: "From", 
                        render: function(data, type, row) {
                            if (type === 'display') {
                                if (data.indexOf('T1_RU_JINR') !== -1)
                                    return '<b>' + data + '</b>';
                            }
                            return data;
                        }
                    },
                    { 
                        title: "To",
                        render: function(data, type, row) {
                            if (type === 'display') {
                                if (data.indexOf('T1_RU_JINR') !== -1)
                                    return '<b>' + data + '</b>';
                            }
                            return data;
                        }
                    },
                    { title: "Done Files" },
                    { title: "Fail Files", "orderSequence": [ "desc", "asc"]},
                    { 
                        title: "Done Bytes",
                        render: function ( data, type, row ) {
                            if ( type === 'display' || type === 'filter' ) {
                                return app.Utils.getFileSizeUnits(data);
                            } 
                            return data;
                        }, 
                    },
                    { 
                        title: "Fail Bytes",
                        render: function ( data, type, row ) {
                            if ( type === 'display' || type === 'filter' ) {
                                return app.Utils.getFileSizeUnits(data);
                            } 
                            return data;
                        },  
                    }
                ],

            });
        },

        fillStatusTableWithData: function() {
            this.datatable.clear();
            this.datatable.rows.add(app.Model.status);
            this.datatable.draw();
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
            return app.Model.status['data'];
        },
    };

    app.Configuration.options = JSON.parse(options);
    app.Controller.startApp(app_name);
};
