/* jshint esnext:true */

import _ from 'underscore';
import { FlagSet, BoolFlag } from './flags';

const helpFlag = new BoolFlag('help', {
  alias:'h', 
  description:'Show usage'
});

export default class Command {
  constructor(name, params) {
    if(!name) {
      throw new Error('Command must have a name');
    }
    this.name = name;
    this.params = _.defaults(params, {
      subCommands:{},
      flags:null,
      description:''
    });


    if(this.params.flags) {
      this.params.flags.add(helpFlag);
    } else {
      this.params.flags = new FlagSet([helpFlag]);
    }

    // this.params.flags.help = ['h', 'Help', 'bool'];
  }

  help() {
    console.log('');
    console.log('COMMAND: ' + this.name.bold + (this.params.description ? (' - ' + this.params.description) : ''));
    console.log('');
    let path = [];
    let currentCommand = this;
    while(currentCommand) {
      path.push(currentCommand.name.bold + ' <flags>');
      currentCommand = currentCommand._parent;
    }


    path = path.reverse();

    console.log('USAGE: ' + path.join(' ') + ' ' + (Object.keys(this.params.subCommands).length ? '<subcommand> ...' : '<arguments>'));

    console.log('');

    console.log('FLAGS:');
    console.log(this.params.flags.help());

    console.log('');
    if(Object.keys(this.params.subCommands).length) {
      console.log('SUB-COMMANDS:');
      for(let sub in this.params.subCommands) {
        let description = this.params.subCommands[sub].params.description;
        console.log('  ' + sub.bold + (description ? (' - ' + description) : ''));
      }

      console.log('');
    }

  }

  _handleError(err) {
    console.log('[ERROR]'.red, err.message);
    process.exit(1);
  }

  run(input, parentFlags = {}) {
    try {
      let result = this._run(input, parentFlags);

      if(result instanceof Promise) {
        result.then((val) => {
          if(val) {
            console.log(val);
          }
          process.exit(0);
        }).catch((err) => {
          this._handleError(err);
        });
      } else {
        if(result) {
          console.log(result);

        }
        process.exit(0);
      }
    } catch(err) {
      this._handleError(err);
    }
  }

  _run(input, parentFlags = {}) {
    // If this is the GLOBAL PARENT, then we need to potentially strip some stuff from the input
    if(!process._inCommand) {
      // Fix for NVM that uses absolute path to a different node
      if(input.substr(-4) === 'node') {
        input.shift();
      }

      // Shift off the "application name" as well
      input.shift();
      process._inCommand = true;
    }
    let flags = {};
    let args = [];
    if(this.params.flags) {
      flags = this.params.flags.parse(input);
    }

    flags = _.extend({}, parentFlags, flags);

    if(flags.help === true) {
      this.help();
      process.exit(1);
    }

    // After parsing flags, are there any arguments?
    if(input.length > 0) {
      if(this.params.subCommands) {
        let subCommand = this.params.subCommands[input[0]];
        if(subCommand) {
          // Remove the command name...
          input.shift();
          subCommand._parent = this;
          return subCommand._run(input, flags);
        }
      }
    }

    // If we've gotten to here, either there's no recognized subcommand or there are no arguments.
    if(!this.params.action) {
      throw new Error('No action defined for command ' + this.name);
    } else {
      return this.params.action.call(this, input, flags);
    }
  }
}
