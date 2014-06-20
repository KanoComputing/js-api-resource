var Q = require('q'),
    qs = require('qs'),
    util = require('./util'),
    EventEmitter = require('eventemitter2').EventEmitter2,
    async = require('async');

function Resource (options) {
    EventEmitter.call(this, { wildcard: true });

    options = options || {};

    this.method = options.method || 'get';
    this.params = options.params || [];
    this.route = options.route || '';
    this.successEvent = options.successEvent || null;
    this.autoLogout = typeof options.autoLogout === 'undefined' ? true : options.autoLogout;
    this.middleware = [];
}

Resource.prototype = Object.create(EventEmitter.prototype);

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

    async.mapSeries(this.middleware, function (fn, next) {
        fn.call(self, req, next);
    }, function (err) {
        if (err) { throw err; }

        payload = util.formRequestPayload(req, values || {});

        self._sendReq(req, payload, deferred);
    });

    return deferred.promise;
};

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
            body: body,
            autoLogout: self.autoLogout
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
        throw err;
    };

    req.send(payload);
};

Resource.prototype.use = function (fn) {
    this.middleware.push(fn);
};

module.exports = Resource;