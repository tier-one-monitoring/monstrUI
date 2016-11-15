function set_box_loading_initiated(app_name) {
	$('#' + app_name + '_updating').show();
}

function set_box_loading_done(app_name) {
	console.log('#' + app_name + '_updating');
	$('#' + app_name + '_updating').hide();
}