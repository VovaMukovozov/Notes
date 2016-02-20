'use strict';

// Utilities
var utils = {
    res: {
        error: function(res, data) {
            if (!res.locked) {

                // Defaults
                var status = 500,
                    message = 'Bad Request',
                    code = 0,
                    success = false,
                    reason = false;

                // Setup
                if (_.isString(data)) {
                    message = data;
                } else if (_.isPlainObject(data)) {
                    message = (data.message && !((_.isPlainObject(data.message) || _.isArray(data.message)) && _.isEmpty(data.message))) ? data.message : (_.isString(data.default)) ? data.default : message ;
                    code = (_.isNumber(data.code) && data.code) ? data.code : 0 ;
                    status = (_.isNumber(data.status) && data.status) ? data.status : 500 ;
                    reason = (data.reason) ? data.reason : false ;
                }

                // Building the response object
                var response = {}

                if (code) { response.code = code; }
                if (message) { response.message = message; }
                if (CONFIG.DEBUG && reason) { response.reason = reason; utils.log_error(reason); }
                if (CONFIG.DEBUG && !_.isUndefined(data) && !_.isUndefined(data.debug)) { response.debug = data.debug; }
                if (CONFIG.DEBUG && !_.isUndefined(data) && !_.isUndefined(data.log)) { utils.log_error(message, data.log); }

                res.locked = true;
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With');
                return res.status(status).json(response).end();
            }
        },
        empty: function(res, data) {
            if (!res.locked) {
                var response = {
                    data: []
                };

                if (!_.isUndefined(data) && !_.isUndefined(data.data)) { response = data.data; }
                if (!_.isUndefined(data) && !_.isUndefined(data.code)) { response.code = data.code; }
                if (!_.isUndefined(data) && !_.isUndefined(data.message)) { response.message = data.message; }
                if (CONFIG.DEBUG && !_.isUndefined(data) && !_.isUndefined(data.reason)) { response.reason = reason; }
                if (CONFIG.DEBUG && !_.isUndefined(data) && !_.isUndefined(data.debug)) { response.debug = data.debug; }
                if (CONFIG.DEBUG && !_.isUndefined(data) && !_.isUndefined(data.log)) { utils.log_error(message, data.log); }

                res.locked = true;
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With');
                return res.json(response).end();
            }
        },
        not_found: function(res, data) {
            if (!res.locked) {
                data = (_.isPlainObject(data)) ? data : { status: 404, message: 'Not Found' };
                data.status = 404;
                return utils.res.error(res, data);
            }
        },
        ok: function(res, data) {
            if (!res.locked) {
                res.locked = true;
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With');
                return res.json(data || {}).end();
            }
        },
        created: function(res, data) {
            if (!res.locked) {
                res.status(201);
                return utils.res.ok(res, data);
            }
        },
        deleted: function(res) {
            if (!res.locked) {
                res.status(200);
                return utils.res.ok(res, { deleted: true });
            }
        },
        success: function(res) {
            if (!res.locked) {
                res.status(200);
                return utils.res.ok(res, { success: true });
            }
        }
    },
    sanitize: {
        escape: function(req, schema) {
            _.forEach(schema, function(item) {
                if (req.body[item]) { req.body[item] = _.escape(_.trim(req.body[item])); }
            });
        },
        trim: function(req, schema) {
            _.forEach(schema, function(item) {
                if (req.body[item]) { req.body[item] = _.trim(req.body[item]); }
            });
        },
        boolean: function(req, schema) {
            _.forEach(schema, function(item) {
                if (req.body[item]) { req.body[item] = utils.format.boolean(req.body[item]); }
            });
        }
    },
    format: {
        map: function(schema, attrs) {
            _.forEach(schema, function(formats , item) {
                if (!_.isUndefined(attrs[item])) {
                    _.forEach(formats, function(format) {
                        switch (format) {
                            case 'unescape':
                            case 'integer':
                            case 'float':
                            case 'boolean':
                            case 'lowercase':
                            case 'twitter':
                            case 'timestamp':
                            case 'timestamp_utc':
                            case 'date':
                                attrs[item] = utils.format[format](attrs[item]);
                                break;
                            case 'not_null':
                                if(_.isNull(attrs[item]) || attrs[item] === 'null' || attrs[item] === ''){ attrs = _.omit(attrs, item); }
                                break;
                            case 'hidden':
                                attrs = _.omit(attrs, item);
                                break;
                        }
                    });
                }
            });

            return attrs;
        },
        unescape: function(value) {
            return _.unescape(value);
        },
        integer: function(value) {
            return (_.isNumber(value) || !_.isNaN(_.parseInt(value))) ? _.parseInt(value) : null;
        },
        float: function(value) {
            return (_.isNumber(value) || !_.isNaN(parseFloat(value))) ? parseFloat(value) : null;
        },
        boolean: function(value) {
            if (_.isString(value)) { return (value === '1' || value.toLowerCase() === 'true'); }
            if (_.isNumber(value)) { return (value === 1); }
            return (value);
        },
        date: function(value) {
            if (value == null) { return null; }
            var result = (_.isDate(value)) ? value : value;
            try { result = new Date(value).toString(); } catch (e) {}
            return result;
        },
        timestamp: function(value) {
            if (value == null) { return null; }
            var result = (_.isDate(value)) ? value : value;
            try { result = new Date(value).getTime(); } catch (e) {}
            return result;
        },
        timestamp_utc: function(value) {
            if (value == null) { return null; }
            var result = (_.isDate(value)) ? value : value;
            try {
                var result = new Date((new Date(value)).toUTCString()).getTime();
            } catch (e) {}
            return result;
        },
        lowercase: function(value) {
            return (_.isString(value)) ? value.toLowerCase() : value;
        },
        twitter: function(value) {
            return (_.isString(value)) ? '@' + value : value;
        }
    },
    keyBy: function(data, key) {
        var result = {};

        // Sort data by key
        _.forEach(data, function(item, index) {
            result[item[key]] = item;
        });

        return result;
    },
    pad: function(string, len, chars) {
        var len = (_.isNumber(len) & len > 0) ? len : 0,
            chars = (chars) ? chars.charAt(0) : ' ',
            pad = '';

        for (var i = len - 1; i >= 0; i--) {
            pad += chars;
        };

        return pad + string + pad;
    },
    log: function() {
        if (CONFIG.DEBUG) {
            var colors = require('colors/safe');

            _.forEach(arguments, function(record) {
                console.log(colors.bgYellow(colors.black('LOG:')), record);
            });
        }
    },
    log_error: function() {
        if (CONFIG.DEBUG) {
            var colors = require('colors/safe');

            _.forEach(arguments, function(record) {
                console.log(colors.bgRed(colors.white('ERROR:')), record);
            });
        }
    }
}

module.exports = utils;
