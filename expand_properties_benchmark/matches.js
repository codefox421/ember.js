// import { assert } from 'ember-metal/debug';

/**
@module ember
@submodule ember-metal
*/

var EXPAND_REGEX = /\{([^}]*)\}/g;
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

  const processed = [pattern];

  let match;
  let slack = 0;
  while(match = EXPAND_REGEX.exec(pattern)) {
    let focus = processed.pop();
    processed.push(focus.slice(0, match.index - slack));
    processed.push(match[1].split(','));
    processed.push(focus.substring(match.index + match[0].length - slack));
    slack = match.index + match[0].length;
  }

  const properties = [processed[0]];
  for (let i = 1; i < processed.length; ++i) {
    let strOrArray = processed[i];

    for (let j = properties.length; j > 0; --j) {
      if (typeof strOrArray === 'string') {
        properties[j - 1] += strOrArray;
      } else {
        let currentProperty = properties[j - 1];
        properties.splice(j - 1, 1, ...strOrArray.map((str) => currentProperty + str));
      }
    }
  }

  for (let i = 0; i < properties.length; i++) {
    callback(properties[i].replace(END_WITH_EACH_REGEX, '.[]'));
  }
}
