/**
 * EIP
 *
 * @version      1.2.0-beta
 * @author       nori (norimania@gmail.com)
 * @author       hokaccha (k.hokamura@gmail.com)
 * @copyright    5509 (http://5509.me/)
 * @license      The MIT License
 * @link         https://github.com/5509/skroll
 *
 * 2012-02-22 02:03
 */
;(function($, undefined) {

  $.fn.eip = function(option) {
    option = $.extend({
      defaultLabel: 'Click here to edit',
      submitLabel: 'Save',
      cancelLabel: 'Cancel',
      onsubmit: null
    }, option);

    return this.each(function() {
      new EIP($(this), option);
    });
  };

  EIP.MODE = {
    HOLDER: 1,
    FORM: 2
  };

  function EIP($el, option) {
    var self = this;

    this.$el = $el;
    this.option = option;
    this.typeName = this.$el.attr('data-eip');
    this.type = EIP.types[this.typeName] || EIP.types['default'];
    this.currentMode = EIP.MODE.HOLDER;

    this.$defaultLabel = $('<span>')
      .addClass('eip-default')
      .text(this.$el.attr('data-eip-default') || option.defaultLabel);
    this.$holder = $('<div>').addClass('eip-holder');
    this.$form = $('<form>').hide();

    if (this.$el.attr('data-eip-value') === undefined) {
      this.$el.attr('data-eip-value', this.type.getDefaultValue.call(this));
    }

    this.$save = $('<input type="submit">')
      .addClass('eip-save')
      .val(option.submitLabel);
    this.$cancel = $('<input type="button">')
      .addClass('eip-cancel')
      .val(option.cancelLabel);
    this.$buttons = $('<p>')
      .addClass('eip-buttons')
      .append(this.$save, this.$cancel);

    this.$form.append(this.$buttons);
    this.$holder.html(this.$el.html() || this.$defaultLabel);
    this.$el.empty().append(this.$holder, this.$form);

    this.$form.submit(function(e) {
      e.preventDefault();
      self.submit();
    });

    this.$cancel.click(function(e) {
      self.cancel();
    });

    this.$holder.click(function() {
      self.replaceToForm();
    });
  }
  EIP.prototype = {
    replaceToForm: function() {
      var self = this;

      this.currentMode = EIP.MODE.FORM;

      this.$el.addClass('eip-editing');
      this.$holder.css('display', 'none');
      this.$form.css('display', 'block');
      this.type.renderForm.call(this, this.$el.attr('data-eip-value'));

      // delay for buttons transition
      setTimeout(function() {
        self.$buttons.addClass('show');
      }, 0);
    },
    replaceToHolder: function() {
      var val = this.$el.attr('data-eip-value');

      this.currentMode = EIP.MODE.HOLDER;

      this.type.renderHolder.call(this, val);
      this.$buttons.removeClass('show');
      this.$el.removeClass('eip-editing').attr('data-eip-value', val);
      this.$holder.show();
      this.$form.hide();
    },
    submit: function() {
      var val = this.type.getFormValue.call(this);
      var name = this.$el.attr('data-eip-name');

      this.$el.attr('data-eip-value', val);
      this.replaceToHolder();

      if ( $.isFunction(this.option.onsubmit) ) {
        this.option.onsubmit.call(this, name, val);
      }
    },
    cancel: function() {
      this.replaceToHolder();
    },
    isHolderMode: function() {
      return this.currentMode === EIP.MODE.HOLDER;
    },
    isFormMode: function() {
      return this.currentMode === EIP.MODE.FORM;
    }
  };

  EIP.types = {};

  EIP.addType = function(typeName, funcs) {
    EIP.types[typeName] = $.extend({
      getDefaultValue: function() {
        return this.$el.html();
      },
      getFormValue: function() {
        return this.$input.val();
      }
    }, funcs);
  };

  EIP.addType('default', {
    renderHolder: function(val) {
      var html = val ? htmlEscape(val) : this.$defaultLabel;
      this.$holder.html(html);
    },
    renderForm: function(val) {
      if (!this.$input) {
        this.$input = $('<input>')
          .attr({
            type: this.typeName || 'text',
            name: this.$el.attr('data-eip-name')
          })
          .css('width', this.$el.width() - 20);

        this.$form.prepend(this.$input);
      }

      this.$input.val( htmlUnescape(val) ).focus();
    }
  });

  EIP.addType('textarea', {
    renderHolder: function(val) {
      var html = val.replace(/\n|\r/g, '<br/>') || this.$defaultLabel;
      this.$holder.html(html);
    },
    renderForm: function(val) {
      if (!this.$input) {
        this.$input = $('<textarea>')
          .attr('name', this.$el.attr('data-eip-name'))
          .css('width', this.$el.width() - 20);

        this.$form.prepend(this.$input);
      }

      this.$input.val( htmlUnescape(val) ).focus();
    }
  });

  EIP.addType('select', {
    getDefaultValue: function() {
      var html = this.$el.html();
      var options = $.parseJSON(this.$el.attr('data-eip-option'));
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
      var html = this.$el.find('option').filter(function() {
        return $(this).attr('value') === val;
      }).text() || this.$defaultLabel;

      this.$holder.html(html);
    },
    renderForm: function(val) {
      if (!this.$input) {
        var options = $.parseJSON(this.$el.attr('data-eip-option'));
        var isArray = $.isArray(options);
        var html = $.map(options, function(val, key) {
          if (isArray) {
            key = val;
          }
          return '<option value="' + key + '">' + val + '</option>';
        }).join('') || this.$defaultLabel;

        this.$input = $('<select>')
          .attr('name', this.$el.attr('data-eip-name'))
          .html(html);

        this.$form.prepend(this.$input);
      }

      this.$input.val(val);
    }
  });

  function htmlUnescape(str) {
    return $('<div>').html(str).text();
  }
  function htmlEscape(str) {
    return $('<div>').text(str).html();
  }

  window.EIP = EIP;
}(jQuery));
