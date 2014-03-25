var $ = require('jquery'),
	_ = require('underscore'),
	Backbone = require('backbone');

Backbone.$ = $;

// Define o template da tabela do Gridder.
var tableTemplate = [
	'<div>',
	'	<table class="table table-bordered">',
	'		<thead></thead>',
	'		<tbody></tbody>',
	'	</table>',
	'</div>'
].join('');

module.exports = function() {

	// Retorna uma Marionette Item View.
	return Backbone.View.extend({
		template: tableTemplate,
		colsOptions: null,
		changeValuesOptions: null,
		getColsCallback: null,
		getRowsCallback: null,

		// Chama a renderização da view e inicia os observers para os métodos.
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

		// Renderiza a view.
		render: function() {
			this.$el.html(this.template);
			this.setHeaders();
			this.setCols();
			if(this.options.cssClasses) {
				this.setCssClasses();
			}
		},

		// Método para alterar os valores das colunas da tabela.
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

		// Método para adicionar novas colunas. Antigamente chamado de **setLastCol**, agora aceita que
		// as colunas sejam inseridas em qualquer posição da tabela.
		addCols: function(options) {
			var that = this,
				content = null;

			_.each(options, function(option) {

				/* hack para atualizar o DOM antes de inserir novos elementos */
				setTimeout(function() {
					var position = option.position,
						header = option.header ? option.header : '';

					if(position && position === 'first') {
						position = 0;
					} else if(position && position === 'last') {
						position = that.$('table > thead > tr > th').length;
					} else if(position > that.$('table > thead > tr > th').length) {
						position = that.$('table > thead > tr > th').length;
					} else {
						position = position;
					}

					try {
						if(position === 0) {
							that.$('table > thead > tr > th:first-child').before('<th>' + header + '</th>');
						} else {
							that.$('table > thead > tr > th:nth-child(' + position + ')').after('<th>' + header + '</th>');
						}
					} catch(err) {
						position = that.$('table > thead > tr > th').length;
						that.$('table > thead > tr > th:nth-child(' + position + ')').after('<th>' + header + '</th>');
					}

					_.each(that.$('table > tbody > tr'), function(row) {
						var model = that.options.collection.get(row.id);

						content = option.content.replace(/\{\{(\w*)\}\}/gi, function(test, match) {
							return model.get(match);
						});

						if(position === 0) {
							$(row).find('td:first-child').before('<td style="width:1px;">' + content + '</td>');
						} else {
							$(row).find('td:nth-child(' + position + ')').after('<td style="width:1px;">' + content + '</td>');
						}
					});
				}, option.position);
			});

			this.addColsOptions = options;
		},

		// Método para acessar as colunas da tabela e manipulá-las caso seja necessário.
		// Retorna a coluna e o model correspondente.
		getCols: function(callback) {
			var that = this;

			_.each(this.$('table > tbody > tr > td'), function(col) {
				callback(col, that.options.collection.get($(col).parents('tr').attr('id')));
			});

			this.getColsCallback = callback;
		},

		// Método para acessar as linhas da tabela e manipulá-las caso seja necessário.
		// Retorna a linha e o model correspondente.
		getRows: function(callback) {
			var that = this;

			_.each(this.$('table > tbody > tr'), function(row) {
				callback(row, that.options.collection.get(row.id));
			});

			this.getRowsCallback = callback;
		},

		// Define os cabeçalhos da tabela.
		setHeaders: function() {
			var headers = _.map(this.options.headers, function(h) {
				return '<th>' + h.split(':')[1] + '</th>';
			}).join('');

			this.$('table > thead').append('<tr/>').find('tr').append(headers);
		},

		// Define e preenche as colunas da tabela com os valores da collection.
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

		// Define classes CSS opcionais para serem aplicadas na tabela.
		setCssClasses: function() {
			this.$('table').addClass(this.options.cssClasses.join(' '));
		}
	});
};