// Generated by CoffeeScript 1.7.1
(function() {
  var Cam, assert, serverMockup;

  assert = require('assert');

  Cam = require('../lib/onvif').Cam;

  serverMockup = require('./serverMockup');

  describe('Simple and common get functions', function() {
    var cam;
    cam = null;
    before(function(done) {
      return cam = new Cam({
        hostname: 'localhost',
        username: 'admin',
        password: '9999',
        port: 10101
      }, done);
    });
    describe('getSystemDateAndTime', function() {
      return it('should return valid date', function(done) {
        return cam.getSystemDateAndTime(function(err, data) {
          assert.equal(err, null);
          assert.ok(data instanceof Date);
          return done();
        });
      });
    });
    return describe('getServices', function() {
      return it('should return an array of services objects', function(done) {
        return cam.getServices(function(err, data) {
          assert.equal(err, null);
          assert.ok(Array.isArray(data));
          assert.ok(data.every(function(service) {
            return service.namespace && service.XAddr && service.version;
          }));
          return done();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=simple.map
