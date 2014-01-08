define(function(require, exports, module){

	var $ = require('jquery'),
		GridderView = require('./views/gridder');

	$.fn.Gridder = function(options) {
		options.el = this;
		return new GridderView(options);
	};
});