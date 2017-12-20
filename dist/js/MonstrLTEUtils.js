function set_box_loading_initiated(app_name) {
	$('#' + app_name + '_updating').show();
}

function set_box_loading_done(app_name) {
	$('#' + app_name + '_updating').hide();
}

function set_box_update_time(app_name) {
	$('#' + app_name + '_updateTime').html(moment().format('D MMM H:mm'));
}

function set_box_loading_successful(app_name) {
    $('#' + app_name + '_box').addClass('box-success');
}

function set_box_loading_failed(app_name) {
    $('#' + app_name + '_box').addClass('box-danger');
}

function set_module_status_tooltip(app_name, statuses) {
    // Mapper between status number and name/class
    var class_names = ['label-danger', 'label-warning', 'label-info', 'label-primary', 'label-success'];
    var classes = {
        50: 'label-danger',
        40: 'label-warning',
        30: 'label-info',
        20: 'label-primary',
        10: 'label-success',
    };
    var status_names = {
        50: 'Critical',
        40: 'Bad',
        30: 'Normal',
        20: 'Good',
        10: 'Excelent',
    };
    
    function compareStatusesNames(a, b){
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }
    statuses.sort(compareStatusesNames);

    // Create status table which will be placed in tooltip
    var title = '<table style="white-space:nowrap; border: 1px solid white;">';
    for (var i=0; i<statuses.length; i++) {
        title += '<tr style="border: 1px solid white;">';
        title += '<td style="border: 1px solid white;padding:3px;">' + statuses[i].name + '</td>';

        title += '<td style="border: 1px solid white;padding:3px;"><span class="label ';
            title += classes[statuses[i].status];
            title += '">' + status_names[statuses[i].status] + '</span></td>';

        title += '<td style="border: 1px solid white;padding:3px;">' + moment(statuses[i].time).format('D MMM H:mm') + '</td>';
        title += '<td style="border: 1px solid white;padding:3px;">' + statuses[i].description+ '</td>';
        title += '</tr>';
    }
    title += '</table>';
    $('#' + app_name + '_status').attr('title', title)
          .tooltip('fixTitle');

    // Set status result in the corner of the module
    //    Get worst status from all statuses
    var worst_status = statuses[0].status;
    for (var i=0; i<statuses.length; i++) {
        if (statuses[i].status>worst_status)
            worst_status = statuses[i].status;
    }
    //    Clear old status classes
    var status_label = $('#' + app_name + '_status');
    for (var i=0; i<class_names.length; i++) {
        if (status_label.hasClass(class_names[i])) {
            status_label.removeClass(class_names[i]);
        }
    }
    //    If status is not 0 (undefined) - apply
    if (worst_status != 0){
        status_label.addClass(classes[worst_status]);
        status_label.html(status_names[worst_status]);
    }
}

function app_ajax_call(call_obj) {
	set_box_loading_initiated(call_obj.app_name);
	var result;
	var is_ok;
    $.ajax({
        url: call_obj.url,
        success: function(data) {
        	set_box_update_time(call_obj.app_name);
            set_box_loading_successful(call_obj.app_name);
        	call_obj.success(data);
        },
        error: function(request_obj, message, error) {
        	is_ok = false;
        	result = {'message': message, 'error': error};
            set_box_loading_failed(call_obj.app_name);
        },
        complete: function() {
        	set_box_loading_done(call_obj.app_name);
        }
    });
}

function get_status_ajax_call(call_obj) {
    $.ajax({
        url: call_obj.url,
        success: function(response) {
            if (response.success&&response.data.length>0) {
                var data;
                if (typeof(call_obj.filter) !== 'undefined') 
                    data = call_obj.filter(response.data);
                else
                    data = response.data;
                var final_status = data[0].status;
                for (var i=0; i<data.length; i++) {
                    if (data[i].status>final_status)
                        final_status = data[i].status;
                }
                set_module_status_tooltip(call_obj.app_name, data);
            }
        },
    });
}