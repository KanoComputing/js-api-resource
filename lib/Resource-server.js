var Resource = require('./Resource'),
    request = require('xmlhttprequest').XMLHttpRequest;

Resource.prototype._Request = request;

module.exports = Resource;