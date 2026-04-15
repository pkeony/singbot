// ===== Polyfills (ES5 환경 호환) =====
(function () {
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function (predicate) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var thisArg = arguments[1];
        var k = 0;
        while (k < len) {
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) return kValue;
          k++;
        }
        return undefined;
      },
    });
  }
  if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
      value: function (predicate) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var thisArg = arguments[1];
        var k = 0;
        while (k < len) {
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) return k;
          k++;
        }
        return -1;
      },
    });
  }
  if (!Array.prototype.every) {
    Object.defineProperty(Array.prototype, 'every', {
      value: function (callbackfn, thisArg) {
        'use strict';
        var T, k;
        if (this == null) throw new TypeError('this is null or not defined');
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callbackfn !== 'function') throw new TypeError();
        if (arguments.length > 1) T = thisArg;
        k = 0;
        while (k < len) {
          var kValue;
          if (k in O) {
            kValue = O[k];
            var testResult = callbackfn.call(T, kValue, k, O);
            if (!testResult) return false;
          }
          k++;
        }
        return true;
      },
    });
  }
  if (!Array.prototype.reduce) {
    Object.defineProperty(Array.prototype, 'reduce', {
      value: function (callback) {
        if (this === null) throw new TypeError('Array.prototype.reduce called on null or undefined');
        if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
        var o = Object(this);
        var len = o.length >>> 0;
        var k = 0;
        var value;
        if (arguments.length >= 2) {
          value = arguments[1];
        } else {
          while (k < len && !(k in o)) k++;
          if (k >= len) throw new TypeError('Reduce of empty array with no initial value');
          value = o[k++];
        }
        while (k < len) {
          if (k in o) value = callback(value, o[k], k, o);
          k++;
        }
        return value;
      },
    });
  }
  if (!Array.prototype.filter) {
    Object.defineProperty(Array.prototype, 'filter', {
      value: function (func, thisArg) {
        'use strict';
        if (!((typeof func === 'Function' || typeof func === 'function') && this)) throw new TypeError();
        var len = this.length >>> 0, res = new Array(len), t = this, c = 0, i = -1;
        var thisContext = thisArg === undefined ? this : thisArg;
        while (++i !== len) {
          if (i in this) {
            if (func.call(thisContext, t[i], i, t)) res[c++] = t[i];
          }
        }
        res.length = c;
        return res;
      },
    });
  }
  if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
      return this.slice(0, str.length) === str;
    };
  }
  if (!Array.prototype.map) {
    Object.defineProperty(Array.prototype, 'map', {
      value: function (callback, thisArg) {
        var T, A, k;
        if (this == null) throw new TypeError('this is null or not defined');
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
        if (arguments.length > 1) T = thisArg;
        A = new Array(len);
        k = 0;
        while (k < len) {
          var kValue, mappedValue;
          if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
          }
          k++;
        }
        return A;
      },
    });
  }
  if (!Object.values) {
    Object.values = function (obj) {
      var values = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) values.push(obj[key]);
      }
      return values;
    };
  }
  if (!Array.prototype.some) {
    Object.defineProperty(Array.prototype, 'some', {
      value: function (fun) {
        'use strict';
        if (this == null) throw new TypeError('Array.prototype.some called on null or undefined');
        if (typeof fun !== 'function') throw new TypeError();
        var t = Object(this);
        var len = t.length >>> 0;
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
          if (i in t && fun.call(thisArg, t[i], i, t)) return true;
        }
        return false;
      },
    });
  }
})();
