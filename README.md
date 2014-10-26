node-freshbooks
===========
An API wrapper for freshbooks (http://developer.freshbooks.com).

Create an Issue for any suggestions

Features
========
* Supports all entities (planned)

* Efficient paging

* Support for Private (password) and OAuth applications


Current Entity Support
======================
Others pending

* Clients

* Tasks

* Projects

* Staff

* Invoices

* Time Entries

* Items


Installation
============

    $ npm install nodefreshbooks


Private Usage
=============
```javascript
var PrivateApplication = require('nodefreshbooks').PrivateApplication;
var privateApp = new PrivateApplication({ token: 'AAAAA', account: '<my freshbooks account name>'});
```


Pubic Usage
=============
```javascript
var PublicApplication = require('nodefreshbooks').PublicApplication;
var publicApp = new PublicApplication({ secret: 'AAAAA', account: '<my freshbooks account name>'});
```


Examples
========
Efficient paging:

```javascript
app.entities.clients.list({ pager: {start:1 /* page number */, callback:onClients}})
    .fail(function(err)
    {
        console.log('Oh no, an error');
    })

/* Called per page */
function onClient(err, response, cb)
{
    var customers = response.data;
    if (response.finished) // finished paging
        ....
    cb(); // Async support
}

```

List filters supported
```javascript
app.entities.clients.list({ filter: {email: 'bob@test.com' }})
    .then(function(clients)
    {
        console.log(clients) // array
    })
    .fail(function(err)
    {
        console.log('Oh no, an error');
    })
```

```
// Get one entity
app.entities.clients.get('123456')
    .then(function(client)
    {
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