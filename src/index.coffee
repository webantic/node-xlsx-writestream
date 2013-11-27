fs = require('fs')
path = require('path')
Zip = require('node-zip')

blobs = require('./blobs')

class XlsxWriter
    @write = (out, data, cb) ->
        rows = data.length
        columns = 0
        columns += 1 for key of data[0]

        writer = new XlsxWriter(out)
        writer.addRows(data)
        writer.pack(cb)

    constructor: (@out) ->
        @sheetData = ''
        @strings = []
        @stringMap = {}
        @stringIndex = 0
        @currentRow = 0

        @haveHeader = false
        @prepared = false

        @cellMap = []
        @cellLabelMap = {}

        @options = {
            defaultWidth: 15
        }

        @columns = []

        @_write(blobs.sheetHeader)

    # Write a row to the sheet.
    addRow: (obj) ->

        # Values in header are defined by the keys of the object we've passed in.
        # They need to be written the first time they're passed in.
        if !@haveHeader
            @_write(blobs.sheetDataHeader)
            @_startRow()
            col = 1
            for key of obj
                @_addCell(key, col)
                @cellMap.push(key)
                col += 1
            @_endRow()

            @haveHeader = true

        @_startRow()
        for key, col in @cellMap
            @_addCell(obj[key] || "", col + 1)
        @_endRow()

    addRows: (rows) ->
        for row in rows
            @addRow(row)

    defineColumns: (@columns) ->

    pack: (cb) ->

        # Create Zip (JSZip port, no native deps)
        zipFile = new Zip()

        # Add static supporting files
        zipFile.file('[Content_Types].xml', blobs.contentTypes)
        zipFile.file('_rels/.rels', blobs.rels)
        zipFile.file('xl/workbook.xml', blobs.workbook)
        zipFile.file('xl/styles.xml', blobs.styles)
        zipFile.file('xl/_rels/workbook.xml.rels', blobs.workbookRels)

        # Add shared strings
        stringTable = ''
        for string in @strings
            stringTable += blobs.string(@escapeXml(string))
        stringsData = blobs.stringsHeader(@strings.length) + stringTable + blobs.stringsFooter
        zipFile.file('xl/sharedStrings.xml', stringsData)

        # Finish up the sheet

        # If there was data, end sheetData
        if @haveHeader
            @_write(blobs.sheetDataFooter)

        # Write column & dimension metadata
        @_writeColumnDefinition()
        colCount = Object.keys(@cellLabelMap).length
        @_write(blobs.dimensions(@dimensions(@currentRow, colCount)))

        # End sheet
        @_write(blobs.sheetFooter)

        # Add sheet
        zipFile.file('xl/worksheets/sheet1.xml', @sheetData)

        # Pack it up
        results = zipFile.generate({
            base64: false
            compression: 'DEFLATE'    
        })

        # Write to output location
        fs.writeFile(@out, results, 'binary', cb)

    dimensions: (rows, columns) ->
        return "A1:" + @cell(rows, columns)

    cell: (row, col) ->
        colIndex = ''
        if @cellLabelMap[col]
            colIndex = @cellLabelMap[col]
        else
            if col == 0
                # Provide a fallback for empty spreadsheets
                row = 1
                col = 1

            input = (+col - 1).toString(26)
            while input.length
                a = input.charCodeAt(input.length - 1)
                colIndex = String.fromCharCode(a + if a >= 48 and a <= 57 then 17 else -22) + colIndex
                input = if input.length > 1 then (parseInt(input.substr(0, input.length - 1), 26) - 1).toString(26) else ""
            @cellLabelMap[col] = colIndex

        return colIndex + row

    _startRow: () ->
        @rowBuffer = blobs.startRow(@currentRow)
        @currentRow += 1

    _lookupString: (value) ->
        if !@stringMap[value]
            @stringMap[value] = @stringIndex
            @strings.push(value)
            @stringIndex += 1
        return @stringMap[value]

    # http://stackoverflow.com/a/15550284/2644351
    _dateToOADate: (date) ->
        epoch = new Date(1899,11,30)
        msPerDay = 8.64e7

        v = -1 * (epoch - date) / msPerDay;

        # Deal with dates prior to 1899-12-30 00:00:00
        dec = v - Math.floor(v)

        if v < 0 and dec
            v = Math.floor(v) - dec

        return v

    _OADateToDate: (oaDate) ->
        epoch = new Date(1899,11,30)
        msPerDay = 8.64e7

        # Deal with -ve values
        dec = oaDate - Math.floor(oaDate)

        if oaDate < 0 and dec
            oaDate = Math.floor(oaDate) - dec

        return new Date(oaDate * msPerDay + +epoch)

    _addCell: (value = '', col) ->
        row = @currentRow
        cell = @cell(row, col)

        if typeof value == 'number'
            @rowBuffer += blobs.numberCell(value, cell)
        else if value instanceof Date
            date = @_dateToOADate(value)
            @rowBuffer += blobs.dateCell(date, cell)
        else
            index = @_lookupString(value)
            @rowBuffer += blobs.cell(index, cell)

    _endRow: () ->
        @_write(@rowBuffer + blobs.endRow)

    _write: (data) ->
        @sheetData += (data)

    _writeColumnDefinition: () ->
        @_write(blobs.startColumns)

        idx = 1
        for index, column of @columns
            @_write(blobs.column(column.width || @options.defaultWidth, idx))
            idx += 1

        @_write(blobs.endColumns)

    escapeXml: (str = '') ->
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

module.exports = XlsxWriter
