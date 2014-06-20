## API Resource

> Simple promised wrapper for http resources for client-side JavaScript or Node.js

## Simple usage

```javascript
var Resource = require('api-resource');

var listUsers = new Resource({
        method: 'get',
        route: 'http://localhost/users/:group',
    }),
    createUser: new Resource({
        method: 'post',
        route: 'http://localhost/users',
    });

// Fires GET request to http://localhost/users/followers?q=foo
listUsers.query({ // Request payload + route variables
    group: 'followers'
}, { // Query params
    q: 'foo'
})
.then(function (res) {
    // Response code was successful (<= 200)
    var results = res.body;
}, function (res) {
    // Response code was not successful (> 200)
    throw new Error('Users list responded ' + res.status + ', ' + res.body);
})

// Fires GET request to http://localhost/users/followers?q=foo
createUser.query({ // Request payload + route variables
    username: 'johndoe'
})
.then(function (res) {
    var response = res;
});
```

## Middleware example

```javascript
var Resource = require('api-resource'),
    token = 'arbitrary-auth-token',
    session;

var sessionEndpoint = new Resource({
    method: 'get',
    route: 'http://localhost/session'
});

sessionEndpoint.use(function (req, next) {
    // Always add authorisation header to this resource
    req.setRequestHeader('Authorization', token);

    // Bind a callback to an event on this resource
    this.once('success', function (res) {
        console.log('Session received correctly');
    });
});

sessionEndpoint.query()
.then(function (res) {
    session = res.body;
});
```

## Resource

Resource instances are also event-emitters.
After querying them you can listen you can handle responses by using the promised form or by binding callbacks to their events.

#### Options

* `method` (*String*) Case insensitive HTTP method (E.g. `'post'`)
* `route` (*String*) Dynamic resource route (E.g. `'http://www.foo.bar/users/:username'`)

#### Events

* `response` Fired when a response is received, with a response object passed as argument
* `success` Fired when a successful response (Status <= 200) is received, with a response object passed as argument
* `failure` Fired when a unsuccessful response (Status > 200) is received, with a response object passed as argument
* `error` Fired when an error occurs sending the XMLHttpRequest, with the error passed as argument

#### Methods

`.query([ data ], [ query_params ])` Query endpoint. The values in the `data` object will also be used to build the URL if the resource route is dynamic. Query params will be added to the final URL as a query string.
`.use(middleware)` Add a middleware function to the resource. The function will be called on the `Resource` instance and receive as arguments the `XMLHttpRequest` request instance and the `next` function to proceed.

## Test

Tests are currently written on server-side only. Run `npm install` and `npm test` to test.

## Contribution

Contributions are welcome as long as documented and tested.

## License

Copyright (c) 2014 Kano Computing Ltd. - Released under the [MIT license](https://github.com/KanoComputing/js-api-resource/blob/master/LICENSE)