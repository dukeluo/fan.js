'use strict';

function Fan(executor) {
  this.state = 'pending';
  this.value = null;
  this.reason = null;
  this.pendingFulfilledHandlers = [];
  this.pendingRejectedHandlers = [];

  try {
    executor(onResolve.bind(this), onReject.bind(this));
  } catch (e) {
    onReject(e);
  }

  function onResolve(result) {
    if (this.state === 'pending') {
      this.state = 'fulfilled';
      this.value = result;
      this.pendingFulfilledHandlers.forEach(function (handler) {
        handler();
      });
    }
  }

  function onReject(result) {
    if (this.state === 'pending') {
      this.state = 'rejected';
      this.reason = result;
      this.pendingRejectedHandlers.forEach(function (handler) {
        handler();
      });
    }
  }
}

Fan.prototype.then = function (onFulfilled, onRejected) {
  var self = this;
  var promise2 = new Fan(function (resolve, reject) {
    if (self.state === 'fulfilled') {
      fulfilledHandler();
    } else if (self.state === 'rejected') {
      rejectedHandler();
    } else {
      self.pendingFulfilledHandlers.push(fulfilledHandler);
      self.pendingRejectedHandlers.push(rejectedHandler);
    }

    function fulfilledHandler() {
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
    }

    function rejectedHandler() {
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
    }
  });

  return promise2;

  function resolution(promise, x, resolve, reject) {
    if (x === promise) {
      reject(new TypeError('Chaining cycle detected!'));
    } else if (x instanceof Fan) {
      if (x.state === 'fulfilled') {
        resolution(promise, x.value, resolve, reject);
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
    } else if (
      (typeof x === 'object' && x !== null) ||
      typeof x === 'function'
    ) {
      try {
        var then = x.then;

        if (typeof then === 'function') {
          var firstCall = true;

          try {
            then.bind(x)(
              function (y) {
                if (firstCall) {
                  firstCall = false;
                  resolution(promise, y, resolve, reject);
                }
              },
              function (r) {
                if (firstCall) {
                  firstCall = false;
                  reject(r);
                }
              }
            );
          } catch (e) {
            if (firstCall) {
              reject(e);
            }
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
