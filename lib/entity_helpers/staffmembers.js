var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , Staff = require('../entities/staff')
    , p = require('../misc/promise')
    , util = require('util')

var StaffMembers = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'staff', entityPlural:'staff_members', entityConstructor: this.newStaff.bind(this)},
                options));
    },
    newStaff: function (data, options)
    {
        return new Staff(this.application, data, options)
    },
    delete: function()
    {
        throw new Error('Not Supported');
    },
    list: function(options)
    {
        options = options || {};
        options.entityPath = 'staff_members.member';
        return EntityHelper.prototype.list.call(this, options);
    }
})

module.exports = StaffMembers;

