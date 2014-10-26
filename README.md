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