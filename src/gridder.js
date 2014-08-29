var $ = require('jquery'),
	_ = require('underscore'),
	Backbone = require('backbone'),
	DeepModel = require('backbone-deep-model');

Backbone.$ = $;

var template = [
	'	<table class="table table-bordered">',
	'		<thead></thead>',
	'		<tbody></tbody>',
	'	</table>'
].join('');

module.exports = Backbone.View.extend({

	calledMethods: [],

	initialize: function (options) {
		this.$el = $(options.element);
		this.template = template;
		this.collection = options.collection;
		this.colsKeys = _.keys(options.cols);
		this.colsValues = _.values(options.cols);
		this.cssClasses = options.cssClasses ? options.cssClasses.join(' ') : [];

		this.listenTo(this.collection, 'remove destroy', this.removeRow);

		this.listenTo(this.collection, 'add', function (model) {
			this.renderRow(model);
			_.each(this.calledMethods, function (method) {
				method.fn.call(this, method.options);
			}, this);
		});

		this.render();

		return this;
	},

	render: function () {
		this.$el.html(this.template);
		this.renderHeader();
		this.renderBody();
		if (this.cssClasses) {
			this.addCSSClasses();
		}

		return this;
	},

	renderHeader: function () {
		var template = [
			'<tr>',
			'	<th>' + this.colsValues.join('</th><th>') + '</th>',
			'</tr>'
		].join('');

		this.$('table > thead').html(template);
	},

	renderBody: function () {
		this.collection.each(this.renderRow, this);
	},

	renderRow: function (model) {
		model = new DeepModel(model.attributes);

		var cols = [],
			col,
			cssClass,
			template = [],
			attrs = _.map(this.colsKeys, function (key) {
				return model.get(key);
			});

		_.each(attrs, function (attr, key) {
			cssClass = this.colsKeys[key].replace(/\./g, '-');

			// Parse null values to render empty
			attr = attr == null || attr === undefined ? '' : attr;

			col = '<td class="col-{{class}}">' + attr + '</td>';
			cols.push(col.replace('{{class}}', cssClass));
		}, this);

		template = [
			'<tr id="{{id}}">',
				cols.join(''),
			'</tr>'
		].join('').replace('{{id}}', model.get('id'));

		this.$('table > tbody').append(template);
	},

	removeRow: function (model) {
		this.$('table > tbody').find('tr#' + model.get('id')).remove();
	},

	addCSSClasses: function () {
		this.$('table').addClass(this.cssClasses);
	},

	changeValues: function (options) {
		var cols = this.$('table > tbody > tr > td');

		_.each(options, function (value, key) {
			_.each(cols, function (col) {
				if ($(col).html() == key) {
					$(col).html(value);
				}
			});
		});

		this.calledMethods.push({
			fn: this.changeValues,
			options: options
		});

		return this;
	},

	getCols: function (callback) {
		_.each(this.$('table > tbody > tr > td'), function (col) {
			callback(col, this.collection.get($(col).parents('tr').attr('id')));
		}, this);

		this.calledMethods.push({
			fn: this.getCols,
			options: callback
		});

		return this;
	},

	getRows: function (callback) {
		_.each(this.$('table > tbody > tr'), function (row) {
			callback(row, this.collection.get($(row).attr('id')));
		}, this);

		this.calledMethods.push({
			fn: this.getRows,
			options: callback
		});

		return this;
	},

	addCols: function (options) {
		var content = null,
			that = this;

		this.$('table .gridder-col-inserted').remove();

		if (this.collection.length > 0) {
			_.each(options, function (option) {

				/* hack para atualizar o DOM antes de inserir novos elementos */
				// setTimeout(function() {
				var position = option.position,
					header = option.header ? option.header : '';

				if (position && position === 'first') {
					position = 0;
				}
				else if (position && position === 'last') {
					position = that.$('table > thead > tr > th').length;
				}
				else if (position > that.$('table > thead > tr > th').length) {
					position = that.$('table > thead > tr > th').length;
				}
				else {
					position = position;
				}

				try {
					if (position === 0) {
						that.$('table > thead > tr > th:first-child').before('<th class="gridder-col-inserted">' + header + '</th>');
					}
					else {
						that.$('table > thead > tr > th:nth-child(' + position + ')').after('<th class="gridder-col-inserted">' + header + '</th>');
					}
				}
				catch (err) {
					position = that.$('table > thead > tr > th').length;
					that.$('table > thead > tr > th:nth-child(' + position + ')').after('<th class="gridder-col-inserted">' + header + '</th>');
				}

				_.each(that.$('table > tbody > tr'), function (row) {
					var model = that.collection.get($(row).attr('id'));
					model = new DeepModel(model.attributes);

					if (typeof (option.content) == "function") {
						content = option.content(model);
					}
					else {
						content = option.content.replace(/\{\{(\S*)\}\}/gi, function (test, match) {
							return model.get(match);
						});
					}

					if (position === 0) {
						$(row).find('td:first-child').before('<td class="gridder-col-inserted">' + content + '</td>');
					}
					else {
						$(row).find('td:nth-child(' + position + ')').after('<td class="gridder-col-inserted">' + content + '</td>');
					}
				});
				// }, option.position);
			});
		}

		this.calledMethods.push({
			fn: this.addCols,
			options: options
		});

		return this;
	},
});