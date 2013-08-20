describe('types select', function() {
  var defaultValeu = 'A';
  var datalist = [
    ['', '--'],
    ['1', 'A'],
    ['2', 'A &amp; B'],
    ['3', '&lt;em&gt;foo&lt;/em&gt;'],
    ['4', '  foo\n   ']
  ];
  var data = JSON.stringify(datalist);
  var html, $eip, eip, $select;

  beforeEach(function() {
    html = 
      '<div ' +
        'data-eip-type="select" ' + 
        'data-eip-name="foo" ' + 
        "data-eip-datalist='" + data + "'>" +
        defaultValeu +
      '</div>';
    $eip = $(html).eip().appendTo('body');
    eip = $eip.data('eip');
    $select = eip.$form.find('select');
  });
  afterEach(function() {
    $eip.remove();
  });

  it('should has select element', function() {
    expect($select.length).to.be(1);
    expect($select.attr('name')).to.be('foo');
  });

  it('should has option element', function() {
    var $options = $select.find('option');
    expect($options.length).to.be(datalist.length);
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
      eip.$holder.click();
      expect($select.val()).to.be('1');
    });
  });

  context('when select empty', function() {
    it('should be $placeholder', function() {
      var $placeholder = $eip.data('eip').$placeholder;
      var html = $('<div>').append($placeholder).html();
      eip.$holder.click();
      $select.find('option').eq(0).attr('selected', true);
      eip.$form.submit();
      expect(eip.$holder.html()).to.be(html);
    });
  });

  context('when select A &amp; B and submit', function() {
    it('should be A &amp; B', function() {
      eip.$holder.click();
      $select.val('2');
      eip.$form.submit();
      expect(eip.$holder.html()).to.be('A &amp; B');
    });
  });

  context('when select &lt;em&gt;foo&lt;/em&gt; and submit', function() {
    it('should be &lt;em&gt;foo&lt;/em&gt;', function() {
      eip.$holder.click();
      $select.val('3');
      eip.$form.submit();
      expect(eip.$holder.html()).to.be('&lt;em&gt;foo&lt;/em&gt;');
    });
  });

  context('when default value is A &amp; B', function() {
    before(function() {
      defaultValeu = 'A &amp; B';
    });
    context('when show form', function() {
      it('should select 2', function() {
        eip.$holder.click();
        expect($select.val()).to.be('2');
      });
    });
  });

  context('when default value is " foo "', function() {
    before(function() {
      defaultValeu = ' foo ';
    });
    context('when show form', function() {
      it('should select 4', function() {
        eip.$holder.click();
        expect($select.val()).to.be('4');
      });
    });
  });
});
