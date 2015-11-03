/* jshint esnext:true */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _flags = require('./flags');

var helpFlag = new _flags.BoolFlag('help', {
  alias: 'h',
  description: 'Show usage'
});

var Command = (function () {
  function Command(name, params) {
    _classCallCheck(this, Command);

    if (!name) {
      throw new Error('Command must have a name');
    }
    this.name = name;
    this.params = _underscore2['default'].defaults(params, {
      subCommands: {},
      flags: null,
      description: ''
    });

    if (this.params.flags) {
      this.params.flags.add(helpFlag);
    } else {
      this.params.flags = new _flags.FlagSet([helpFlag]);
    }

    // this.params.flags.help = ['h', 'Help', 'bool'];
  }

  _createClass(Command, [{
    key: 'help',
    value: function help() {
      console.log('');
      console.log('COMMAND: ' + this.name.bold + (this.params.description ? ' - ' + this.params.description : ''));
      console.log('');
      var path = [];
      var currentCommand = this;
      while (currentCommand) {
        path.push(currentCommand.name.bold + ' <flags>');
        currentCommand = currentCommand._parent;
      }

      path = path.reverse();

      console.log('USAGE: ' + path.join(' ') + ' ' + (Object.keys(this.params.subCommands).length ? '<subcommand> ...' : '<arguments>'));

      console.log('');

      console.log('FLAGS:');
      console.log(this.params.flags.help());

      console.log('');
      if (Object.keys(this.params.subCommands).length) {
        console.log('SUB-COMMANDS:');
        for (var sub in this.params.subCommands) {
          var description = this.params.subCommands[sub].params.description;
          console.log('  ' + sub.bold + (description ? ' - ' + description : ''));
        }

        console.log('');
      }
    }
  }, {
    key: '_handleError',
    value: function _handleError(err) {
      console.log('[ERROR]'.red, err.message);
      process.exit(1);
    }
  }, {
    key: 'run',
    value: function run(input) {
      var _this = this;

      var parentFlags = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      try {
        var result = this._run(input, parentFlags);

        if (result instanceof Promise) {
          result.then(function (val) {
            if (val) {
              console.log(val);
            }
            process.exit(0);
          })['catch'](function (err) {
            _this._handleError(err);
          });
        } else {
          if (result) {
            console.log(result);
          }
          process.exit(0);
        }
      } catch (err) {
        this._handleError(err);
      }
    }
  }, {
    key: '_run',
    value: function _run(input) {
      var parentFlags = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      // If this is the GLOBAL PARENT, then we need to potentially strip some stuff from the input
      if (!process._inCommand) {
        // Fix for NVM that uses absolute path to a different node
        if (input[0].substr(-4) === 'node') {
          input.shift();
        }

        // Shift off the "application name" as well
        input.shift();
        process._inCommand = true;
      }
      var flags = {};
      var args = [];
      if (this.params.flags) {
        flags = this.params.flags.parse(input);
      }

      flags = _underscore2['default'].extend({}, parentFlags, flags);

      if (flags.help === true) {
        this.help();
        process.exit(1);
      }

      // After parsing flags, are there any arguments?
      if (input.length > 0) {
        if (this.params.subCommands) {
          var subCommand = this.params.subCommands[input[0]];
          if (subCommand) {
            // Remove the command name...
            input.shift();
            subCommand._parent = this;
            return subCommand._run(input, flags);
          }
        }
      }

      // If we've gotten to here, either there's no recognized subcommand or there are no arguments.
      if (!this.params.action) {
        throw new Error('No action defined for command ' + this.name);
      } else {
        return this.params.action.call(this, input, flags);
      }
    }
  }]);

  return Command;
})();

exports['default'] = Command;
module.exports = exports['default'];