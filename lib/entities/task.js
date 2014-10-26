var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')

var TaskSchema = new Entity.SchemaObject({
    task_id: { type: String, toObject: 'hasValue' },
    name: { type: String, toObject: 'hasValue' },
    description: { type: String, toObject: 'hasValue' },
    billable: { type: Boolean, toObject: 'hasValue' },
    rate: { type: Number, toObject: 'hasValue' }
});


var Task = Entity.extend(TaskSchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Task::constructor');
        this.Entity.call(this,'task',application, data,options);
    },
    save:function(options)
    {
        var method = this.item_id ? 'task.update' : 'task.create';
        return this._super(method, options,'task_id');
    }
});


module.exports = Task;
module.exports.TaskSchema = TaskSchema;
