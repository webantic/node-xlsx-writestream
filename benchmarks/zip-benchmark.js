var _ = require('underscore');
global.XlsxWriter = require('..');

global.filename = "tmp/benchmark-test.xlsx";
function generateDoc(data, cb) {
  XlsxWriter.write(filename, data, cb);
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


// We don't run any tests with defer:true, just using it
// causes synchronous tests to lose perf by two orders of magnitude.
// Since JSZip is synchronous, this appears to be fair.
module.exports = {
  name: 'Node-Xlsx-Writer benchmarks',
  tests: {
    'Small dataset - Generate entire file': {
      defer: true,
      fn: function(deferred){
        XlsxWriter.write(filename, smallData, function() {
          deferred.resolve();
        });
      }
    },
    'Large dataset - Generate entire file': {
      defer: true,
      fn: function(deferred){
        XlsxWriter.write(filename, largeData, function() {
          deferred.resolve();
        });
      }
    },
  }
};