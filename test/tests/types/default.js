describe('types default', function() {
  var html, $eip, eip;
  afterEach(function() {
    $eip.remove();
  });

  context('when only data-eip-name', function() {
    beforeEach(function() {
      html = '<div data-eip-name="foo"></div>';
      $eip = $(html).eip().appendTo('body');
      eip = $eip.data('eip');
    });

    it('should has form', function() {
      var $form = $eip.children('form');
      expect($form.length).to.be(1);
      expect($form.is(':visible')).to.be(false);
    });

    it('should has .eip-input', function() {
      var $input = eip.$form.find('.eip-input');
      expect($input.length).to.be(1);
    });
    
    it('should has .eip-holder', function() {
      var $holder = $eip.children('.eip-holder');
      expect($holder.length).to.be(1);
      expect($holder.is(':visible')).to.be(true);
    });

    it('should has default text', function() {
      var $default = $eip.find('.eip-holder > .eip-placeholder');
      expect($default.length).to.be(1);
      expect($default.is(':visible')).to.be(true);
      expect($default.text()).to.be('Click here to edit');
    });

    context('when clicked $holder', function() {
      beforeEach(function() {
        eip.$holder.click();
      });

      it('form should visible', function() {
        expect(eip.$form.length).to.be(1);
        expect(eip.$form.is(':visible')).to.be(true);
      });

      it('holder should not visible', function() {
        expect(eip.$holder.is(':visible')).to.be(false);
      });

      it('should has <input type="text" name="foo">', function() {
        var $input = eip.$input.find('input[type="text"]');
        expect($input.attr('name')).to.be('foo');
      });
    });

    context('when submit', function() {
      beforeEach(function() {
        eip.$holder.click();
        eip.$input.find('input[name="foo"]').val('value!');
        eip.$form.submit();
      });

      it('form should not visible', function() {
        expect(eip.$form.is(':visible')).to.be(false);
      });

      it('holder should visible', function() {
        expect(eip.$holder.is(':visible')).to.be(true);
      });

      it('holder HTML should be submitted value', function() {
        expect(eip.$holder.html()).to.be('value!');
      });
    });
  });

  context('set data-eip-attr-*', function() {
    beforeEach(function() {
      html = 
        '<div ' +
          'data-eip-attr-maxlength="3"' +
          'data-eip-attr-foo="bar">' +
          'data-eip-a="b">' +
        '</div>';
      $eip = $(html).eip().appendTo('body');
      eip = $eip.data('eip');
    });

    it('should set attribute in input element', function() {
      var $input = eip.$input.find('input[type="text"]');
      expect($input.attr('maxlength')).to.be('3');
      expect($input.attr('foo')).to.be('bar');
      expect($input.attr('a')).to.be(undefined);
    });
  });
});
