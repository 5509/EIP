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
    this.typeName = elm.attr("data-eip");
    this.type = EIP.types[this.typeName] || EIP.types['default'];

    this.$defaultLabel = $("<span>")
      .addClass("eip-default")
      .text(elm.attr("data-eip-default") || option.defaultLabel);
    this.$elm = elm;
    this.$holder = $("<div></div>", {
        "class": "eip-holder"
      });
    this.$form = $("<form></form>").css("display", "none");
    this.$input = null;

    if (elm.attr("data-eip-value") === undefined) {
      elm.attr("data-eip-value", this.type.getDefaultValue.call(this));
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
      if ( this.option.buttons ) {
        this.$form.append(this.$buttons);
      }

      this.$holder.html(this.$elm.html() || this.$defaultLabel);
      this.$elm.empty().append(this.$holder, this.$form);

      this.editable();
    },
    replaceInput: function() {
      var _this = this;

      this.$elm
        .removeClass("eip-hover")
        .addClass("eip-editing")
        .unbind();

      this.$holder.css("display", "none");
      this.$form.css("display", "block");

      this.type.renderForm.call(this, this.$elm.attr('data-eip-value'));

      if ( this.option.buttons ) {
        this.$cancel
          .click(function(e) {
            _this.cancel();
            e.stopPropagation();
          });

          // delay for buttons transition
          setTimeout(function() {
            _this.$buttons.addClass("show");
          }, 0);
      }
    },
    replaceDefault: function() {
      var val = this.$elm.attr("data-eip-value");

      this.type.renderHolder.call(this, val);
      this.$form.unbind();

      if ( this.option.buttons ) {
        this.$cancel.unbind();
        this.$buttons.removeClass("show");
      }

      this.$elm
        .removeClass("eip-editing")
        .attr("data-eip-value", val);
      this.$holder
        .css("display", "block");
      this.$form
        .css("display", "none");

      this.editable();
    },
    submit: function() {
      var val = this.type.getInputValue.call(this);
      var name = this.$input.attr('name');

      this.$elm.attr('data-eip-value', val);
      this.replaceDefault();

      if ( $.isFunction(this.option.onsubmit) ) {
        this.option.onsubmit.call(this, name, val);
      }
    },
    cancel: function() {
      this.$elm.removeClass("eip-hover");
      this.replaceDefault();
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
  };

  EIP.types = {};

  EIP.addType = function(typeName, funcs) {
    EIP.types[typeName] = $.extend({
      getDefaultValue: function() {
        return this.$elm.html();
      },
      getInputValue: function() {
        return htmlEscape(this.$input.val());
      }
    }, funcs);
  };

  EIP.addType('default', {
    renderHolder: function(val) {
      var html = val.replace(/\n|\r/g, "<br/>") || this.$defaultLabel;
      this.$holder.html(html);
    },
    renderForm: function(val) {
      var _this = this;

      if (!this.$input) {
        this.$input = $("<input>")
          .attr({
            type: this.typeName || 'text',
            "class": "eip-input",
            name: this.$elm.attr("data-eip-name")
          })
          .click(function(e) {
            e.stopPropagation();
          })
          .css("width", this.$elm.width() - 20);

        this.$form.prepend(this.$input);

        if ( !this.option.buttons ) {
          this.$form.delegate('input', 'blur', function() { _this.submit(); });
        }
      }

      this.$input.val( htmlUnescape(val) ).focus();
    }
  });

  EIP.addType('textarea', {
    renderHolder: function(val) {
      var html = val.replace(/\n|\r/g, "<br/>") || this.$defaultLabel;
      this.$holder.html(html);
    },
    renderForm: function(val) {
      var _this = this;

      if (!this.$input) {
        this.$input = $("<textarea>")
          .attr({
            rows: this.$elm.attr("data-eip-rows") || 10,
            "class": "eip-input",
            name: this.$elm.attr("data-eip-name")
          })
          .click(function(e) {
            e.stopPropagation();
          })
          .css("width", this.$elm.width() - 20);

        this.$form.prepend(this.$input);

        if ( !this.option.buttons ) {
          this.$form.delegate('textarea', 'blur', function() { _this.submit(); });
        }
      }

      this.$input.val( htmlUnescape(val) ).focus();
    }
  });

  EIP.addType('select', {
    getDefaultValue: function() {
      var html = this.$elm.html();
      var options = $.parseJSON(this.$elm.attr('data-eip-option'));
      var result = '';
      var isArray = $.isArray(options);
      $.each(options, function(key, val) {
        if (val === html) {
          result = isArray ? val : key;
          return false;
        }
      });

      return result;
    },
    renderHolder: function(val) {
      var html = this.$elm.find("option").filter(function() {
        return $(this).attr("value") === val;
      }).text() || this.$defaultLabel;

      this.$holder.html(html);
    },
    renderForm: function(val) {
      var _this = this;
      var optionsHtml = createOptionsHtml(this.$elm.attr("data-eip-option"));

      if (!this.$input) {
        this.$input = $("<select>")
          .attr({
            "class": "eip-input",
            name: this.$elm.attr("data-eip-name")
          })
          .html(optionsHtml);

        this.$form.prepend(this.$input);

        if ( !this.option.buttons ) {
          this.$form.delegate('select', 'blur', function() { _this.submit(); });
        }
      }
    }
  });

  function htmlUnescape(str) {
    return $('<div>').html(str).text();
  }
  function htmlEscape(str) {
    return $('<div>').text(str).html();
  }
  function createOptionsHtml(datas) {
    var _options = $.parseJSON(datas),
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
  }

  window.EIP = EIP;
}(jQuery));
