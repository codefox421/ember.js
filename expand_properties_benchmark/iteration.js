// import { assert } from 'ember-metal/debug';

/**
@module ember
@submodule ember-metal
*/

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

  const properties = [pattern];

  let bookmark, inside = false;
  for (let i = pattern.length; i > 0; --i) {
    let current = pattern[i - 1];

    switch(current) {
      case '}':
        if (!inside) {
          bookmark = i - 1;
          inside = true;
        }
        break;
      case '{':
        if (inside) {
          const expansion = pattern.slice(i, bookmark).split(',');
          for (let j = properties.length; j > 0; --j) {
            let property = properties.splice(j - 1, 1)[0];
            for (let k = 0; k < expansion.length; ++k) {
              properties.push(property.slice(0, i - 1) +
                              expansion[k] +
                              property.slice(bookmark + 1));
            }
          }
          inside = false;
        }
        break;
    }
  }

  for (let i = 0; i < properties.length; i++) {
    callback(properties[i].replace(END_WITH_EACH_REGEX, '.[]'));
  }
}
