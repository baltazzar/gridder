define(function(require, exports, module){

	var Marionette = require('marionette');

	require(['../templates']);

	module.exports = Marionette.ItemView.extend({
		template: 'gridder/grid.tpl',
		lastColOptions: null,
		changeValuesOptions: null,

		initialize: function(options) {
			this.collection = options.collection;
			this.render();
			this.listenTo(this.collection, 'all', _.debounce(function() {
				this.render();
				if(this.lastColOptions) {
					this.setLastCol(this.lastColOptions);
				}
				if(this.changeValuesOptions) {
					this.changeValues(this.changeValuesOptions);
				}
			}), 300);
		},

		onRender: function() {
			this.setHeaders();
			this.setValues();
			this.setCssClasses();
		},

		changeValues: function(options) {
			var cols = this.$('table tbody td');

			_.each(options, function(value, key) {
				_.each(cols, function(col) {
					if($(col).html() == key) {
						$(col).html(value);
					}
				});
			});

			this.changeValuesOptions = options;
		},

		getCols: function(callback) {
			_.each(this.$('table td'), callback);
		},

		getRows: function(callback) {
			_.each(this.$('table tr'), callback);
		},

		setLastCol: function(options) {
			var	that = this;

			options.header = options.header ? options.header : '';

			if(this.collection.length > 0) {

				this.$('table thead tr').append('<th>' + options.header + '</th>');

				_.each(this.$('table tbody tr'), function(tr) {

					var elements = options.elements.join(' '),
						model = that.collection.get(tr.id);

					elements = elements.replace(/\$\{(\w*)\}/gi, function(test, match) {
						return model.get(match);
					});

					$(tr).append('<td/>').children('td:last').css('width', '1px').append(elements);
				});

			}

			this.lastColOptions = options;
		},

		setHeaders: function() {
			var headers = _.values(this.options.headers),
				ths = [];

			_.each(headers, function(val) {
				ths.push('<th>' + val + '</th>');
			});

			this.$('table thead tr').html(ths);
		},

		setValues: function() {
			var values = _.keys(this.options.headers),
				trs = [],
				that = this;

			if(this.collection.length > 0) {

				_.each(this.collection.models, function(model) {
					var tds = [],
						list = [];

					_.each(values, function(val) {
						val = val.split('.');

						var attrs = '';

						_.each(val, function(v, k) {
							if(val.length == (k + 1)) {
								attrs += 'val[' + k + ']';
							} else {
								attrs += 'val[' + k + ']][';
							}
						});

						list.push( eval('model.attributes[' + attrs + ']') );
					});

					_.each(list, function(item, k) {
						var tdClass = 'cell-' + values[k].replace(/\./g, '-');

						if(item === undefined) {
							item = that.options.nullCell ? that.options.nullCell : '';
						}

						tds.push('<td class="' + tdClass + '">' + item + '</td>');
					});

					trs.push('<tr id="' + model.id + '">' + tds.join('') + '</tr>');
				});

				that.$('table tbody').html(trs.join(''));

			} else {

				that.$('table tbody').html('<tr><td colspan="' + values.length + '"><strong>' + that.options.nullCollection + '</strong></td></tr>');

			}
		},

		setCssClasses: function() {
			this.$('table').addClass(this.options.cssClasses.join(' '));
		}
	});
});