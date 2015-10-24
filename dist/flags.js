/* jshint esnext:true */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _table = require('./table');

var _table2 = _interopRequireDefault(_table);

var FlagSet = (function () {
  function FlagSet(flags) {
    _classCallCheck(this, FlagSet);

    this._flags = flags;
  }

  _createClass(FlagSet, [{
    key: 'add',
    value: function add(flag) {
      this._flags.push(flag);
    }

    // extend(set) {
    //   set._flags.forEach((flag) => {
    //     let existing = _.findWhere(this._flags, {
    //       name:flag.name
    //     });
    //     if(existing) {
    //       let idx = this._flags.indexOf(existing);
    //       this._flags = this._flags.splice(0, idx);
    //     }

    //     this._flags.push(flag);
    //   });
    //   return this;
    // }

  }, {
    key: 'help',
    value: function help() {
      var lines = [['name'.bold, 'alias'.bold, 'multiple'.bold, 'default'.bold, 'ENV'.bold, 'description'.bold]];
      var line = undefined;
      this._flags.forEach(function (flag) {
        lines.push(['--' + flag.name, flag.alias ? '-' + flag.alias : ' ', flag.allowMultiple ? 'y' : 'n', flag.defaultValue ? JSON.stringify(flag.defaultValue) : ' ', flag.envVar ? flag.envVar : ' ', flag.description ? flag.description : ' ']);
      });

      return (0, _table2['default'])(lines);
    }

    /**
     * Parse the inputs.
     *
     * Note that inputs is mutated. This is done intentionally, so that you can continue
     * to use whatever is left as either the arguments to the command or a subcommand with
     * potentially more flags. Flags are expected to precede any arguments.
     *   
     * @param  {Array<string>} inputs
     * @return {Object} Parsed flags
     */
  }, {
    key: 'parse',
    value: function parse(inputs) {
      var inp = undefined;
      var flag = undefined;
      var flagName = undefined;
      var arg = undefined;

      var parsed = {};

      function set(key, val, allowMultiple) {
        if (allowMultiple) {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = val;
        }
      }
      // Start with the default values
      this._flags.forEach(function (flag) {
        if (flag.defaultValue !== undefined) {
          set(flag.name, flag.defaultValue, flag.allowMultiple);
        }

        if (flag.envVar && process.env[flag.envVar] !== undefined) {
          set(flag.name, process.env[flag.envVar], flag.allowMultiple);
        }
      });

      /**
       * Loop through inputs until we hit an ARGUMENT or COMMAND rather than a FLAG.
       *
       * IF FLAG IS FULL NAME (e.g. "--foo"):
       * -----------------------------------
       * If the flag type requires an argument, then the next input after the flag
       * is interpreted as the flag argument. Otherwise the flag is parsed with no value.
       *
       * IF FLAG IS ALIAS (e.g. '-f'):
       * -------------------------------
       * Flag is parsed as boolean only if there are multiple flags together. 
       * Otherwise if it's just a single flag and the flag requires an argument, the argument
       * will be parsed as iff it was the full-name flag
       */

      while (inputs.length > 0) {
        inp = inputs.shift();
        if (inp.substr(0, 2) === '--' || inp.substr(0, 1) === '-' && inp.length === 2) {
          if (inp.substr(0, 2) === '--') {
            flagName = inp.substr(2);
            flag = this._getFlagByName(flagName);
          } else {
            flagName = inp[1];
            flag = this._getFlagByAlias(flagName);
          }
          if (!flag) {
            throw new Error('Unrecognized flag: ' + flagName);
          }

          if (flag.requireArgument()) {
            arg = inputs.shift();
            set(flag.name, flag.parse(arg), flag.allowMultiple);
          } else {
            // Still run the parse (allow multiple is irrelevant here because there
            // are no values)
            set(flag.name, flag.parse(), false);
          }
        } else if (inp.substr(0, 1) === '-') {

          for (var n = 1; n < inp.length; n++) {
            flag = this._getFlagByAlias(inp[n]);
            if (!flag) {
              throw new Error('Unrecognized flag: ' + inp[n]);
            }
            set(flag.name, flag.parse(), false);
          }
        } else {
          // Don't lose the argument if we had to stop...
          inputs.unshift(inp);
          break;
        }
      }

      return parsed;
    }
  }, {
    key: '_getFlagByName',
    value: function _getFlagByName(name) {
      return _underscore2['default'].findWhere(this._flags, {
        name: name
      });
    }
  }, {
    key: '_getFlagByAlias',
    value: function _getFlagByAlias(alias) {
      return _underscore2['default'].findWhere(this._flags, {
        alias: alias
      });
    }
  }]);

  return FlagSet;
})();

exports.FlagSet = FlagSet;

var Flag = function Flag(name, params) {
  _classCallCheck(this, Flag);

  this.name = name;

  _underscore2['default'].extend(this, _underscore2['default'].defaults(params, {
    allowMultiple: false,
    description: '',
    alias: '',
    envVar: null,
    defaultValue: undefined
  }));
};

var StringFlag = (function (_Flag) {
  _inherits(StringFlag, _Flag);

  function StringFlag() {
    _classCallCheck(this, StringFlag);

    _get(Object.getPrototypeOf(StringFlag.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(StringFlag, [{
    key: 'requireArgument',
    value: function requireArgument() {
      return true;
    }
  }, {
    key: 'parse',
    value: function parse(val) {
      return val.toString();
    }
  }]);

  return StringFlag;
})(Flag);

exports.StringFlag = StringFlag;

var BoolFlag = (function (_Flag2) {
  _inherits(BoolFlag, _Flag2);

  function BoolFlag(name, alias, defaultValue, envVar) {
    _classCallCheck(this, BoolFlag);

    _get(Object.getPrototypeOf(BoolFlag.prototype), 'constructor', this).call(this, name, alias, defaultValue, envVar);

    if (!this.defaultValue) {
      this.defaultValue = false;
    }
  }

  _createClass(BoolFlag, [{
    key: 'requireArgument',
    value: function requireArgument() {
      return false;
    }
  }, {
    key: 'parse',
    value: function parse(flagName, val) {
      return true;
    }
  }]);

  return BoolFlag;
})(Flag);

exports.BoolFlag = BoolFlag;

var NumberFlag = (function (_Flag3) {
  _inherits(NumberFlag, _Flag3);

  function NumberFlag() {
    _classCallCheck(this, NumberFlag);

    _get(Object.getPrototypeOf(NumberFlag.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NumberFlag, [{
    key: 'requireArgument',
    value: function requireArgument() {
      return true;
    }
  }, {
    key: 'parse',
    value: function parse(val) {
      return parseFloat(val);
    }
  }]);

  return NumberFlag;
})(Flag);

exports.NumberFlag = NumberFlag;