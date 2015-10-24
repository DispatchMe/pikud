/* jshint esnext:true */

import _ from 'underscore';
import generateTable from './table';
export class FlagSet {
  constructor(flags) {
    this._flags = flags;
  }

  add(flag) {
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

  help() {
    let lines = [
      ['name'.bold, 'alias'.bold, 'multiple'.bold, 'default'.bold, 'ENV'.bold, 'description'.bold]
    ];
    let line;
    this._flags.forEach((flag) => {
      lines.push([
        `--${flag.name}`,
        flag.alias ? `-${flag.alias}` : ' ',
        flag.allowMultiple ? 'y': 'n',
        flag.defaultValue ? JSON.stringify(flag.defaultValue) : ' ',
        flag.envVar ? flag.envVar : ' ',
        flag.description ? flag.description : ' '
      ]);
    });

    return generateTable(lines);
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
  parse(inputs) {
    let inp;
    let flag;
    let flagName;
    let arg;

    let parsed = {};


    function set(key, val, allowMultiple) {
      if(allowMultiple) {
        if(parsed[key]) {
          parsed[key].push(val);
        } else {
          parsed[key] = [val];
        }
      } else {
        parsed[key] = val;
      }
    }
    // Start with the default values
    this._flags.forEach((flag) => {
      if(flag.defaultValue !== undefined) {
        set(flag.name, flag.defaultValue, flag.allowMultiple);
      }

      if(flag.envVar && process.env[flag.envVar] !== undefined) {
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
    
    while(inputs.length > 0) {
      inp = inputs.shift();
      if(inp.substr(0, 2) === '--' || (inp.substr(0, 1) === '-' && inp.length === 2)) {
        if(inp.substr(0,2) === '--') {
          flagName = inp.substr(2);
          flag = this._getFlagByName(flagName);
        } else {
          flagName = inp[1];
          flag = this._getFlagByAlias(flagName);
        }
        if(!flag) {
          throw new Error('Unrecognized flag: ' + flagName);
        }

        if(flag.requireArgument()) {
          arg = inputs.shift();
          set(flag.name, flag.parse(arg), flag.allowMultiple);
        } else {
          // Still run the parse (allow multiple is irrelevant here because there 
          // are no values)
          set(flag.name, flag.parse(), false);
        }

      } else if(inp.substr(0, 1) === '-') {
        
        for(let n =1;n<inp.length;n++) {
          flag = this._getFlagByAlias(inp[n]);
          if(!flag) {
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

  _getFlagByName(name) {
    return _.findWhere(this._flags, {
      name:name
    });
  }

  _getFlagByAlias(alias) {
    return _.findWhere(this._flags, {
      alias:alias
    });
  }



}

class Flag {
  constructor(name, params) {
    this.name = name;

    _.extend(this, _.defaults(params, {
      allowMultiple:false,
      description:'',
      alias:'',
      envVar:null,
      defaultValue:undefined
    }));

  }
}

export class StringFlag extends Flag {
  requireArgument() {
    return true;
  }

  parse(val) {
    return val.toString();
  }

}

export class BoolFlag extends Flag {
  constructor(name, alias, defaultValue, envVar) {
    super(name, alias, defaultValue, envVar);

    if(!this.defaultValue) {
      this.defaultValue = false;
    }
  }
  requireArgument() {
    return false;
  }

  parse(flagName, val) {
    return true;
  }
}

export class NumberFlag extends Flag {
  requireArgument() {
    return true;
  }

  parse(val) {
    return parseFloat(val);
  }
}
