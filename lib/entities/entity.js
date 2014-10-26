var logger = require('../logger')
    , extend = require('../misc/extend')
    , _ = require('lodash')
    , q = require('q')
    , util = require('util')
    , qs = require('querystring')
    , SchemaObject = require('../schemaobject/schemaobject')
    , dateformat = require('dateformat')

module.exports.SchemaObject = SchemaObject;
module.exports.dateToString = function(value)
{
    return value && dateformat(value,'isoDateTime');
}
module.exports.extend = function(schema, classProps, staticProps)
{
    schema.extend = extend;
    var Entity = schema.extend(
        {
            constructor: function (entityName, application,data, options)
            {
                this.entityName = entityName;
                this._application = application;
                options = options || {};
                this.options = options;
                schema.call(this, data);
                wrap(this);
                this._schemaToObject = this.toObject;
                this.toObject = this._toObject;
                _.isFunction(this.initialize) && this.initialize(options);
            },
            _toObject: function (options)
            {
                return this._schemaToObject(options);
            },
            makeError: function (code,message, data)
            {
                return { code: code, data: data, message: message };
            },
            changes: function (options)
            {
                return _.clone(this.tracking._changes);
            },
            fromXmlObj:function(obj)
            {
                return _.extend(this, obj);
            },
            toXml: function(method,options)
            {
                var obj = {};
                obj[this.entityName] = this.toObject();
                return this.application.js2xml(obj, method, options);
            },
            extractArray: function(src, dest,options)
            {
                options = options || {};
                var items = this.application.asArray(src);
                _.each(items, function (item)
                {
                    var addedItemIndex = dest.push(item) - 1;
                    var addedItem = dest[addedItemIndex];
                    if (item.$ && options.onAttribute )
                    {
                        _.each(item.$, function(value,key)
                        {
                            options.onAttribute(key,value,item,addedItem);
                        })
                    }
                    if (item._ && options.onValue)
                        options.onValue(item._, item,addedItem);
                })

            },
            save: function(method,options, returnId)
            {
                return this.application.post(method, this, options)
                    .then(function(ret)
                    {
                        if (returnId)
                            return ret.response[returnId];
                        else
                            return ret;

                    })

            }
        })

    return Entity.extend(_.extend(classProps, { Entity: Entity }), staticProps);

}

function wrap(that)
{
    Object.defineProperties(that, {
        application: {
            get: function ()
            {
                return that._application;
            }
        }
    })
}
