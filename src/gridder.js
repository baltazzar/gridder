define(function(require, exports, module){

	var $ = require('jquery'),
		GridView = require('./views/grid');

	require(['./templates']);

	$.fn.Gridder = function(options) {
		options.el = this;
		return new GridView(options);
	};

	// module.exports = {
	//	init: function(options) {
	//		return new GridView(options);
	//	}
	// }
});