describe('types radio', function() {
  var defaultValeu = 'A';
  var datalist = [
    ['1', 'A'],
    ['2', 'A &amp; B'],
    ['3', '&lt;em&gt;foo&lt;/em&gt;']
  ];
  var data = JSON.stringify(datalist);
  var html, $eip, $holder, $form, $radio, $span;

  beforeEach(function() {
    html = "<div data-eip-name='foo' data-eip-type='radio' data-eip-datalist='" + data + "'>" + defaultValeu + "</div>";
    $eip = $(html).eip().appendTo('body');
    $holder = $eip.find('.eip-holder');
    $form = $eip.find('form');
    $radio = $form.find('input[type="radio"]');
    $span = $form.find('label > span');
  });
  afterEach(function() {
    $eip.remove();
  });

  context('when show form', function() {
    beforeEach(function() {
      $holder.click();
    });
    it('should checked 1', function() {
      expect($radio.filter(':checked').val()).to.be('1');
    });

    it('should escaped', function() {
      expect($span.eq(1).html()).to.be('A &amp; B');
      expect($span.eq(2).html()).to.be('&lt;em&gt;foo&lt;/em&gt;');
    });
  });

  context('when no check', function() {
    it('should be $placeholder', function() {
      var $placeholder = $eip.data('eip').$placeholder;
      var html = $('<div>').append($placeholder).html();
      $holder.click();
      $radio.attr('checked', false);
      $form.submit();
      expect($holder.html()).to.be(html);
    });
  });

  context('when check A &amp; B and submit', function() {
    it('should be A &amp; B', function() {
      $holder.click();
      $radio.eq(1).attr('checked', true);
      $form.submit();
      expect($holder.html()).to.be('A &amp; B');
    });
  });

  context('when check &lt;em&gt;foo&lt;/em&gt; and submit', function() {
    it('should be &lt;em&gt;foo&lt;/em&gt;', function() {
      $holder.click();
      $radio.eq(2).attr('checked', true);
      $form.submit();
      expect($holder.html()).to.be('&lt;em&gt;foo&lt;/em&gt;');
    });
  });

  context('when default value is A &amp; B', function() {
    before(function() {
      defaultValeu = 'A &amp; B';
    });
    context('when show form', function() {
      it('should checked 2', function() {
        $holder.click();
        expect($radio.filter(':checked').val()).to.be('2');
      });
    });
  });
});
