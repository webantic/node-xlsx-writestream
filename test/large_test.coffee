test = require('./common')
_ = require('underscore')

# Generate a size*size grid of data.
generateData = (size) ->
  range = _.range(size);
  return _.map range, () ->
    out = {};
    _.each range, (dataValue) ->
      out[dataValue] = Math.random() * 10000
    return out

# A bug in 'node-unzip' (required by 'excel') breaks this test
#test 'large-test', generateData(200)
