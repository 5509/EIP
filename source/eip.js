/**
 * EIP
 *
 * @version      1.1
 * @author       nori (norimania@gmail.com)
 * @copyright    5509 (http://5509.me/)
 * @license      The MIT License
 * @link         https://github.com/5509/skroll
 *
 * 2012-02-22 02:03
 */
;(function($, undefined) {

  $.fn.eip = function(option) {
    option = $.extend({
      defaultLabel: "Click here to edit",
      buttons: true,
      submitLabel: "Save",
      cancelLabel: "Cancel",
      onsubmit: null
    }, option);
    return this.each(function() {
      new EIP($(this), option);
    });
  };

  // EIP
  function EIP(elm, option) {
    this.option = option;
    this.$defaultLabel = $("<span>")
      .addClass('eip-default')
      .text(elm.attr("data-eip-default") || option.defaultLabel);
    this.eipType = elm.attr("data-eip");
    if (elm.attr("data-eip-value") === undefined) {
      elm.attr("data-eip-value", elm.html());
    }
    this.$elm = elm;
    this.$holder = $("<div></div>", {
        "class": "eip-holder"
      });
    this.$form = $("<form></form>");

    switch ( this.eipType ) {
    case "textarea":
      this.$input = $("<textarea></textarea>", {
          rows: elm.attr("data-eip-rows") || 10,
          "class": "eip-input",
          name: elm.attr("data-eip-name")
        });
      break;
    case "select":
      this.$input = $("<select></select>", {
          "class": "eip-input",
          name: elm.attr("data-eip-name")
        }).html(
          (function() {
            var _options = $.parseJSON(elm.attr("data-eip-option")),
              _i = 0,
              _returnOpt = "";
            if ($.isArray(_options)) {
              for ( ; _i < _options.length; _i++ ) {
                _returnOpt += "<option value='" + _options[_i] + "'>" + _options[_i] + "</option>";
              }
            }
            else {
              $.each(_options, function(key, val) {
                _returnOpt += "<option value='" + key + "'>" + val + "</option>";
              });
            }
            return _returnOpt;
          }())
        );
      elm.attr("data-eip-value", this.$input.val());
      break;
    default:
      this.$input = $("<input>", {
          type: this.eipType || "text",
          "class": "eip-input",
          name: elm.attr("data-eip-name")
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
          this.$holder.html(_html.replace(/\n|\r/g, "<br/>") || this.$defaultLabel),
          this.$form.css("display", "none")
        );

      this.editable();
    },
    replaceInput: function() {
      var _this = this;
      this.$input.val( htmlUnescape(this.$elm.attr("data-eip-value")) );
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
      var _val = cancel ? this.$elm.attr("data-eip-value") : htmlEscape(this.$input.val());
      var holder;
      if ( this.eipType === "select" ) {
        holder = this.$elm.find("option").filter(function() {
          return $(this).attr("value") === _val;
        }).text();
      }
      else if ( !_val || _val.length === 0 ) {
        holder = this.$defaultLabel
      }
      else {
        holder = _val.replace(/\n|\r/g, "<br/>");
      }

      this.$form.unbind();
      this.$input.unbind();

      if ( this.option.buttons ) {
        this.$cancel.unbind();
        this.$buttons.removeClass("show");
      }

      this.$elm
        .removeClass("eip-editing")
        .attr("data-eip-value", _val);
      this.$holder
        .html(holder)
        .css("display", "block");
      this.$form
        .css("display", "none");

      this.editable();
    },
    submit: function() {
      var _opt = this.option;
      this.replaceDefault();
      if ( !$.isFunction(_opt.onsubmit) ) return;
      _opt.onsubmit.call(this, this.$input.attr('name'), this.$input.val());
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
  function htmlUnescape(str) {
    return $('<div>').html(str).text();
  }
  function htmlEscape(str) {
    return $('<div>').text(str).html();
  }
}(jQuery));
