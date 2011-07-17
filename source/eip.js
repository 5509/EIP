/**
 * EIP
 *
 * @version      0.3
 * @author       nori (norimania@gmail.com)
 * @copyright    5509 (http://5509.me/)
 * @license      The MIT License
 * @link         https://github.com/5509/skroll
 *
 * 2011-07-16 15:35
 */
;(function($, window, document, undefined) {

	$.fn.eip = function(option) {
		return this.each(function() {
			option = $.extend({
				defaultLabel: "Click here to edit",
				buttons: true,
				submitLabel: "Save",
				cancelLabel: "Cancel",
				callback: null
			}, option);
			new EIP($(this), option);
		});
	};

	// EIP
	function EIP(elm, option) {
		this.option = option;
		this.eip = {
			defaultLabel: elm.attr("data-default") || option.defaultLabel
		};
		this.$elm = elm
			.attr("data-value", elm.html());
		this.$form = $("<form></form>");

		switch ( elm.attr("data-eip") ) {
		case "textarea":
			this.$input = $("<textarea></textarea>", {
					rows: elm.attr("data-rows") || 10,
					"class": "eip-input",
					name: elm.attr("data-eip")
				});
			break;
		case "select":
			this.$input = $("<select></select>", {
					"class": "eip-input",
					name: elm.attr("data-eip")
				}).html(
					(function() {
						var _options = elm.attr("data-option").split(","),
							_i = 0,
							_returnOpt = "";
						for ( ; _i < _options.length; _i++ ) {
							_returnOpt += "<option value='" + _options[_i] + "'>" + _options[_i] + "</option>";
						}
						return _returnOpt;
					}())
				);
			break;
		default:
			this.$input = $("<input>", {
					type: "text",
					"class": "eip-input",
					name: elm.attr("data-eip")
				});
			break;
		}

		this.$buttons = this.$save = this.$cancel = undefined;
		if ( option.buttons ) {
			this.$save = $("<input>", {
					type: "submit",
					"class": "eip-save",
					value: option.submitLabel
				});
			this.$cancel = $("<input>", {
					type: "button",
					"class": "eip-cancel",
					value: option.cancelLabel
				});
			this.$buttons = $("<p class='eip-buttons'></p>")
				.append(
					this.$save,
					this.$cancel
				);
		}

		// SetUp
		this.setUp();
	}
	EIP.prototype = {
		setUp: function() {
			this.$form
				.append(this.$input);

			if ( this.option.buttons ) {
				this.$form
					.append(this.$buttons);
			}

			this.editable();
		},
		replaceInput: function() {
			var _this = this;
			this.$input.val(this.$elm.attr("data-value"));
			this.$elm
				.removeClass("eip-hover")
				.addClass("eip-editing")
				.unbind()
				.empty()
				.append(this.$form);
			
			this.$input
				.css("width", this.$elm.width() - 20)
				.focus()
				.click(function(e) {
					e.stopPropagation();
				});

			if ( !this.option.buttons ) {
				this.$input
					.blur(function() {
						_this.submit();
					});
			} else {
				this.$cancel
					.click(function(e) {
						_this.cancel();
						e.stopPropagation();
					});
				this.$buttons.addClass("show");
			}
		},
		replaceDefault: function(cancel) {
			var _val = cancel ? this.$elm.attr("data-value") : this.$input.val(),
				_undef = false;

			if ( !_val || _val.length === 0 ) {
				_val = this.eip.defaultLabel;
				_undef = true;
			}

			this.$form.unbind();
			this.$input.unbind();

			if ( this.option.buttons ) {
				this.$cancel.unbind();
				this.$buttons.removeClass("show");
			}

			this.$elm
				.removeClass("eip-editing")
				.html(_val)
				.attr("data-value", _undef ? "" : _val);

			this.editable();
		},
		submit: function() {
			var _opt = this.option;
			this.replaceDefault();
			if ( !$.isFunction(_opt.callback) ) return;
			_opt.callback.call(this.$elm);
		},
		cancel: function() {
			this.$elm.removeClass("eip-hover");
			this.replaceDefault(true);
		},
		editable: function() {
			var _this = this;
			this.$form
				.bind("submit", function(e) {
					_this.submit();
					e.preventDefault();
				});
			this.$elm
				.hover(function() {
					_this.$elm.addClass("eip-hover");
				}, function() {
					_this.$elm.removeClass("eip-hover");
				})
				.bind("click", function() {
					_this.replaceInput();
				});
		}
	}

}(jQuery, this, this.document));