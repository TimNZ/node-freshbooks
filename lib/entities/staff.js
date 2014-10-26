var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')
    , dateformat = require('dateformat')

var StaffSchema = new Entity.SchemaObject({
    staff_id: { type: String, toObject: 'hasValue' },
    username: { type: String, toObject: 'hasValue' },
    first_name: { type: String, toObject: 'hasValue' },
    last_name: { type: String, toObject: 'hasValue' },
    email: { type: String, toObject: 'hasValue' },
    business_phone: { type: String, toObject: 'hasValue' },
    mobile_phone: { type: String, toObject: 'hasValue' },
    rate: { type: String, toObject: 'hasValue' },
    last_login: { type: Date, toObject: 'hasValue' },
    number_of_logins: { type: Number, toObject: 'hasValue' },
    signup_date: { type: Date, toObject: 'hasValue' },
    street1: { type: String, toObject: 'hasValue' },
    street2: { type: String, toObject: 'hasValue' },
    city: { type: String, toObject: 'hasValue' },
    state: { type: String, toObject: 'hasValue' },
    country: { type: String, toObject: 'hasValue' },
    code: { type: String, toObject: 'hasValue' }
});


var Staff = Entity.extend(StaffSchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Staff::constructor');
        this.Entity.call(this,'staff',application, data,options);
    },
    save:function(options)
    {
        throw new Error('Not Supported');
    }
});


module.exports = Staff;
module.exports.StaffSchema = StaffSchema;
