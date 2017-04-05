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

  Ember.expandProperties('foo.bar', echo);               //=> 'foo.bar'
  Ember.expandProperties('{foo,bar}', echo);             //=> 'foo', 'bar'
  Ember.expandProperties('foo.{bar,baz}', echo);         //=> 'foo.bar', 'foo.baz'
  Ember.expandProperties('{foo,bar}.baz', echo);         //=> 'foo.baz', 'bar.baz'
  Ember.expandProperties('foo.{bar,baz}.[]', echo)       //=> 'foo.bar.[]', 'foo.baz.[]'
  Ember.expandProperties('{foo,bar}.{spam,eggs}', echo)  //=> 'foo.spam', 'foo.eggs', 'bar.spam', 'bar.eggs'
  Ember.expandProperties('{foo}.bar.{baz}')              //=> 'foo.bar.baz'
  Ember.expandProperties('foo.{bar.{biz,baz},[]}', echo) //=> 'foo.bar.biz', 'foo.bar.baz', 'foo.[]'
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
    for (let match; (property = properties[i]) && (match = matchOuterMostBraces(property));) {
      properties.splice(i, 1, ...duplicateAndReplace(property, match));
    }
  }

  for (let i = 0; i < properties.length; i++) {
    callback(properties[i].replace(END_WITH_EACH_REGEX, '.[]'));
  }
}

function duplicateAndReplace(property, match) {
  var all = [];
  var parts = splitOutsideBraces(match[1], ',');

  parts.forEach((part) => {
    all.push(property.substring(0, match.index) +
             part +
             property.substring(match.index + match[0].length));
  });

  return all;
}

function splitOutsideBraces(string, splitChar) {
  var parts = [];

  // search for commas to split on
  for (var stack = 0, start = 0, end = 0; end < string.length; ++end) {
    switch (string[end]) {
      case '{':
        // enter brace expansion
        ++stack;
        break;
      case '}':
        // exit brace expansion
        stack = Math.max(stack - 1, 0);
        break;
      case splitChar[0]:
        // split on given character, but only if not inside a brace expansion
        // then restart search after the character
        if (!stack) {
          parts.push(string.slice(start, end));
          start = end + 1;
        }
        break;
      default:
        // any other character is a no-op
        break;
    }
  }

  // add the last part
  if (start !== end) {
    parts.push(string.slice(start, end));
  }

  return parts;
}

function matchOuterMostBraces(string) {
  let openIndex = string.indexOf('{');

  // ensure there is at least one brace expansion
  if (openIndex < 0) {
    return null;
  }

  // search for the matching brace for this expansion
  let closeIndex = openIndex;
  for (let stack = 1; stack > 0 && ++closeIndex < string.length;) {
    switch (string[closeIndex]) {
      case '{':
        // enter brace expansion
        ++stack;
        break;
      case '}':
        // exit brace expansion
        --stack;
        break;
      default:
        // any other character is a no-op
        break;
    }
  }

  // ensure there is a matching brace
  if (closeIndex >= string.length) {
    return null;
  }

  // simulate a regex match object, with a capturing group inside the outer braces
  let match = [string.slice(openIndex, closeIndex + 1), string.slice(openIndex + 1, closeIndex)];
  match.index = openIndex;
  match.input = string;

  return match;
}
