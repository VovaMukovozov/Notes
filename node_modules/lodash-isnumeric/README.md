lodash-isnumeric
================
Lodash mixin to return a boolean if a value looks numeric.

	var _ = require('lodash')
		.mixin(require('lodash-isnumeric'));


	_.isNumeric(123); // true
	_.isNumeric('123'); // true
	_.isNumeric('123.123'); // true

	_.isNumeric('123px'); // false
	_.isNumeric('#123'); // false
