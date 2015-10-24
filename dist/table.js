/* jshint esnext:true */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = draw;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _table = require('table');

var _table2 = _interopRequireDefault(_table);

var tableConfig = {
  border: {
    topBody: '─',
    topJoin: '┬',
    topLeft: '┌',
    topRight: '┐',

    bottomBody: '─',
    bottomJoin: '┴',
    bottomLeft: '└',
    bottomRight: '┘',

    bodyLeft: '│',
    bodyRight: '│',
    bodyJoin: '│',

    joinBody: '─',
    joinLeft: '├',
    joinRight: '┤',
    joinJoin: '┼'
  }
};

function draw(data) {
  return (0, _table2['default'])(data, tableConfig);
}

module.exports = exports['default'];