exports.dateFormat = function(input) {
	var d = new Date(input);
	return d.getMonth() + '/' + d.getDate() + '/'+ d.getFullYear() + ' at ' + d.getHours() + ':' + ((d.getMinutes()<10)?"0"+d.getMinutes():d.getMinutes());
}

/*
Moved out since I don't think I can use hbs inside here.
exports.urlFormat = function(input) {
	return hbs.utils.escapeExpression(input);	
}
*/