var tableTemplate = [
	'<div>',
	'	<table class="table table-bordered">',
	'		<thead></thead>',
	'		<tbody></tbody>',
	'	</table>',
	'</div>'
].join('');


module.exports = function(marionette) {

	return marionette.ItemView.extend({
		template: tableTemplate,
		colsOptions: null,
		changeValuesOptions: null,
		getColsCallback: null,
		getRowsCallback: null,

		initialize: function(options) {

			this.options = options;
			this.render();

			this.listenTo(this.options.collection, 'all', _.debounce(function(){
				this.render();
				if(this.getColsCallback) {
					this.getCols(this.getColsCallback);
				}
				if(this.getRowsCallback) {
					this.getRows(this.getRowsCallback);
				}
				if(this.addColsOptions) {
					this.addCols(this.addColsOptions);
				}
				if(this.changeValuesOptions) {
					this.changeValues(this.changeValuesOptions);
				}
			}), 300);
		},

		onRender: function() {
			this.setHeaders();
			this.setCols();
			this.setCssClasses();
		},

		changeValues: function(options) {
			var cols = this.$('table > tbody > tr > td');

			_.each(options, function(value, key) {
				_.each(cols, function(col) {
					if($(col).html() == key) {
						$(col).html(value);
					}
				});
			});

			this.changeValuesOptions = options;
		},

		addCols: function(options) {
			var that = this,
				content = null;

			_.each(options, function(option) {

				// hack para atualizar o DOM antes de inserir novos elementos
				setTimeout(function() {
					option.position = option.position ? option.position : that.$('table > thead > tr > th').length;
					option.header = option.header ? option.header : '';

					that.$('table > thead > tr > th:nth-child(' + option.position + ')')
						.after('<th>' + option.header + '</th>');

					_.each(that.$('table > tbody > tr'), function(row) {
						var model = that.options.collection.get(row.id);

						content = option.content.replace(/\{\{(\w*)\}\}/gi, function(test, match) {
							return model.get(match);
						});

						$(row).find('td:nth-child(' + option.position + ')')
							.after('<td style="width:1px;">' + content + '</td>');
					});
				}, option.position);
			});

			this.addColsOptions = options;
		},

		getCols: function(callback) {
			var that = this;

			_.each(this.$('table > tbody > tr > td'), function(col) {
				callback(col, that.options.collection.get($(col).parents('tr').attr('id')));
			});

			this.getColsCallback = callback;
		},

		getRows: function(callback) {
			var that = this;

			_.each(this.$('table > tbody > tr'), function(row) {
				callback(row, that.options.collection.get(row.id));
			});

			this.getRowsCallback = callback;
		},

		setHeaders: function() {
			var headers = _.map(this.options.headers, function(h) {
				return '<th>' + h.split(':')[1] + '</th>';
			}).join('');

			this.$('table > thead').append('<tr/>').find('tr').append(headers);
		},

		setCols: function() {
			var keys = _.map(this.options.headers, function(h) { return h.split(':')[0]; }),
				rows = [],
				that = this;

			_.each(this.options.collection.models, function(model) {
				var cols = [],
					attrs = null,
					field = null;

				_.each(keys, function(key) {

					field = key.split('.');

					if(field.length > 1) {
						attrs = [];

						_.each(field, function(f) {
							attrs.push('"' + f + '"');
						});

						field = attrs.join('][');
					} else {
						field = '"' + key + '"';
					}

					try {
						field =  eval('model.attributes[' + field + ']');

						if(that.options.sanitize === false) {
							field = field;
						} else {
							field = field === null || field === undefined ? '' : field;
						}

						key = key.replace(/\./g, '-');

						cols.push('<td class="col-' + key + '">' + field + '</td>');
					} catch (err) {
						cols.push('<td></td>');
					}
				});

				rows.push('<tr id="' + model['id'] + '">' + cols.join('') + '</tr>');
			});

			this.$('table > tbody').append(rows.join(''));
		},

		setCssClasses: function() {
			this.$('table').addClass(this.options.cssClasses.join(' '));
		}
	});
};