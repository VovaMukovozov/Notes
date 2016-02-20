'use strict';

var fs = require('fs-extra'),
	path = require('path');

var defaults = {
	NAME: 'NOTE API',
	VERSION: '',
	URL: 'http://localhost:3000',
	APP_URL: 'http://localhost:3000/#',

	DB: {
		client: 'mysql',
		connection: {
			host: 'localhost',
			user: '',
			password: '',
			database: ''
		},
		dump: 'mysqldump'
	},

	options: {},

	BACKGROUND_TASKS: true,
	ASSETS_PATH: 'assets',
	DEBUG: false
}

var pack = require(path.join(BASE_PATH, 'package.json'));
if (pack && pack.version) {
	defaults.VERSION = pack.version
}

// Load environment config file
if (fs.existsSync(path.join(BASE_PATH, 'config', app.get('env') + '.js'))){
	module.exports = _.defaults(require(path.join(BASE_PATH, 'config', app.get('env'))), defaults);
} else {
	module.exports = defaults;
}
