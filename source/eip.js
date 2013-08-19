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
    this.type = Type.types[this.typeName] || Type.types['text'];
    this.currentState = STATE.VIEW;

    this._initHolder();
    this._initForm();
    this.type.init.call(this);

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

    this.type.renderForm.call(this);
  };

  EIP.prototype.replaceToHolder = function(cancel) {
    this.changeStateToView();
    this.$form.hide();
    this.$holder.show();
    this.$buttons.removeClass('eip-buttons-show');

    if (!cancel) {
      this.type.renderHolder.call(this);
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

  EIP.defineType('text')
    .on('init', function() {
      this.$input = $('<input>')
        .attr({
          type: this.typeName || 'text',
          name: this.data('name')
        });

      this.$form.prepend(this.$input);
    })
    .on('renderHolder', function() {
      var val = this.$input.val();

      if (val) {
        this.$holder.text(val);
      }
      else {
        this.$holder.html(this.$placeholder);
      }
    })
    .on('renderForm', function() {
      var val = this.$holder.text();
      this.$input.val(val).focus();
    });

  EIP.defineType('textarea')
    .extend('text')
    .on('init', function() {
      this.$input = $('<textarea>').attr('name', this.data('name'));
      this.$form.prepend(this.$input);
    });

  EIP.defineType('select')
    .on('init', function() {
      var datalist = $.parseJSON(this.data('datalist'));
      var options = $.map(datalist, function(val) {
        var key = val;
        if ($.isArray(val)) {
          key = val[0];
          val = val[1];
        }
        return '<option value="' + key + '">' + val + '</option>';
      }).join('');

      this.$input = $('<select>')
        .attr('name', this.data('name'))
        .html(options);

      this.$form.prepend(this.$input);
    })
    .on('renderHolder', function() {
      var val = this.$input.val();
      var html = this.$el.find('option').filter(function() {
        return $(this).attr('value') === val;
      }).text() || this.$placeholder;

      this.$holder.html(html);
    })
    .on('renderForm', function() {
      var val = this.$holder.html();
      this.$input.find('option').each(function() {
        var $option = $(this);
        if ($option.html() === val) {
          $option.attr('selected', true);
          return false;
        }
      });
    });

  window.EIP = EIP;
}(jQuery));
