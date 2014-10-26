var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , Client = require('../entities/client')
    , p = require('../misc/promise')
    , util = require('util')

var Clients = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'client', entityPlural:'clients',
                entityConstructor: this.newClient.bind(this)},
                options));
    },
    newClient: function (data, options)
    {
        return new Client(this.application, data, options)
    }
})

module.exports = Clients;

