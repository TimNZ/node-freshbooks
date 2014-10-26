var logger = require('../logger')
    , extend = require('../misc/extend')
    , _ = require('lodash')
    , promise = require('../misc/promise')
    , util = require('util')
    , qs = require('querystring')

function EntityHelper(application, options)
{
    var self = this;
    logger.debug('EntityHelper::constructor');
    this._application = application;
    this._options = options || {};
    Object.defineProperties(this, {
        application: {
            get: function() { return self._application; }
        }
    })

}
EntityHelper.extend = extend;

_.extend(EntityHelper.prototype, {
    delete: function(id)
    {
        var filter = {};
        filter[this._options.entityName + '_id'] = id;
        return this.application.post(this._options.entityName + '.delete', null, filter)
    },
    getEntities: function (method,options)
    {
        options = options || {};
        var clonedOptions = _.clone(options || {});
        if (!options.entityPath) {
            clonedOptions.entityPath = this._options.entityPlural;
            if (this._options.entityName)
                clonedOptions.entityPath += '.' + this._options.entityName;
        }

        return this.application.getEntities(method, clonedOptions);
    },
    streamEntity: function(options)
    {
        options = options || {};
        var path = options.path || this._options.entityPlural;
        path += '/' + options.id;

        return this.application.get(path, options);
    },
    get: function (id,options)
    {
        options = options || {};
        var filter = {};
        filter[this._options.entityName + '_id'] = id;
        return this.list({ entityPath: options.entityPath || this._options.entityName, filter: filter},this._options.entityName + '.get')
            .then(function (entities)
            {
                return _.first(entities);
            })
    },
    list: function (options,method)
    {
        var self = this;
        var clonedOptions = _.clone(options || {});
        clonedOptions.entityConstructor = function(data) { return self._options.entityConstructor(data)};
        return EntityHelper.prototype.getEntities.call(this,method || this._options.entityName + '.list',clonedOptions)
    }


})
module.exports = EntityHelper;


