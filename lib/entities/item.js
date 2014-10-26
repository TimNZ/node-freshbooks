var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')
    , dateformat = require('dateformat')

var ItemSchema = new Entity.SchemaObject({
    item_id: { type: String, toObject: 'hasValue' },
    name: { type: String, toObject: 'hasValue' },
    description: { type: String, toObject: 'hasValue' },
    unit_cost: { type: Number, toObject: 'hasValue' },
    quantity: { type: Number, toObject: 'hasValue' },
    inventory: { type: Number, toObject: 'hasValue' },
    folder: { type: String, toObject: 'hasValue' }
});


var Item = Entity.extend(ItemSchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Item::constructor');
        this.Entity.call(this,'item',application, data,options);
    },
    save:function(options)
    {
        var method = this.item_id ? 'item.update' : 'item.create';
        return this._super(method, options,'item_id');
    }
});


module.exports = Item;
module.exports.TaskSchema = ItemSchema;
