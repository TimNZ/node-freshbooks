var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')
    , dateformat = require('dateformat')

var ContactSchema  = new Entity.SchemaObject({
    contact_id: { type: String, toObject: 'hasValue' },
    username: { type: String, toObject: 'hasValue' },
    first_name: { type: String, toObject: 'hasValue' },
    last_name: { type: String, toObject: 'hasValue' },
    email: { type: String, toObject: 'hasValue' },
    phone1: { type: String, toObject: 'hasValue' },
    phone2: { type: String, toObject: 'hasValue' },
});

var CreditSchema = new Entity.SchemaObject({
    currency: { type: String, toObject: 'hasValue' },
    amount: { type: Number, toObject: 'hasValue' }
});

var ClientSchema = new Entity.SchemaObject({
    client_id: { type: String, toObject: 'hasValue' },
    first_name: { type: String, toObject: 'hasValue' },
    last_name: { type: String, toObject: 'hasValue' },
    organization: { type: String, toObject: 'hasValue' },
    email: { type: String, toObject: 'hasValue' },
    username: { type: String, toObject: 'hasValue' },
    tasks: { type: Array, arrayType: ContactSchema, toObject: 'always'},
    work_phone: { type: String, toObject: 'hasValue' },
    home_phone: { type: String, toObject: 'hasValue' },
    mobile: { type: String, toObject: 'hasValue' },
    fax: { type: String, toObject: 'hasValue' },
    language: { type: String, toObject: 'hasValue' },
    currency_code: { type: String, toObject: 'hasValue' },
    credits: { type: Array, arrayType: CreditSchema, toObject: 'always'},
    p_street1: { type: String, toObject: 'hasValue' },
    p_street2: { type: String, toObject: 'hasValue' },
    p_city: { type: String, toObject: 'hasValue' },
    p_state: { type: String, toObject: 'hasValue' },
    p_country: { type: String, toObject: 'hasValue' },
    p_code: { type: String, toObject: 'hasValue' },
    s_street1: { type: String, toObject: 'hasValue' },
    s_street2: { type: String, toObject: 'hasValue' },
    s_city: { type: String, toObject: 'hasValue' },
    s_state: { type: String, toObject: 'hasValue' },
    s_country: { type: String, toObject: 'hasValue' },
    s_code: { type: String, toObject: 'hasValue' },
    links: { type: {
        client_view: { type: String, toObject: 'hasValue' },
        view: { type: String, toObject: 'hasValue' },
        statement: { type: String, toObject: 'hasValue' }
    }},
    vat_name: { type: String, toObject: 'hasValue' },
    vat_number: {type: String, toObject: 'hasValue'},
    folder: {type: String, toObject: 'hasValue'},
    updated: { type: String, toObject: 'hasValue' }
});


var Client = Entity.extend(ClientSchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Client::constructor');
        this.Entity.call(this,'client',application, data,options);
    },
    fromXmlObj: function (obj)
    {
        var self = this;
        _.extend(self, _.omit(obj, 'contacts', 'credits'));
        if (obj.tasks) {
            this.extractArray(obj.tasks.contact, this.tasks);
        }
        if (obj.credits) {
            this.extractArray(obj.credits.credit, this.credits,
                { onAttribute: function(path,value, srcObject, destObject)
                {
                    destObject[path] = value;
                }, onValue: function(value, srcObject, destObject)
                {
                    destObject.amount = value;
                }});
        }

        return this;
    },
    toXml: function (method, options)
    {
        var client = _.omit(this.toObject(), 'links','contacts', 'credits');
        if (!_.isEmpty(this.tasks)) {
            client.tasks = [];
            _.forEach(this.tasks, function (contact)
            {
                client.tasks.push({contact: contact.toObject()})
            })
        }
        if (!_.isEmpty(this.credits)) {
            client.credits = [];
            _.forEach(this.credits, function (credit)
            {
                var c = { $: { currency: credit.currency}, _: credit.amount};
                client.credits.push({credit: c })
            })
        }
        return this.application.js2xml({ client: client }, method, options);
    },
    save:function(options)
    {
        var method = this.client_id ? 'client.update' : 'client.create';
        return this._super(method, options,'client_id');
    }
});


module.exports = Client;
module.exports.ClientSchema = ClientSchema;
