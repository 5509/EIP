describe('types select', function() {
  var defaultValeu = 'A';
  var datalist = [
    ['', '--'],
    ['1', 'A'],
    ['2', 'A &amp; B'],
    ['3', '&lt;em&gt;foo&lt;/em&gt;']
  ];
  var data = JSON.stringify(datalist);
  var html, $eip, $holder, $form, $select;

  beforeEach(function() {
    html = "<div data-eip-type='select' data-eip-datalist='" + data + "'>" + defaultValeu + "</div>";
    $eip = $(html).eip().appendTo('body');
    $holder = $eip.find('.eip-holder');
    $form = $eip.find('form');
    $select = $form.find('select');
  });
  afterEach(function() {
    $eip.remove();
  });

  describe('form values', function() {
    it('should escaped', function() {
      var $options = $select.find('option');
      expect($options.eq(2).html()).to.be('A &amp; B');
      expect($options.eq(3).html()).to.be('&lt;em&gt;foo&lt;/em&gt;');
    });
  });

  context('when show form', function() {
    it('should select 1', function() {
      $holder.click();
      expect($select.val()).to.be('1');
    });
  });

  context('when select empty', function() {
    it('should be $placeholder', function() {
      var $placeholder = $eip.data('eip').$placeholder;
      var html = $('<div>').append($placeholder).html();
      $holder.click();
      $select.find('option').eq(0).attr('selected', true);
      $form.submit();
      expect($holder.html()).to.be(html);
    });
  });

  context('when select A &amp; B and submit', function() {
    it('should be A &amp; B', function() {
      $holder.click();
      $select.val('2');
      $form.submit();
      expect($holder.html()).to.be('A &amp; B');
    });
  });

  context('when select &lt;em&gt;foo&lt;/em&gt; and submit', function() {
    it('should be &lt;em&gt;foo&lt;/em&gt;', function() {
      $holder.click();
      $select.val('3');
      $form.submit();
      expect($holder.html()).to.be('&lt;em&gt;foo&lt;/em&gt;');
    });
  });

  context('when default value is A &amp; B', function() {
    before(function() {
      defaultValeu = 'A &amp; B';
    });
    context('when show form', function() {
      it('should select 2', function() {
        $holder.click();
        expect($select.val()).to.be('2');
      });
    });
  });
});
