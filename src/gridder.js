// Gridder

module.exports = function(marionette) {

	var GridderView = require('./gridder_view')(marionette);

	return function(options) {
		return new GridderView(options);
	}
};