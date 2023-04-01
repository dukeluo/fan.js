'use strict';

var Fan = require('./index');

module.exports = {
  deferred: function () {
    var pending = {};

    pending.promise = new Fan(function (resolve, reject) {
      pending.resolve = resolve;
      pending.reject = reject;
    });

    return pending;
  },
};
