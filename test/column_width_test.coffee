XlsxWriter = require('..')

_ = require('underscore')
assert = require('assert')
fs = require('fs')
parser = require('excel')

describe 'Column Width Test', ->
    filename = "tmp/column-width-test.xlsx"
    writer = new XlsxWriter(filename)

    result = []

    data = [
        {
            name: 'Row 1'
            value: 123
        }
        {
            name: 'Row 2'
            value: 456    
        }
    ]

    writer.defineColumns([
        {
            width: 30
        },
        {
            width: 10
        }
    ])

    writer.addRows(data)

    before (done) ->
        writer.pack (err) ->
            return done(err) if err

            parser filename, (err, workbook) ->
                assert.equal(null, err)
                assert.notEqual(workbook, null)

                result = workbook
                done()

    it 'Should create XLSX file', ->
        assert(fs.existsSync(filename), 'file needs to exist')

    it 'Should have header row', ->
        assert(result.length >= 1, "Should have header row")
        return if !data[0]

        for key, index in _.keys(data[0])
            assert.equal(result[0][index], key)

    xit 'Should have proper column widths', ->
        # herp
