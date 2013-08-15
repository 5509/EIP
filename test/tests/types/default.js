describe('types default', function() {
  var html, $eip;

  context('when only data-eip-name', function() {
    beforeEach(function() {
      html = '<div data-eip-name="foo"></div>';
      $eip = $(html).eip().appendTo('body');
    });
    afterEach(function() {
      $eip.remove();
    });

    it('should has form', function() {
      var $form = $eip.children('form');
      expect($form.length).to.be(1);
      expect($form.is(':visible')).to.be(false);
    });
    
    it('should has .eip-holder', function() {
      var $holder = $eip.children('.eip-holder');
      expect($holder.length).to.be(1);
      expect($holder.is(':visible')).to.be(true);
    });

    it('should has default text', function() {
      var $default = $eip.find('.eip-holder > .eip-default');
      expect($default.length).to.be(1);
      expect($default.is(':visible')).to.be(true);
      expect($default.text()).to.be('Click here to edit');
    });

    context('when clicked $holder', function() {
      beforeEach(function() {
        $eip.find('.eip-holder').click();
      });

      it('form should visible', function() {
        var $form = $eip.children('form');
        expect($form.length).to.be(1);
        expect($form.is(':visible')).to.be(true);
      });

      it('holder should not visible', function() {
        var $holder = $eip.children('.eip-holder');
        expect($holder.is(':visible')).to.be(false);
      });

      it('should has <input type="text" name="foo">', function() {
        var $input = $eip.find('input[type="text"]');
        expect($input.attr('name')).to.be('foo');
      });
    });

    context('when submit', function() {
      beforeEach(function() {
        $eip.click();
        $eip.find('input[name="foo"]').val('value!');
        $eip.find('form').submit();
      });

      it('form should not visible', function() {
        var $form = $eip.children('form');
        expect($form.is(':visible')).to.be(false);
      });

      it('holder should visible', function() {
        var $holder = $eip.children('.eip-holder');
        expect($holder.is(':visible')).to.be(true);
      });

      it('holder HTML should be submitted value', function() {
        var $holder = $eip.find('.eip-holder');
        expect($holder.html()).to.be('value!');
      });
    });
  });
});
