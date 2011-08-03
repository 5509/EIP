/**
 * EIP
 *
 * @version      0.41
 * @author       nori (norimania@gmail.com)
 * @copyright    5509 (http://5509.me/)
 * @license      The MIT License
 * @link         https://github.com/5509/skroll
 *
 * 2011-08-03 15:12
 */
;(function($, undefined) {

	$.fn.eip = function(option) {
		option = $.extend({
			defaultLabel: "Click here to edit",
			buttons: true,
			submitLabel: "Save",
			cancelLabel: "Cancel",
			callback: null
		}, option);
		return this.each(function() {
			new EIP($(this), option);
		});
	};

	// EIP
	function EIP(elm, option) {
		this.option = option;
		this.eip = {
			defaultLabel: elm.attr("data-default") || option.defaultLabel
		};
		this.eipType = elm.attr("data-eip");
		this.$elm = elm
			.attr("data-value", elm.html());
		this.$holder = $("<div></div>", {
				"class": "eip-holder"
			});
		this.$form = $("<form></form>");

		switch ( this.eipType ) {
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
			var _html = this.$elm.html();

			this.$form
				.append(this.$input);

			if ( this.option.buttons ) {
				this.$form
					.append(this.$buttons);
			}

			this.$elm
				.html("")
				.append(
					this.$holder.html(_html),
					this.$form.css("display", "none")
				);

			this.editable();
		},
		replaceInput: function() {
			var _this = this;
			this.$input.val(this.$elm.attr("data-value"));
			this.$elm
				.removeClass("eip-hover")
				.addClass("eip-editing")
				.unbind();

			this.$holder
				.css("display", "none");
			this.$form
				.css("display", "block");

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
				.attr("data-value", _val);
			this.$holder
				.html(_val.replace(/\n|\r/g, "<br/>"))
				.css("display", "block");
			this.$form
				.css("display", "none");

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

}(jQuery));