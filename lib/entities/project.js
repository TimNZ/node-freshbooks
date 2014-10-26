var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')

var ProjectTaskSchema = new Entity.SchemaObject({
    task_id: { type: String, toObject: 'hasValue' },
    rate: { type: Number, toObject: 'hasValue' }
});
var ProjectStaffSchema = new Entity.SchemaObject({
    staff_id: { type: String, toObject: 'hasValue' },
});

var ProjectSchema = new Entity.SchemaObject({
    project_id: { type: String, toObject: 'hasValue' },
    name: { type: String, toObject: 'hasValue' },
    description: { type: String, toObject: 'hasValue' },
    client_id: { type: String, toObject: 'hasValue' },
    bill_method: { type: String, toObject: 'hasValue' },
    rate: { type: Number, toObject: 'hasValue' },
    hour_budget: { type: Number, toObject: 'hasValue' },
    budget: { type: { hours: { type: Number, toObject: 'hasValue' }}, toObject: 'always' },
    tasks: { type: Array, arrayType: ProjectTaskSchema, toObject: 'always'},
    staff: { type: Array, arrayType: ProjectStaffSchema, toObject: 'always'}
});


var Project = Entity.extend(ProjectSchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Project::constructor');
        this.Entity.call(this,'project',application, data,options);
    },
    save:function(options)
    {
        var method = this.project_id ? 'project.update' : 'project.create';
        return this._super(method, options,'project_id');
    },
    fromXmlObj: function (obj)
    {
        var self = this;
        _.extend(self, _.omit(obj, 'tasks', 'staff'));
        if (obj.tasks) {
            this.extractArray(obj.tasks.task, this.tasks);
        }
        if (obj.staff) {
            this.extractArray(obj.staff.staff, this.staff);
        }

        return this;
    },
    toXml: function (method, options)
    {
        var project = _.omit(this.toObject(), 'tasks','staff','budget');
        if (!_.isEmpty(this.budget))
            project.budget = this.budget.toObject();
        if (!_.isEmpty(this.tasks)) {
            project.tasks = [];
            _.forEach(this.tasks, function (task)
            {
                project.tasks.push({tasks: task.toObject()})
            })
        }
        if (!_.isEmpty(this.staff)) {
            project.staff = [];
            _.forEach(this.staff, function (staff)
            {
                project.staff.push({staff: staff.toObject()})
            })
        }

        return this.application.js2xml({ client: project }, method, options);
    }

});


module.exports = Project;
module.exports.ProjectSchema = ProjectSchema;
