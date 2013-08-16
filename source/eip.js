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
 */
;(function($, undefined) {

  $.fn.eip = function(option) {
    option = $.extend({
      placeholder: 'Click here to edit',
      submitLabel: 'Save',
      cancelLabel: 'Cancel'
    }, option);

    return this.each(function() {
      new EIP($(this), option);
    });
  };

  var STATE = {
    VIEW: 1,
    EDIT: 2
  };

  function EIP($el, option) {
    this.$el = $el;
    this.option = option;
    this.typeName = this.data('type');
    this.type = EIP.types[this.typeName] || EIP.types['default'];
    this.currentState = STATE.VIEW;

    this._initHolder();
    this._initForm();
    this.type.init.call(this);

    this.$el.empty().append(this.$holder, this.$form);
    this.$el.data('eip', this);
  }
  EIP.prototype = {
    _initHolder: function() {
      var self = this;

      var ph = this.data('placeholder') || this.option.placeholder;

      this.$placeholder = $('<span>').addClass('eip-placeholder').text(ph);
      this.$holder = $('<div>').addClass('eip-holder');
      this.$holder.html(this.$el.html() || this.$placeholder);

      this.$holder.click(function() {
        self.replaceToForm();
      });
    },
    _initForm: function() {
      var self = this;

      this.$form = $('<form>').hide();
      this.$save = $('<input type="submit">')
        .addClass('eip-save')
        .val(this.option.submitLabel);
      this.$cancel = $('<input type="button">')
        .addClass('eip-cancel')
        .val(this.option.cancelLabel);
      this.$buttons = $('<div>')
        .addClass('eip-buttons')
        .append(this.$save, this.$cancel);
      this.$form.append(this.$buttons);

      this.$form.submit(function(e) {
        e.preventDefault();
        self.submit();
      });

      this.$cancel.click(function(e) {
        self.cancel();
      });
    },
    replaceToForm: function() {
      var self = this;

      this.changeStateToEdit();
      this.$holder.hide();
      this.$form.show();

      // delay for buttons transition
      setTimeout(function() {
        self.$buttons.addClass('eip-buttons-show');
      }, 0);

      this.type.renderForm.call(this);
    },
    replaceToHolder: function(cancel) {
      this.changeStateToView();
      this.$form.hide();
      this.$holder.show();
      this.$buttons.removeClass('eip-buttons-show');

      if (!cancel) {
        this.type.renderHolder.call(this);
      }
    },
    submit: function() {
      this.$el.trigger('eip:submit');
      this.replaceToHolder();
    },
    cancel: function() {
      this.replaceToHolder(true);
    },
    changeStateToEdit: function() {
      this.currentState = STATE.VIEW;
    },
    changeStateToView: function() {
      this.currentState = STATE.EDIT;
    },
    isViewState: function() {
      return this.currentState === STATE.VIEW;
    },
    isEditState: function() {
      return this.currentState === STATE.EDIT;
    },
    data: function(name, val) {
      return this.$el.attr('data-eip-' + name);
    }
  };

  EIP.types = {};

  EIP.addType = function(typeName, funcs) {
    EIP.types[typeName] = funcs;
  };

  EIP.addType('default', {
    init: function() {
      this.$input = $('<input>')
        .attr({
          type: this.typeName || 'text',
          name: this.data('name')
        });

      this.$form.prepend(this.$input);
    },
    renderHolder: function() {
      var val = this.$input.val();
      var html = val ? htmlEscape(val) : this.$placeholder;
      this.$holder.html(html);
    },
    renderForm: function() {
      var val = this.$holder.html();
      this.$input.val(htmlUnescape(val)).focus();
    }
  });

  EIP.addType('textarea', {
    init: function() {
      this.$input = $('<textarea>').attr('name', this.data('name'));
      this.$form.prepend(this.$input);
    },
    renderHolder: function() {
      var val = this.$input.val();
      var html = val ? val.replace(/\n|\r/g, '<br/>') : this.$placeholder;
      this.$holder.html(html);
    },
    renderForm: function() {
      var val = this.$holder.html();
      this.$input.val(htmlUnescape(val)).focus();
    }
  });

  EIP.addType('select', {
    init: function() {
      var options = $.parseJSON(this.data('option'));
      var isArray = $.isArray(options);
      var html = $.map(options, function(val, key) {
        if (isArray) {
          key = val;
        }
        return '<option value="' + key + '">' + val + '</option>';
      }).join('') || this.$placeholder;

      this.$input = $('<select>')
        .attr('name', this.data('name'))
        .html(html);

      this.$form.prepend(this.$input);
    },
    renderHolder: function() {
      var val = this.$input.val();
      var html = this.$el.find('option').filter(function() {
        return $(this).attr('value') === val;
      }).text() || this.$placeholder;

      this.$holder.html(html);
    },
    renderForm: function() {
      var val = this.$holder.html();
      this.$input.find('option').each(function() {
        var $option = $(this);
        if ($option.html() === val) {
          $option.attr('selected', true);
          return false;
        }
      });
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
