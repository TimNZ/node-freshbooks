var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , Item = require('../entities/item')
    , p = require('../misc/promise')
    , util = require('util')

var Items = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'item', entityPlural:'items',
                entityConstructor: this.newItem.bind(this)},
                options));
    },
    newItem: function (data, options)
    {
        return new Item(this.application, data, options)
    }
})

module.exports = Items;

