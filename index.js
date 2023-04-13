'use strict';

function Fan(executor) {
  var state = 'pending';
  var value = null;
  var reason = null;
  var pendingFulfilledHandlers = [];
  var pendingRejectedHandlers = [];

  try {
    executor(onResolve, onReject);
  } catch (e) {
    onReject(e);
  }

  function onResolve(result) {
    if (state === 'pending') {
      state = 'fulfilled';
      value = result;
      pendingFulfilledHandlers.forEach(function (handler) {
        handler();
      });
    }
  }

  function onReject(result) {
    if (state === 'pending') {
      state = 'rejected';
      reason = result;
      pendingRejectedHandlers.forEach(function (handler) {
        handler();
      });
    }
  }

  function then(onFulfilled, onRejected) {
    var promise2 = new Fan(function (resolve, reject) {
      if (state === 'fulfilled') {
        fulfilledHandler();
      } else if (state === 'rejected') {
        rejectedHandler();
      } else {
        pendingFulfilledHandlers.push(fulfilledHandler);
        pendingRejectedHandlers.push(rejectedHandler);
      }

      function fulfilledHandler() {
        if (typeof onFulfilled === 'function') {
          setTimeout(function () {
            try {
              var x = onFulfilled(value);
              resolution(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        } else {
          resolve(value);
        }
      }

      function rejectedHandler() {
        if (typeof onRejected === 'function') {
          setTimeout(function () {
            try {
              var x = onRejected(reason);
              resolution(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        } else {
          reject(reason);
        }
      }
    });

    return promise2;
  }

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

  this.then = then;
}

module.exports = Fan;
