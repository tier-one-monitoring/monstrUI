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
    $('#' + app_name + '_box').addClass('box-damger');
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
