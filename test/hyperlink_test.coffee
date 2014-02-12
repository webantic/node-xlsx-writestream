test = require('./common')

test 'hyperlink-test', [
    {
        Name: {value: 'Bob', hyperlink: 'http://www.bob.com'}
        Company: {value: 'Google', hyperlink: 'http://www.google.com'}
    }
    {
        Name: {value: 'Joel Spolsky', hyperlink: 'http://www.joelonsoftware.com'}
        Company: {value: 'Fog Creek', hyperlink: 'http://www.fogcreek.com'}
    }
]
