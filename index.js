if (typeof window !== 'undefined') {
    module.exports = require('./lib/Resource-browser');
} else {
    module.exports = require('./lib/Resource-server');
}