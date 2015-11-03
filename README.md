pikud
======

Create UNIX-style CLI applications in Node

## Installation
```bash
$ npm install --save pikud
```

## Usage
A CLI app built with `pikud` consists of either a single command or unlimited nested commands. Each command can have its own flags. Flags are inherited from parent commands and can be overridden on the child if the child allows the same flag.

### Flags
Flags are defined by a `FlagSet`, which consists of any mix of `StringFlag`, `NumberFlag`, or `BoolFlag`. See below examples

### Help
Each command also automatically has a **help** flag (`--help` or `-h`) which will show the command's usage in a nice little table.

### Actions
If a command has no sub-commands then it must have an `action`. The `action` takes any arguments passed via command line as well as the flags that were parsed. An action can either return a value, in which case that value will be written to the console at the end of execution, OR a `Promise`. If it returns a `Promise`, then `pikud` will handle it asynchronously.

Actions are bound to their commands using `Function.call`, so you can introspect the command or run `this.help()` to display the help text.

## Examples

### Single command
```javascript
import { Command } from 'pikud';

let main = new Command('my-app', {
  action:(args, flags) => {
    console.log('Doing action with args', args, 'flags', flags);
  }
});

main.run(process.argv);
```

```bash
$ my-app arg1 arg2 arg3
```

### With flags
```javascript
import { FlagSet, StringFlag, BoolFlag, NumberFlag, Command } from 'pikud';

let main = new Command('my-app', {
  flags:new FlagSet([
    new StringFlag('foo', {
      alias:'f',
      defaultValue:'asdf',
      envVar:'FOO',
      description:'Which foo to use?'
    }),
    new BoolFlag('bar', {
      alias:'b',
      description:'Turn on the bar'
    })
  ]),
  action:(args, flags) => {
    console.log('Doing action with args', args, 'flags', flags);
  }
});

main.run(process.argv);
```

```bash
$ my-app -f "asdf" -b arg1 arg2 arg3
```

### Sub commands
```javascript
import { FlagSet, StringFlag, BoolFlag, NumberFlag, Command } from 'pikud';

let main = new Command('my-app', {
  flags:new FlagSet([
    new BoolFlag('foo', {
      alias:'f',
      description:'Turn on the foo'
    }),
    new BoolFlag('bar', {
      alias:'b',
      description:'Turn on the bar'
    })
  ]),
  subCommands:{
    cmd1:new Command('cmd1', {
      description:'Do command 1',
      flags: new FlagSet([
        new StringFlag('baz', {
          alias:'z',
          description:'Tell me the baz'
        })
      ]),
      action:(args, flags) => {
        console.log('Doing cmd 1 with ', args, flags);
      }
    })
  }
});

main.run(process.argv);
```

```bash
$ my-app -fb cmd1 --baz "This is the baz value" arg1 arg2 arg3
```
