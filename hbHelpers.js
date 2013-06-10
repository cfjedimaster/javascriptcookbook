exports.dateFormat = function(input) {
	var d = new Date(input);
	return d.getMonth() + '/' + d.getDate() + '/'+ d.getFullYear() + ' at ' + d.getHours() + ':' + d.getMinutes();
}