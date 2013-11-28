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
      out[dataValue] = Math.random() * 10000;
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
    'Small dataset - Packing': {
      setup: function() {
        this.writer = new XlsxWriter();
        this.writer.addRows(smallData);
        this.writer.finalize();
      },
      fn: function(){
        this.writer.pack();
      }
    },
    'Small dataset - Packing (no compression)': {
      setup: function() {
        this.writer = new XlsxWriter();
        this.writer.addRows(smallData);
        this.writer.finalize();
      },
      fn: function(){
        this.writer.pack({
          compression: 'STORE'
        });
      }
    },
    'Small dataset - Adding rows only': {
      setup: function() {
        this.writer = new XlsxWriter();
      },
      fn: function(){
        this.writer.addRows(smallData);
      }
    },
    'Small dataset - Generate entire file': {
      fn: function(){
        XlsxWriter.write(filename, smallData, function(){});
      }
    },
    'Large dataset - Packing': {
      setup: function() {
        this.writer = new XlsxWriter();
        this.writer.addRows(largeData);
        this.writer.finalize();
      },
      fn: function(){
        this.writer.pack();
      }
    },
    'Large dataset - Packing (no compression)': {
      setup: function() {
        this.writer = new XlsxWriter();
        this.writer.addRows(largeData);
        this.writer.finalize();
      },
      fn: function(){
        this.writer.pack({
          compression: 'STORE'
        });
      }
    },
    'Large dataset - Adding rows only': {
      setup: function() {
        this.writer = new XlsxWriter();
      },
      fn: function(){
        this.writer.addRows(largeData);
      }
    },
    'Large dataset - Generate entire file': {
      fn: function(){
        XlsxWriter.write(filename, largeData, function(){});
      }
    },
  }
};