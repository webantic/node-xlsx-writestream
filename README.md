# XLSX writer

  Simple XLSX writer. Reverse-engineered from sample XLSX files.
  
  [![Build Status](https://travis-ci.org/rubenv/node-xlsx-writer.png?branch=master)](https://travis-ci.org/rubenv/node-xlsx-writer)

  Node-XLSX-Writer is written in [Literate CoffeeScript](http://coffeescript.org/#literate), so the source
  can be viewed as Markdown. 

  [View the source & API.](src/index.litcoffee)

## Usage
  
  You can install the latest version via npm:
  
    $ npm install --save xlsx-writer

  Require the module:

    var xlsx = require('xlsx-writer');

  Write a spreadsheet:

    var data = [
        {
            "Name": "Bob",
            "Location": "Sweden"
        },
        {
            "Name": "Alice",
            "Location": "France"
        }
    ];

    xlsx.write('mySpreadsheet.xlsx', data, function (err) {
        // Error handling here
    });

  This will write a spreadsheet like this:

    Name    | Location
    --------+---------
    Bob     | Sweden
    Alice   | France

  In other words: The key names are used for the first row (headers),
  The values are used for the columns. All field names should be present
  in the first row.

## Advanced usage

  You can also use the full API manually. This allows you to build the
  spreadsheet incrementally:

    var XlsxWriter = require('xlsx-writer');

    var writer = new XlsxWriter('mySpreadsheet.xlsx');

    // Add some rows
    writer.addRow({
        "Name": "Bob",
        "Location": "Sweden"
    });
    writer.addRow({
        "Name": "Alice",
        "Location": "France"
    });

    // Optional: Adjust column widths
    writer.defineColumns([
        { width: 30 }, // width is in 'characters'
        { width: 10 }
    ])

    // Finalize the spreadsheet. Pass compression options here.
    var buf = writer.pack();

    fs.writeFile('mySpreadsheet.xlsx', buf, 'binary', function(err){
      // ...  
    });

## Data Types
  
  Numbers, Strings, and Dates are automatically converted when inputted. Simply
  use their native types:

    writer.addRow({
        "A String Column" : "A String Value",
        "A Number Column" : 12345,
        "A Date Column" : new Date(1999,11,31)
    })

## Speed

The XLSX format is actually a zip file, and Node-XLSX-Writer uses [node-zip](https://github.com/daraosn/node-zip) internally.
Node-zip generates zip files synchronously but is very fast.

Pending a possible asynchronous rework, if speed is a big concern to you, run `pack()` in 
a thread using something like [node-webworker-threads](https://github.com/audreyt/node-webworker-threads).

This repo contains a simple benchmark suite that can give you an idea of how this module
will perform using a 10x10 and 200x200 dataset. The following are results on an 2.6GHz i7 Mac Mini:

```
Running suite Node-Xlsx-Writer benchmarks [benchmarks/zip-benchmark.js]...
>> Small dataset (10x10) - Packing x 643 ops/sec ±0.69% (95 runs sampled)
>> Small dataset - Packing (no compression) x 3,057 ops/sec ±1.00% (98 runs sampled)
>> Small dataset - Adding rows x 9,042 ops/sec ±36.26% (32 runs sampled)
>> Small dataset - Generate entire file x 607 ops/sec ±0.79% (95 runs sampled)
>> Large dataset (200x200) - Packing x 2.12 ops/sec ±6.35% (9 runs sampled)
>> Large dataset - Packing (no compression) x 4.29 ops/sec ±10.83% (14 runs sampled)
>> Large dataset - Adding rows x 22.00 ops/sec ±26.83% (41 runs sampled)
>> Large dataset - Generate entire file x 1.89 ops/sec ±9.29% (9 runs sampled)
```

## Contributing

  In lieu of a formal styleguide, take care to maintain the existing coding
  style. Add unit tests for any new or changed functionality.

  All source-code is written in CoffeeScript and is located in the `src`
  folder. Do not edit the generated files in `lib`, they will get overwritten
  (and aren't included in git anyway).

  You can build and test your code using [Grunt](http://gruntjs.com/). The
  default task will clean the source, compiled it and run the tests.

## License 

    (The MIT License)

    Copyright (C) 2013 by Ruben Vermeersch <ruben@savanne.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
