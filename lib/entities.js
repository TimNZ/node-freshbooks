var _ = require('lodash')
    , logger = require('./logger')

var HELPERS = {
    clients: { file: 'clients'},
    staff_members: { file: 'staffmembers'},
    invoices: { file: 'invoices'},
    items: { file: 'items'},
    tasks: { file: 'tasks'},
    time_entries: { file: 'time_entries'},
    projects: { file: 'projects'}
};

function Entities(application, options)
{
    var self = this;
    logger.debug('Entities::constructor');
    this._application = application;

    _.each(HELPERS, function(entityHelper, id)
    {
        var instance = new (require('./entity_helpers/' + entityHelper.file))(application);
        Object.defineProperty(self, id,  {
            get: function() { return instance }
        })
    })
}

// Static
_.extend(Entities, {

})

// Instance
_.extend(Entities.prototype, {


})

module.exports = Entities;