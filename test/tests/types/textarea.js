describe('type textarea', function() {
  var html, $eip, eip;

  beforeEach(function() {
    html =
      '<div data-eip-type="textarea" data-eip-name="foo">' +
        'foo&lt;em&gt;bar&lt;/em&gt;&lt;br&gt;\n' +
        'hoge\n' +
        'fuga' +
      '</div>';
    $eip = $(html).eip().appendTo('body');
    eip = $eip.data('eip');
  });
  afterEach(function() {
    $eip.remove();
  });

  it('should has <textarea>', function() {
    var $textarea = eip.$input.find('textarea');
    expect($textarea.length).to.be(1);
    expect($textarea.attr('name')).to.be('foo');
  });

  it('value should be unescaped', function() {
    eip.$holder.click();

    var $textarea = eip.$input.find('textarea');
    var val = $textarea.val();

    expect(val).to.be('foo<em>bar</em><br>\nhoge\nfuga');
  });

  it('holder html should be escaped', function() {
    eip.$holder.click();

    eip.$input.find('textarea').val('foo<del>bar</del>\nhoge');
    eip.$form.submit();

    var val = eip.$holder.html();
    expect(val).to.be('foo&lt;del&gt;bar&lt;/del&gt;\nhoge');
  });
});
