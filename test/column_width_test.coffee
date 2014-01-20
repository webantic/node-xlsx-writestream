XlsxWriter = require('..')

_ = require('underscore')
assert = require('assert')
fs = require('fs')
parser = require('excel')

describe 'Column Width Test', ->
    filename = "tmp/column-width-test.xlsx"

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

    columns = [
        {width: 30},
        {width: 10}
    ]

    generateXLSX = (done) ->
        writer = new XlsxWriter({out: filename, columns: columns})
        writer.addRows(data)
        finalizeXLSX(writer, done)

    finalizeXLSX = (writer, done) ->
        writer.writeToFile (err) ->
            console.log('done')
            return done(err) if err

            parser filename, (err, workbook) ->
                assert.equal(null, err)
                assert.notEqual(workbook, null)

                result = workbook
                done()

    it 'Should create XLSX file', (done) ->
        generateXLSX (err) ->
            assert(fs.existsSync(filename), 'file needs to exist')
            done(err)

    it 'Should have header row', (done) ->
        generateXLSX (err) ->
            assert(result.length >= 1, "Should have header row")

            for key, index in _.keys(data[0])
                assert.equal(result[0][index], key)

            done(err)

    it 'Should also generate properly using @defineColumns', (done) ->
        writer = new XlsxWriter({out: filename})
        writer.defineColumns(columns)
        writer.addRows(data)
        finalizeXLSX writer, (err) ->
            for key, index in _.keys(data[0])
                assert.equal(result[0][index], key)

            done(err)

    it 'Should throw error if defining columns after rows', ->
        writer = new XlsxWriter({out: filename})
        writer.addRows(data)
        assert.throws -> 
            writer.defineColumns(columns)

    # Need a way to actually measure this... can we get raw sheet data from `excel`?
    xit 'Should have proper column widths', ->
