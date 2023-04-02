'use strict';

function Fan(executor) {
  this.state = 'pending';
  this.value = null;
  this.reason = null;
  this.pendingHandlers = [];

  try {
    executor(onResolve.bind(this), onReject.bind(this));
  } catch (e) {
    onReject(e);
  }

  function onResolve(result) {
    var self = this;

    if (self.state === 'pending') {
      self.state = 'fulfilled';
      self.value = result;
      setTimeout(function () {
        self.pendingHandlers.forEach(function (handler) {
          handler.onFulfilledHandler();
        });
      }, 0);
    }
  }

  function onReject(result) {
    var self = this;

    if (self.state === 'pending') {
      self.state = 'rejected';
      self.reason = result;
      setTimeout(function () {
        self.pendingHandlers.forEach(function (handler) {
          handler.onRejectedHandler();
        });
      }, 0);
    }
  }
}

Fan.prototype.then = function (onFulfilled, onRejected) {
  var self = this;
  var promise2 = new Fan(function (resolve, reject) {
    if (self.state === 'fulfilled') {
      if (typeof onFulfilled === 'function') {
        setTimeout(function () {
          try {
            var x = onFulfilled(self.value);
            resolution(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        resolve(self.value);
      }
    } else if (self.state === 'rejected') {
      if (typeof onRejected === 'function') {
        setTimeout(function () {
          try {
            var x = onRejected(self.reason);
            resolution(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        reject(self.reason);
      }
    } else {
      function onFulfilledHandler() {
        if (typeof onFulfilled === 'function') {
          try {
            var x = onFulfilled(self.value);
            resolution(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        } else {
          resolve(self.value);
        }
      }

      function onRejectedHandler() {
        if (typeof onRejected === 'function') {
          try {
            var x = onRejected(self.reason);
            resolution(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(self.reason);
        }
      }

      self.pendingHandlers.push({
        onFulfilledHandler: onFulfilledHandler,
        onRejectedHandler: onRejectedHandler,
      });
    }
  });

  return promise2;

  function resolution(promise, x, resolve, reject) {
    if (x === promise) {
      reject(new TypeError('Chaining cycle detected!'));
    } else if (x instanceof Fan) {
      if (x.state === 'fulfilled') {
        resolve(x.value);
      } else if (x.state === 'rejected') {
        reject(x.reason);
      } else {
        x.then(
          function (value) {
            resolution(promise, value, resolve, reject);
          },
          function (reason) {
            reject(reason);
          }
        );
      }
    } else if (typeof x === 'object' || typeof x === 'function') {
      try {
        var then = x.then;

        if (typeof then === 'function') {
          try {
            then.bind(x)(
              function (y) {
                resolution(promise, y, resolve, reject);
              },
              function (r) {
                reject(r);
              }
            );
          } catch (e) {
            reject(e);
          }
        } else {
          resolve(x);
        }
      } catch (e) {
        reject(e);
      }
    } else {
      resolve(x);
    }
  }
};

module.exports = Fan;
