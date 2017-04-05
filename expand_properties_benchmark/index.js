var Benchmark = require('benchmark');
var babel = require('babel-core');
var fs = require('fs');

var BENCHMARK_STRING = 'model.{a,b,c}.d.{e,f}.g';
var DEBUG_STRING = 'foo.{biz.{bar,baz},[]}';

function K() {}
function echo() { console.log.apply(console, arguments); }

var before    = eval(babel.transform(fs.readFileSync('./before.js')).code);
var comma     = eval(babel.transform(fs.readFileSync('./comma.js')).code);
var alternate = eval(babel.transform(fs.readFileSync('./alternate.js')).code);
var matches   = eval(babel.transform(fs.readFileSync('./matches.js')).code);
var iteration = eval(babel.transform(fs.readFileSync('./iteration.js')).code);
var nested    = eval(babel.transform(fs.readFileSync('./nested.js')).code);

// iteration(BENCHMARK_STRING, echo);

var suite = new Benchmark.Suite('expand properties');

suite.add('status quo', function () {
  before(BENCHMARK_STRING, K);
});

suite.add('comma fix', function() {
  comma(BENCHMARK_STRING, K);
});

suite.add('alternate fix', function() {
  alternate(BENCHMARK_STRING, K);
});

suite.add('regex match fix', function() {
  matches(BENCHMARK_STRING, K);
});

suite.add('iteration fix', function() {
  iteration(BENCHMARK_STRING, K);
});

suite.add('nested', function () {
  nested(BENCHMARK_STRING, K);
});

// suite.on('start', function() {
//   before(DEBUG_STRING, echo);
//   comma(DEBUG_STRING, echo);
//   alternate(DEBUG_STRING, echo);
//   matches(DEBUG_STRING, echo);
//   nested(DEBUG_STRING, echo);
// });

suite.on('cycle', function(event) {
  console.log(String(event.target));
});

// suite.on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').map('name'));
// });

suite.run({ async: true });
