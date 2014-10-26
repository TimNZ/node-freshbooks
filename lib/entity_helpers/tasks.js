var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , Task = require('../entities/task')
    , p = require('../misc/promise')

var Tasks = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'task', entityPlural:'tasks',
                entityConstructor: this.newTask.bind(this)},
                options));
    },
    newTask: function (data, options)
    {
        return new Task(this.application, data, options)
    }
})

module.exports = Tasks;

