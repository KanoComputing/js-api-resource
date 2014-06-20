var Resource = require('./Resource');

Resource.prototype._Request = XMLHttpRequest;

module.exports = Resource;