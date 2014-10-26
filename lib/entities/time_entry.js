var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')

var TimeEntrySchema = new Entity.SchemaObject({
    time_entry_id: { type: String, toObject: 'hasValue' },
    staff_id: { type: String, toObject: 'hasValue' },
    project_id: { type: String, toObject: 'hasValue' },
    task_id: { type: String, toObject: 'hasValue' },
    hours: { type: Number, toObject: 'hasValue' },
    date: { type: String, toObject: 'hasValue' },
    notes: { type: String, toObject: 'hasValue' },
    billed: { type: Boolean , toObject: 'hasValue' },
});


var TimeEntry = Entity.extend(TimeEntrySchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Task::constructor');
        this.Entity.call(this,'task',application, data,options);
    },
    save:function(options)
    {
        var method = this.time_entry_id ? 'time_entry.update' : 'time_entry.create';
        return this._super(method, options, 'time_entry_id');
    },
    fromXmlObject: function()
    {
        var self = this;
        _.extend(self, _.omit(obj, 'billed'));
        this.billed = obj.billed && (obj.billed == '1' || obj.billed == 'true');
        return this;
    },
    toXml: function(method,options)
    {
        var timeEntry = _.omit(this.toObject(), 'billed');
        timeEntry.billed = this.billed ? '1' : '0';
        return this.application.js2xml({ time_entry: timeEntry }, method, options);
    }
});


module.exports = TimeEntry;
module.exports.TimeEntrySchema = TimeEntrySchema;
