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
  var RE_DATA_ATTR = /^data-eip-attr-(.+)$/;

  function EIP($el, option) {
    this.$el = $el;
    this.option = option;
    this.typeName = this.data('type');
    this.type = EIP.types[this.typeName] || EIP.types['default'];
    this.currentState = STATE.VIEW;

    this._initHolder();
    this._initForm();
    this.type.init(this);

    this.$el.empty().append(this.$holder, this.$form);
    this.$el.data('eip', this);
  }

  EIP.prototype._initHolder = function() {
    var self = this;

    var ph = this.data('placeholder') || this.option.placeholder;

    this.$placeholder = $('<span>').addClass('eip-placeholder').text(ph);
    this.$holder = $('<div>').addClass('eip-holder');
    this.$holder.html(this.$el.html() || this.$placeholder);

    this.$holder.click(function() {
      self.replaceToForm();
    });
  };

  EIP.prototype._initForm = function() {
    var self = this;

    this.$form = $('<form>').addClass('eip-form').hide();
    this.$input = $('<div>').addClass('eip-input');
    this.$save = $('<input type="submit">')
      .addClass('eip-save')
      .val(this.option.submitLabel);
    this.$cancel = $('<input type="button">')
      .addClass('eip-cancel')
      .val(this.option.cancelLabel);
    this.$buttons = $('<div>')
      .addClass('eip-buttons')
      .append(this.$save, this.$cancel);

    this.$form.submit(function(e) {
      e.preventDefault();
      self.submit();
    });

    this.$cancel.click(function(e) {
      self.cancel();
    });

    this.$form.append(this.$input, this.$buttons);
  };

  EIP.prototype.replaceToForm = function() {
    var self = this;

    this.changeStateToEdit();
    this.$holder.hide();
    this.$form.show();

    // delay for buttons transition
    setTimeout(function() {
      self.$buttons.addClass('eip-buttons-show');
    }, 0);

    this.type.renderForm(this);
  };

  EIP.prototype.replaceToHolder = function(cancel) {
    this.changeStateToView();
    this.$form.hide();
    this.$holder.show();
    this.$buttons.removeClass('eip-buttons-show');

    if (!cancel) {
      this.type.renderHolder(this);
    }
  };

  EIP.prototype.submit = function() {
    var event = $.Event('eip:submit');
    this.$el.trigger(event);

    if (!event.isDefaultPrevented()) {
      this.replaceToHolder();
    }
  };

  EIP.prototype.cancel = function() {
    this.replaceToHolder(true);
  };

  EIP.prototype.changeStateToEdit = function() {
    this.currentState = STATE.VIEW;
  };

  EIP.prototype.changeStateToView = function() {
    this.currentState = STATE.EDIT;
  };

  EIP.prototype.isViewState = function() {
    return this.currentState === STATE.VIEW;
  };

  EIP.prototype.isEditState = function() {
    return this.currentState === STATE.EDIT;
  };

  EIP.prototype.data = function(name, val) {
    return this.$el.attr('data-eip-' + name);
  };

  EIP.prototype.getInputAttrs = function(attrs) {
    var name = this.data('name');

    return $.extend({ name: name }, this.getDataAttrs(), attrs);
  };

  EIP.prototype.getDataAttrs = function() {
    var ret = {};
    var attrs = this.$el.get(0).attributes;
    var attr, name, m;
    for (var i = 0, len = attrs.length; i < len; i++) {
      attr = attrs[i];
      name = attr.name;
      m = name.match(RE_DATA_ATTR);
      if (m) {
        ret[m[1]] = attr.value;
      }
    }
    return ret;
  };

  EIP.prototype.setHolder = function(val) {
    if (val) {
      this.$holder.text(val);
    }
    else {
      this.$holder.html(this.$placeholder);
    }
  };

  EIP.prototype.eachDatalist = function(fn) {
    var datalist = $.parseJSON(this.data('datalist'));
    $.each(datalist, function(i, val) {
      var key = val;

      if ($.isArray(val)) {
        key = val[0];
        val = val[1];
      }

      fn(key, val);
    });
  };


  EIP.types = {};

  EIP.defineType = function(name, funcs) {
    EIP.types[name] = funcs;
  };

  EIP.defineType('default', {
    init: function(eip) {
      var attrs = eip.getInputAttrs({ type: eip.typeName || 'text' });
      eip.$input.append($('<input>').attr(attrs));
    },
    renderHolder: function(eip) {
      var val = eip.$input.find('input').val();
      eip.setHolder(val);
    },
    renderForm: function(eip) {
      var val = eip.$holder.text();
      eip.$input.find('input').val(val).focus();
    }
  });

  EIP.defineType('textarea', {
    init: function(eip) {
      var attrs = eip.getInputAttrs();
      eip.$input.append($('<textarea>').attr(attrs));
    },
    renderHolder: function(eip) {
      var val = eip.$input.find('textarea').val();
      eip.setHolder(val);
    },
    renderForm: function(eip) {
      var val = eip.$holder.text();
      eip.$input.find('textarea').val(val).focus();
    }
  });

  EIP.defineType('select', {
    init: function(eip) {
      var attrs = eip.getInputAttrs();
      var $select = $('<select>').attr(attrs);

      eip.eachDatalist(function(key, val) {
        var $option = $('<option>').attr('value', key).text(val);
        $select.append($option);
      });

      eip.$input.append($select);
    },
    renderHolder: function(eip) {
      var $selected = eip.$input.find('option:selected');
      var text = $selected.text();

      if (!$selected.attr('value')) {
        text = null;
      }

      eip.setHolder(text);
    },
    renderForm: function(eip) {
      var val = eip.$holder.html();
      eip.$input.find('option').each(function() {
        var $option = $(this);
        if ($.trim($option.html()) === $.trim(val)) {
          $option.attr('selected', true);
          return false;
        }
      });
    }
  });

  EIP.defineType('radio', {
    init: function(eip) {
      eip.eachDatalist(function(key, val) {
        var attrs = eip.getInputAttrs({ type: 'radio', value: key });
        var $input = $('<input>').attr(attrs);
        var $span = $('<span>').text(val);
        var $label = $('<label>').append($input, $span);

        eip.$input.append($label);
      });
    },
    renderHolder: function(eip) {
      var $checked = eip.$input.find('input[type="radio"]:checked');
      var val = $checked.closest('label').text();

      eip.setHolder(val);
    },
    renderForm: function(eip) {
      var val = eip.$holder.html();
      eip.$input.find('label').each(function() {
        var $label = $(this);
        var $radio = $label.find('input[type="radio"]');
        if ($.trim($label.find('span').html()) === $.trim(val)) {
          $radio.attr('checked', true);
          return false;
        }
      });
    }
  });

  window.EIP = EIP;
}(jQuery));
