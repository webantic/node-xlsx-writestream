var _ = require('underscore');

// Anything that needs to be reachable from inside tests needs to be assigned to `global`
// Has to do with how crazy benchmarkjs is
global.fs = require('fs');
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

global.parallelWork = function(writer, fileName, packOptions, parallelism, cb) {
  var finished = _.after(parallelism, cb);

  for (var i = 0; i < parallelism; i++) {
    work(writer, fileName + i, {}, finished);
  }
};

// Individual file pack & write
global.work = function(writer, fileName, packOptions, cb) {
  var readStream = writer.pack(packOptions);
  var fileStream = fs.createWriteStream(fileName);
  fileStream.once('finish', cb);
  readStream.pipe(fileStream);
};


// We don't run any tests with defer:true, just using it
// causes synchronous tests to lose perf by two orders of magnitude.
// Since JSZip is synchronous, this appears to be fair.

module.exports = {
  name: 'Node-XLSX-Writer benchmarks',
  tests: {
    'Small dataset - Packing': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(smallData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, {}, function(){
          deferred.resolve();
        });
      }
    },
    'Small dataset - Packing (no compression)': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(smallData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, {zlib: {level: 0}}, function(){
          deferred.resolve();
        });
      }
    },
    'Small dataset - Packing (parallelism: 10)': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(smallData);
        writer.finalize();
      },
      fn: function(deferred){
        var parallelism = 10;
        parallelWork(writer, fileName, {}, 10, function(){
          deferred.resolve();
        });
      }
    },
    'Small dataset - Adding rows only': {
      setup: function() {
        var writer = new XlsxWriter();
      },
      fn: function(){
        writer.addRows(smallData);
      }
    },
    'Small dataset - Generate entire file': {
      defer: true,
      fn: function(deferred){
        XlsxWriter.write(fileName, smallData, function(){
          deferred.resolve();
        });
      }
    },
    'Small dataset - Generate entire file (parallelism: 10)': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(smallData);
        writer.finalize();
      },
      fn: function(deferred){
        var parallelism = 10;
        var finished = _.after(parallelism, function() { deferred.resolve(); });
        _.times(parallelism, function(n){
          XlsxWriter.write(fileName + n, smallData, finished);
        });
      }
    },

    // Large dataset

    'Large dataset - Packing': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(largeData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, {}, function(){
          deferred.resolve();
        });
      }
    },
    'Large dataset - Packing (no compression)': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(largeData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, {zlib: {level: 0}}, function(){
          deferred.resolve();
        });
      }
    },
    'Large dataset - Packing (parallelism: 10)': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(largeData);
        writer.finalize();
      },
      fn: function(deferred){
        var parallelism = 10;
        parallelWork(writer, fileName, {}, 10, function(){
          deferred.resolve();
        });
      }
    },
    'Large dataset - Adding rows only': {
      setup: function() {
        var writer = new XlsxWriter();
      },
      fn: function(){
        writer.addRows(largeData);
      }
    },
    'Large dataset - Generate entire file': {
      defer: true,
      fn: function(deferred){
        XlsxWriter.write(fileName, largeData, function(){
          deferred.resolve();
        });
      }
    },
    'Large dataset - Generate entire file (parallelism: 10)': {
      defer: true,
      setup: function() {
        var writer = new XlsxWriter();
        writer.addRows(largeData);
        writer.finalize();
      },
      fn: function(deferred){
        var parallelism = 10;
        var finished = _.after(parallelism, function() { deferred.resolve(); });
        _.times(parallelism, function(n){
          XlsxWriter.write(fileName + n, largeData, finished);
        });
      }
    },
  }
};