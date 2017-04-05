// import { assert } from 'ember-metal/debug';

/**
@module ember
@submodule ember-metal
*/

var EXPAND_REGEX = /\{([^{}]*)\}/;
var END_WITH_EACH_REGEX = /\.@each$/;

/**
  Expands `pattern`, invoking `callback` for each expansion.

  The only pattern supported is brace-expansion, anything else will be passed
  once to `callback` directly.

  Example

  ```js
  function echo(arg){ console.log(arg); }

  Ember.expandProperties('foo.bar', echo);              //=> 'foo.bar'
  Ember.expandProperties('{foo,bar}', echo);            //=> 'foo', 'bar'
  Ember.expandProperties('foo.{bar,baz}', echo);        //=> 'foo.bar', 'foo.baz'
  Ember.expandProperties('{foo,bar}.baz', echo);        //=> 'foo.baz', 'bar.baz'
  Ember.expandProperties('foo.{bar,baz}.[]', echo)      //=> 'foo.bar.[]', 'foo.baz.[]'
  Ember.expandProperties('{foo,bar}.{spam,eggs}', echo) //=> 'foo.spam', 'foo.eggs', 'bar.spam', 'bar.eggs'
  Ember.expandProperties('{foo}.bar.{baz}')             //=> 'foo.bar.baz'
  ```

  @method expandProperties
  @for Ember
  @private
  @param {String} pattern The property pattern to expand.
  @param {Function} callback The callback to invoke.  It is invoked once per
  expansion, and is passed the expansion.
*/
export default function expandProperties(pattern, callback) {
  // assert('A computed property key must be a string', typeof pattern === 'string');
  // assert(
  //   'Brace expanded properties cannot contain spaces, e.g. "user.{firstName, lastName}" should be "user.{firstName,lastName}"',
  //   pattern.indexOf(' ') === -1
  // );

  var properties = [pattern];

  for (let property, i = 0; i < properties.length; i++) {
    for (let match; (property = properties[i]) && (match = EXPAND_REGEX.exec(property));) {
      properties.splice(i, 1, ...duplicateAndReplace(property, match));
    }
  }

  for (let i = 0; i < properties.length; i++) {
    callback(properties[i].replace(END_WITH_EACH_REGEX, '.[]'));
  }
}

function duplicateAndReplace(property, match) {
  var all = [];
  var parts = match[1].split(',');

  parts.forEach((part) => {
    all.push(property.substring(0, match.index) +
             part +
             property.substring(match.index + match[0].length));
  });

  return all;
}
