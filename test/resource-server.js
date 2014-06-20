var Resource = require('../lib/Resource-server'),
    http = require('http'),
    should = require('should'),
    async = require('async');

function respondWith (code, body) {
    return function (req, res) {
        res.writeHead(code);

        if (body) {
            res.write(body);
        }

        res.end();
    };
}

describe('Resouce - server', function() {
    before(function (done) {
        var server = http.createServer(function (req, res) {
            var controller = respondWith(404);

            if (req.method === 'GET') {

                switch (req.url) {
                    case '/':
                        controller = respondWith(200, 'foo');
                    break;
                    case '/bar':
                        controller = respondWith(200, 'bar');
                    break;
                    case '/?test=foo':
                        controller = respondWith(200, 'Query used');
                    break;
                }

            } else if (req.method === 'POST') {

                switch (req.url) {
                    case '/':
                        controller = respondWith(200, 'Simple POST response');
                    break;
                    case '/with-payload':
                        var body = '';

                        controller = null;

                        req.on('data', function (data) {
                            body += data;

                            if (body.length > 1e6) { 
                                req.connection.destroy();
                            }
                        });
                        req.on('end', function () {
                            if (body === '{"foo":"bar"}') {
                                respondWith(200, 'Correct payload received')(req, res);
                            }
                        });
                    break;
                }

            } else if (req.method === 'PUT') {

                switch (req.url) {
                    case '/':
                        controller = respondWith(200, 'Simple PUT response');
                    break;
                }

            }

            if (controller) { controller(req, res); }
        });

        server.listen(3456);
        done();
    });

    it('instanciates without breaking', function () {
        should(function () {
            new Resource();
        }).not.throw();
    });

    it('works correctly with simple GET requests', function (done) {
        var resource = new Resource({
            method: 'get',
            route: 'http://localhost:3456'
        });

        resource.query()
        .then(function (res) {
            res.should.eql({
                status: 200,
                body: 'foo'
            });

            done();
        });
    });

    it('correctly compiles dynamic urls from given request data', function (done) {
        var resource = new Resource({
            method: 'get',
            route: 'http://localhost:3456/:fromParam'
        });

        resource.query({ fromParam: 'bar' })
        .then(function (res) {
            res.should.eql({
                status: 200,
                body: 'bar'
            });

            done();
        });
    });

    it('correctly handles negative responses in deferred-reject form', function (done) {
        var resource = new Resource({
            method: 'get',
            route: 'http://localhost:3456/doesnt-exist'
        });

        resource.query({ fromParam: 'bar' })
        .then(function () {
            done(new Error('Wrong callback executed'));
        }, function (res) {
            res.status.should.equal(404);
            done();
        });
    });

    it('correctly adds query params to request url', function (done) {
        var resource = new Resource({
            method: 'get',
            route: 'http://localhost:3456'
        });

        resource.query({}, { test: 'foo' })
        .then(function (res) {
            res.should.eql({
                status: 200,
                body: 'Query used'
            });

            done();
        });
    });

    it('correctly applies different methods', function (done) {
        var postResource = new Resource({
                method: 'post',
                route: 'http://localhost:3456'
            }),
            putResource = new Resource({
                method: 'put',
                route: 'http://localhost:3456'
            });

        async.series([
            function (callback) {
                postResource.query()
                .then(function (res) {
                    res.should.eql({
                        status: 200,
                        body: 'Simple POST response'
                    });

                    callback();
                });
            },
            function (callback) {
                putResource.query()
                .then(function (res) {
                    res.should.eql({
                        status: 200,
                        body: 'Simple PUT response'
                    });

                    callback();
                });
            },
        ], done);
    });

    it('correctly passes payload', function (done) {
        var resource = new Resource({
            method: 'post',
            route: 'http://localhost:3456/with-payload'
        });

        resource.query({ foo: 'bar' })
        .then(function (res) {
            res.should.eql({
                status: 200,
                body: 'Correct payload received'
            });

            done();
        });
    });

});