var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , TimeEntry = require('../entities/time_entry')
    , p = require('../misc/promise')

var TimeEntries = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'time_entry', entityPlural:'time_entries',
                entityConstructor: this.newTimeEntry.bind(this)},
                options));
    },
    newTimeEntry: function (data, options)
    {
        return new TimeEntry(this.application, data, options)
    }
})

module.exports = TimeEntries;

