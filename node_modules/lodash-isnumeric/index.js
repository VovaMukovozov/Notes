module.exports = {
	isNumeric: function isNumeric(value) {
		if (typeof value === 'number') return true;
		var str = (value || '').toString();
		if (!str) return false;
		return !isNaN(str);
	},
};
