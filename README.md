node-xero
===========
An API wrapper for freshbooks (http://developer.freshbooks.com).

Supports all three applications types:

* Private (Password)

* OAuth

Create an Issue for any suggestions

Features
========
* Supports all entities

* Efficient paging

* Support for Private (password) and OAuth applications


Installation
============

    $ npm install nodefreshbooks


Private Usage
=============
```javascript
var PrivateApplication = require('nodefreshbooks').PrivateApplication;
var privateApp = new PrivateApplication({ token: 'AAAAA', key: 'BBBBBB'});
```


Pubic Usage
=============
```javascript
var PublicApplication = require('node-xero').PublicApplication;
var publicApp = new PublicApplication({ consumerSecret: 'AAAAA', consumerKey: 'BBBBBB'});
```


Examples
========
Efficient paging:

```javascript
app.customers.get({ pager: {start:1 /* page number */, callback:onCustomers}})
    .fail(function(err)
    {
        console.log('Oh no, an error');
    })

/* Called per page */
function onCustomers(err, response, cb)
{
    var customers = response.data;
    if (response.finished) // finished paging
        ....
    cb(); // Async support
}

```

Filter support: Modified After
```
// No paging
app.customers.get({ })
    .then(function(customers)
    {
        _.each(customers,  function(customer)
        {
            // Do something with customer
        })
    })

```


Tests
==========

npm test


Release History
==============

* 0.0.1
    - Initial Release


### License (MIT)

Copyright (c) 2014 Tim Shnaider

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.