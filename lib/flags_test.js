/* jshint esnext:true */

import expect, { createSpy, spyOn, isSpy } from 'expect';
import _ from 'underscore';
import { FlagSet, StringFlag, BoolFlag, NumberFlag } from './flags';
describe('flags', () => {
  const params = [{
    flags:new FlagSet([
      new StringFlag('foo', {
        alias:'f'
      })
    ]),
    in:['--foo', 'bar'],
    out:{
      foo:'bar'
    }

  }, {
    flags: new FlagSet([
      new BoolFlag('foo', {
        alias:'f'
      })
    ]),
    in:['--foo', 'asdf'],
    out:{
      foo:true
    }
  }, {
    flags: new FlagSet([
      new BoolFlag('foo', {
        alias:'f'
      })
    ]),
    in:['asdf'],
    out:{
      foo:false
    }
  }, {
    flags: new FlagSet([
      new BoolFlag('foo', {
        alias:'f'
      })
    ]),
    in:['-f'],
    out:{
      foo:true
    }
  }, {
    flags: new FlagSet([
      new BoolFlag('foo', {
        alias:'f'
      }),
      new NumberFlag('bar')
    ]),
    in:['-f', '--bar', '10', 'asdf', 'fdsa'],
    out:{
      foo:true,
      bar:10.0
    }
  },{
    flags: new FlagSet([
      new BoolFlag('foo', {
        alias:'f'
      }),
      new BoolFlag('bar', {
        alias:'b'
      })
    ]),
    in:['-fb'],
    out:{
      foo:true,
      bar:true
    }
  }, {
    flags: new FlagSet([
      new StringFlag('env', {
        alias:'e', 
        allowMultiple: true
      })
    ]),
    in:['-e', 'Foo', '-e', 'Bar'],
    out:{
      env:['Foo', 'Bar']
    }
  }, {
    flags: new FlagSet([
      new StringFlag('env', {
        alias:'e',
        envVar:'ENV'
      })
    ]),
    env:{
      ENV:'abcd'
    },
    in:[],
    out:{
      env:'abcd'
    }
  }];

  params.forEach((param, i) => {
    it(param.in.join(' ') + ' (param #' + i.toString() + ')', () => {
      if(param.env) {
        _.extend(process.env, param.env);
      }
      expect(param.flags.parse(param.in)).toEqual(param.out);
    });
  });
});
