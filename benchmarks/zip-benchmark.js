var _ = require('underscore');
global.XlsxWriter = require('..');

global.fileName = "tmp/benchmark-test.xlsx";
function generateDoc(data, cb) {
  XlsxWriter.write(fileName, data, cb);
}

// Generate a size*size grid of data.
function generateData(size){
  var range = _.range(size);
  return _.map(range, function() {
    var out = {};
    _.each(range, function(dataValue){
      out[dataValue] = Math.random() * 10000 + "";
    });
    return out;
  });
}

// Generate data
var smallDataSize = 10;
var largeDataSize = 200;

global.smallData = generateData(smallDataSize);
global.largeData = generateData(largeDataSize);

global.parallelWork = function(fileName, data, parallelism, cb) {
  var finished = _.after(parallelism, cb);

  for (var i = 0; i < parallelism; i++) {
    work(fileName, data, finished);
  }
};

// Individual file pack & write
global.work = function(fileName, data, cb) {
  XlsxWriter.write(fileName, data, function() {
    cb();
  });
};


// We don't run any tests with defer:true, just using it
// causes synchronous tests to lose perf by two orders of magnitude.
// Since JSZip is synchronous, this appears to be fair.
module.exports = {
  name: 'Node-Xlsx-Writer benchmarks',
  tests: {
    'Small dataset - Generate entire file': {
      defer: true,
      fn: function(deferred){
        work(fileName, smallData, function() {
          deferred.resolve();
        });
      }
    },
    'Small dataset - Generate entire file (parallelism: 10)': {
      defer: true,
      fn: function(deferred){
        parallelWork(fileName, smallData, 10, function() {
          deferred.resolve();
        });
      }
    },
    'Large dataset - Generate entire file': {
      defer: true,
      fn: function(deferred){
        work(fileName, largeData, function() {
          deferred.resolve();
        });
      }
    },
    'Large dataset - Generate entire file (parallelism: 10)': {
      defer: true,
      fn: function(deferred){
        parallelWork(fileName, largeData, 10, function() {
          deferred.resolve();
        });
      }
    },
  }
};