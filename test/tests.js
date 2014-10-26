var should = require('should')
    , _ = require('lodash')
    , freshbooks = require('..')
    , util = require('util')

process.on('uncaughtException', function(err)
{
    console.log('uncaught',err)
})

var currentApp;

describe('private application', function ()
{

    describe('create instance', function ()
    {
        it('init instance and set options', function ()
        {
            currentApp = new freshbooks.PrivateApplication({ token: '1', account:'test'});
        })
    })

    describe('clients', function()
    {
        var client;
        it('list', function(done)
        {
            this.timeout(100000);
            currentApp.entities.clients.list({ pager: { start: 1 }})
                .then(function(ret)
                {
                    console.log(ret[0].toObject());
                    done();
                })
                .fail(function(err)
                {
                    done(wrapError(err));
                })
        })
        it('get', function(done)
        {
            this.timeout(100000);
            currentApp.entities.clients.get('109013')
                .then(function(_client)
                {
                    client = _client;
                    done();
                })
                .fail(function(err)
                {
                    done(wrapError(err));
                })
        })
        it('update',function(done)
        {
            this.timeout(100000);
            client.first_name = 'Nick';
            client.save()
                .then(function()
                {
                    done();
                })
                .fail(function(err)
                {
                    done(wrapError(err));
                })

        })
        it('delete',function(done)
        {
            this.timeout(100000);
            currentApp.entities.clients.delete('109080')
                .then(function()
                {
                    done();
                })
                .fail(function(err)
                {
                    done(wrapError(err));
                })
        })
        it.skip('create',function(done)
        {
            var newClient = currentApp.entities.clients.newInvoice({ email: 'jim@xemware.com',first_name: 'Bob', last_name: 'Smith'});
            newClient.save()
                .then(function(savedClient)
                {
                    console.log(savedClient);
                    done();
                })
                .fail(function(err)
                {
                    done(wrapError(err));
                })
        })
    })

});

function wrapError(err)
{
    if (err instanceof Error)
        return err;
    else if (err.statusCode)
        return new Error(err.statusCode + ': ' + err.exception.Message);
    else if (err.code)
        return new Error(err.code+ ': ' + err.error);
}