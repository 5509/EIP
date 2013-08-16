describe('EIP', function() {
  it('should be function', function() {
    expect(EIP).to.be.a(Function);
  });

  describe('.defineType()', function() {
    beforeEach(function() { EIP.defineType('foo', {}); });
    afterEach(function() { delete EIP.types.foo; });

    it('should add types', function() {
      expect(EIP.types.foo).to.be.a(Object);
    });
  });
});
