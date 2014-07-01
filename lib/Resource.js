var Q = require('q'),
    qs = require('qs'),
    util = require('./util'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    async = require('async');

// Base Resource class

/*
Note: this class needs extending the prototype with a `_Request` class
property in order to work correctly (See ./Resource-browser.js and
./Resource-server.js)
*/

function Resource (options) {
    EventEmitter.call(this, { wildcard: true });

    options = options || {};

    this.method = options.method || 'get';
    this.route = options.route || '';
    this.middleware = [];
    this.properties = options.properties || {};

    return this;
}


// Extend from EventEmitter

Resource.prototype = Object.create(EventEmitter.prototype);

// Query method: fire a request on a Resource instance

Resource.prototype.query = function (values, query) {
    var ReqClass = this._Request,
        req = new ReqClass(),
        deferred = Q.defer(),
        url = util.compileRoute(this.route, values),
        self = this,
        payload;

    if (query) {
        url += '?' + qs.stringify(query);
    }

    req.open(this.method.toUpperCase(), url, true);

    req.options = {
        values: values || {},
        query: query || {}
    };

    async.mapSeries(this.middleware, function (fn, next) {
        fn.call(self, req, next);
    }, function (err) {
        if (err) { throw err; }

        payload = req.payload = util.formRequestPayload(req, values || {});

        self._sendReq(req, payload, deferred);
    });

    return deferred.promise;
};

// Use method: Add a middleware function to the Resource instance

Resource.prototype.use = function (fn) {
    this.middleware.push(fn);
};

// Private method that sends the request and handles callbacks

Resource.prototype._sendReq = function (req, payload, deferred) {
    var self = this;

    req.onload = function () {
        var body = util.parseIfJSON(this.response || this.responseText),
            res = {
                status: this.status,
                body: body
            };

        self.emit('response', {
            status: this.status,
            body: body
        });

        if (this.status <= 200) {
            self.emit('success', res);
            deferred.resolve(res);
        } else {
            self.emit('failure', res);
            deferred.reject(res);
        }
    };

    req.onerror = function (err) {
        self.emit('error', err);
    };

    req.send(payload);
};

module.exports = Resource;