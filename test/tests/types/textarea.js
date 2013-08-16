describe('type textarea', function() {
  var html, $eip;

  beforeEach(function() {
    html = '\
    <div data-eip-type="textarea" data-eip-name="bar">\
foo&lt;em&gt;bar&lt;/em&gt;&lt;br&gt;\n\
hoge\n\
fuga</div>\
    ';
    $eip = $(html).eip().appendTo('body');
  });
  afterEach(function() {
    $eip.remove();
  });

  it('value should be unescaped', function() {
    var $holder = $eip.find('.eip-holder');
    $holder.click();

    var $textarea = $eip.find('textarea');
    var val = $textarea.val();

    expect(val).to.be('foo<em>bar</em><br>\nhoge\nfuga');
  });

  it('holder html should be escaped', function() {
    var $holder = $eip.find('.eip-holder');
    $holder.click();

    $eip.find('textarea').val('foo<del>bar</del>\nhoge');
    $eip.find('form').submit();

    var val = $holder.html();
    expect(val).to.be('foo&lt;del&gt;bar&lt;/del&gt;\nhoge');
  });
});
