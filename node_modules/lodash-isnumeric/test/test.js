var _ = require('lodash').mixin(require('..'));
var expect = require('chai').expect;

describe('Number type', function() {
	it('should return true if its already a number type', function() {
		expect(_.isNumeric(0)).to.be.true;
		expect(_.isNumeric(2)).to.be.true;
		expect(_.isNumeric(17)).to.be.true;
		expect(_.isNumeric(+17)).to.be.true;
		expect(_.isNumeric(-17)).to.be.true;
		expect(_.isNumeric(-0)).to.be.true;
		expect(_.isNumeric(.0)).to.be.true;
		expect(_.isNumeric(.17)).to.be.true;
		expect(_.isNumeric(-.17)).to.be.true;
		expect(_.isNumeric(1e17)).to.be.true;
		expect(_.isNumeric(1e-17)).to.be.true;
		expect(_.isNumeric(Infinity)).to.be.true;
		expect(_.isNumeric(-Infinity)).to.be.true;
		expect(_.isNumeric(new Number('123'))).to.be.true;
	});

	it('should return true if its a string that looks like a number', function() {
		expect(_.isNumeric(new String('1337'))).to.be.true;
		expect(_.isNumeric('1337')).to.be.true;
		expect(_.isNumeric('-1337')).to.be.true;
		expect(_.isNumeric('1337.17')).to.be.true;
		expect(_.isNumeric('-1337.17')).to.be.true;
		expect(_.isNumeric('0017')).to.be.true;
		expect(_.isNumeric('00000.017')).to.be.true;
	});

	it('should return false if its a string does not look like a number', function() {
		expect(_.isNumeric('abc')).to.be.false;
		expect(_.isNumeric('6qwerty0')).to.be.false;
		expect(_.isNumeric('17%')).to.be.false;
		expect(_.isNumeric('-17%')).to.be.false;
		expect(_.isNumeric('#17')).to.be.false;
		expect(_.isNumeric('2^18')).to.be.false;
		expect(_.isNumeric('17px')).to.be.false;
		expect(_.isNumeric('*')).to.be.false;
		expect(_.isNumeric('')).to.be.false;
		expect(_.isNumeric(true)).to.be.false;
		expect(_.isNumeric(false)).to.be.false;
		expect(_.isNumeric([])).to.be.false;
		expect(_.isNumeric({})).to.be.false;
		expect(_.isNumeric(function(){})).to.be.false;
		expect(_.isNumeric(undefined)).to.be.false;
		expect(_.isNumeric(null)).to.be.false;
	});
});
