var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , Project = require('../entities/project')
    , p = require('../misc/promise')

var Projects = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'project', entityPlural:'projects',
                entityConstructor: this.newProject.bind(this)},
                options));
    },
    newProject: function (data, options)
    {
        return new Project(this.application, data, options)
    }
})

module.exports = Projects;

