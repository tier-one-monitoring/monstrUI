var MonstrJournal = function(app_name, options) {
    var app = this;

    this.Configuration = {
        locale: 'en',
        status_url: "https://lcgsens01o.jinr.ru/rest/MonstrJournal/getRows",
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
            var journal_log = rest_data.data;
            if (journal_log.length == 0){
                return 0;
            }
            
            this.data = rest_data.data;
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
            $(this.app_holder_id).append('<table id="monstr_journal_table" class="display compact" width="100%" cellspacing="0" style="font-size: 12px;"><tbody> </tbody></table>');

            this.datatable = $(this.app_holder_id + ' #monstr_journal_table').DataTable({
                data: app.Model.data,
                order: [[ 2, "asc" ]],
                columns: [
                    {title: "ID", data: "id", "width": "5%"},
                    {title: "Module", data: "module", "width": "10%"},
                    {
                        title: "Result",
                        data: "result",
                        render: function(data, type, row) {
                            if (type === 'display')
                                if (data.indexOf('Fail') !== -1)
                                    return '<b style="color:red">' + data + '</b>';
                            return data;
                        },
                        "width": "10%"
                    },
                    {title: "Step", data: "step", "width": "10%"},
                    {title: "Time", data: "time"},
                    {title: "Description", data: "description"},
                ],

            });
        },

        fillStatusTableWithData: function() {
            console.log(app.Model.data);
            this.datatable.clear();
            this.datatable.rows.add(app.Model.data);
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
            return app.Model.data;
        },
    };

    app.Configuration.options = JSON.parse(options);
    app.Controller.startApp(app_name);
};
