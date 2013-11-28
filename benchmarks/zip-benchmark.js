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
      out[dataValue] = Math.random() * 10000 + '';
    });
    return out;
  });
}

// Generate data
var smallDataSize = 10;
var largeDataSize = 200;

global.smallData = generateData(smallDataSize);
global.largeData = generateData(largeDataSize);

// Individual file pack & write
global.work = function(writerObj, fileName, cb) {
  var fileStream = fs.createWriteStream(fileName);
  fileStream.once('finish', cb);
  writerObj.createReadStream().pipe(fileStream);
};

module.exports = {
  name: 'Node-XLSX-Writer benchmarks',
  onError: function(err) { // amazingly useless
    console.error('error caught');
    console.error(err.target.error.stack);
  },
  tests: {
    'Small dataset - Packing': {
      defer: true,
      setup: function() {
        global.writer = new XlsxWriter();
        writer.addRows(smallData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, function(){
          deferred.resolve();
        });
      }
    },
    // 'Small dataset - Packing (no compression)': {
    //   defer: true,
    //   setup: function() {
    //     global.writer = new XlsxWriter({zip: {zlib: {level: 0}}});
    //     writer.addRows(smallData);
    //     writer.finalize();
    //   },
    //   fn: function(deferred){
    //     work(writer, fileName, function(){
    //       deferred.resolve();
    //     });
    //   }
    // },
    'Small dataset - Adding rows only': {
      setup: function() {
        global.writer = new XlsxWriter();
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
        global.writer = new XlsxWriter();
        writer.addRows(largeData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, function(){
          deferred.resolve();
        });
      }
    },
    'Large dataset - Packing (no compression)': {
      defer: true,
      setup: function() {
        global.writer = new XlsxWriter({zip: {zlib: {level: 0}}});
        writer.addRows(largeData);
        writer.finalize();
      },
      fn: function(deferred){
        work(writer, fileName, function(){
          deferred.resolve();
        });
      }
    },
    'Large dataset - Adding rows only': {
      setup: function() {
        global.writer = new XlsxWriter();
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
      fn: function(deferred){
        var parallelism = 10;
        var finished = _.after(parallelism, function() { deferred.resolve(); });
        _.times(parallelism, function(n){
          XlsxWriter.write(fileName + n, largeData, finished);
        });
      }
    }
  }
};

// Free memory after every test run
_.each(module.exports.tests, function(test){
  test.teardown = function() {
    if (writer) {
      writer.dispose();
    }
  };
});