define(function(require, exports, module){

	var $ = require('jquery'),
		GridView = require('./views/grid');

	$.fn.Gridder = function(options) {
		options.el = this;
		return new GridView(options);
	};
});