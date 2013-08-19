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
    this.type = Type.types[this.typeName] || Type.types['default'];
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
    this.$el.trigger('eip:submit');
    this.replaceToHolder();
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

  EIP.prototype.getAttrs = function() {
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


  function Type(name) {
    this.name = name;
    Type.types[this.name] = {};
  }

  Type.types = {};

  Type.prototype.on = function(eventName, fn) {
    Type.types[this.name][eventName] = fn;
    return this;
  };

  Type.prototype.extend = function(name) {
    $.extend(true, Type.types[this.name], Type.types[name]);
    return this;
  };

  EIP.defineType = function(name) {
    return new Type(name);
  };

  EIP.defineType('default')
    .on('init', function(eip) {
      var attrs = $.extend({
        type: eip.typeName || 'text',
        name: eip.data('name')
      }, eip.getAttrs());

      eip.$input = $('<input>').attr(attrs);
      eip.$form.prepend(eip.$input);
    })
    .on('renderHolder', function(eip) {
      var val = eip.$input.val();

      if (val) {
        eip.$holder.text(val);
      }
      else {
        eip.$holder.html(eip.$placeholder);
      }
    })
    .on('renderForm', function(eip) {
      var val = eip.$holder.text();
      eip.$input.val(val).focus();
    });

  EIP.defineType('textarea')
    .extend('default')
    .on('init', function(eip) {
      var attrs = $.extend({ name: eip.data('name') }, eip.getAttrs());
      eip.$input = $('<textarea>').attr(attrs);
      eip.$form.prepend(eip.$input);
    });

  EIP.defineType('select')
    .on('init', function(eip) {
      var $select = $('<select>');
      var datalist = $.parseJSON(eip.data('datalist'));
      $.each(datalist, function(i, val) {
        var key = val;
        if ($.isArray(val)) {
          key = val[0];
          val = val[1];
        }

        var $option = $('<option>').attr('value', key).text(val);
        $select.append($option);
      });

      var attrs = $.extend({ name: eip.data('name') }, eip.getAttrs());
      eip.$input = $select.attr(attrs);
      eip.$form.prepend(eip.$input);
    })
    .on('renderHolder', function(eip) {
      var $selected = eip.$el.find('option:selected');
      var text = $selected.text();

      if (text && $selected.attr('value')) {
        eip.$holder.text(text);
      }
      else {
        eip.$holder.html(eip.$placeholder);
      }
    })
    .on('renderForm', function(eip) {
      var val = eip.$holder.html();
      eip.$input.find('option').each(function() {
        var $option = $(this);
        if ($option.html() === val) {
          $option.attr('selected', true);
          return false;
        }
      });
    });

  EIP.defineType('radio')
    .on('init', function(eip) {
      var name = eip.data('name');
      var datalist = $.parseJSON(eip.data('datalist'));

      var $labels = $.map(datalist, function(val) {
        var key = val;
        if ($.isArray(val)) {
          key = val[0];
          val = val[1];
        }

        var attrs = $.extend({
          type: 'radio',
          name: name,
          value: key
        }, eip.getAttrs());

        var $input = $('<input>').attr(attrs);
        var $span = $('<span>').text(val);

        return $('<label>').append($input, $span);
      });

      eip.$form.prepend.apply(eip.$form, $labels);
    })
    .on('renderHolder', function(eip) {
      var text = eip.$form.find('input[type="radio"]:checked').closest('label').text();

      if (text) {
        eip.$holder.text(text);
      }
      else {
        eip.$holder.html(eip.$placeholder);
      }
    })
    .on('renderForm', function(eip) {
      var val = eip.$holder.html();
      eip.$form.find('label').each(function() {
        var $label = $(this);
        var $radio = $label.find('input[type="radio"]');
        if ($label.find('span').html() === val) {
          $radio.attr('checked', true);
          return false;
        }
      });
    });

  window.EIP = EIP;
}(jQuery));
