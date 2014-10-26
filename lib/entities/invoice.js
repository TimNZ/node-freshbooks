var _ = require('lodash')
    , Entity = require('./entity')
    , logger = require('../logger')


var InvoiceContactSchema  = new Entity.SchemaObject({
    contact_id: { type: String, toObject: 'hasValue' }
});

var InvoiceLineSchema  = new Entity.SchemaObject({
    line_id: { type: String, toObject: 'hasValue' },
    amount: { type: Number, toObject: 'hasValue' },
    name: { type: String, toObject: 'hasValue' },
    description: { type: String, toObject: 'hasValue' },
    unit_cost: { type: Number, toObject: 'hasValue' },
    quantity: { type: Number, toObject: 'hasValue' },
    tax1_name: { type: String, toObject: 'hasValue' },
    tax1_percent: { type: Number, toObject: 'hasValue' },
    tax2_name: { type: String, toObject: 'hasValue' },
    tax2_percent: { type: Number, toObject: 'hasValue' },
    type: { type: String, toObject: 'hasValue' }
});


var InvoiceSchema = new Entity.SchemaObject({
    client_id: { type: String, toObject: 'hasValue' },
    invoice_id: { type: String, toObject: 'hasValue' },
    contacts: { type: Array, arrayType: InvoiceContactSchema, toObject: 'always'},
    lines: { type: Array, arrayType: InvoiceLineSchema, toObject: 'always'},
    number: { type: String, toObject: 'hasValue' },
    amount: { type: Number, toObject: 'hasValue' },
    amount_outstanding: { type: Number, toObject: 'hasValue' },
    status: { type: String, toObject: 'hasValue' },
    date: { type: String, toObject: 'hasValue' },
    po_number: { type: String, toObject: 'hasValue' },
    discount: { type: Number, toObject: 'hasValue' },
    notes: { type: String, toObject: 'hasValue' },
    currency_code: { type: String, toObject: 'hasValue' },
    folder: { type: String, toObject: 'hasValue' },
    language: { type: String, toObject: 'hasValue' },
    terms: { type: String, toObject: 'hasValue' },
    return_uri: { type: String, toObject: 'hasValue' },
    updated: { type: String, toObject: 'hasValue' },
    recurring_id: { type: String, toObject: 'hasValue' },
    first_name: { type: String, toObject: 'hasValue' },
    last_name: { type: String, toObject: 'hasValue' },
    organization: { type: String, toObject: 'hasValue' },
    p_street1: { type: String, toObject: 'hasValue' },
    p_street2: { type: String, toObject: 'hasValue' },
    p_city: { type: String, toObject: 'hasValue' },
    p_state: { type: String, toObject: 'hasValue' },
    p_country: { type: String, toObject: 'hasValue' },
    p_code: { type: String, toObject: 'hasValue' },
    vat_name: { type: String, toObject: 'hasValue' },
    vat_number: { type: String, toObject: 'hasValue' },
    staff_id: { type: String, toObject: 'hasValue' },
    links: { type: {
        client_view: { type: String, toObject: 'hasValue' },
        view: { type: String, toObject: 'hasValue' },
        statement: { type: String, toObject: 'hasValue' }
    }}

});

var InvoiceLine = Entity.extend(InvoiceLineSchema, {

});

var Invoice = Entity.extend(InvoiceSchema, {
    constructor: function (application, data, options)
    {
        logger.debug('Invoice::constructor');
        this.Entity.call(this,'invoice',application, data,options);
    },
    fromXmlObj: function (obj)
    {
        var self = this;
        _.extend(self, _.omit(obj, 'lines', 'contacts'));
        if (obj.tasks) {
            this.extractArray(obj.tasks.contact, this.tasks);
        }
        if (obj.staff) {
            this.extractArray(obj.staff.line, this.staff);
        }

        return this;
    },
    toXml: function (method, options)
    {
        var invoice = _.omit(this.toObject(), 'links','contacts', 'lines');
        if (!_.isEmpty(this.contacts)) {
            invoice.contacts = [];
            _.forEach(this.contacts, function (contact)
            {
                invoice.contacts.push({contact: contact.toObject()})
            })
        }
        if (!_.isEmpty(this.lines)) {
            invoice.lines = [];
            _.forEach(this.lines, function (line)
            {
                invoice.lines.push({line: line.toObject()})
            })
        }

        return this.application.js2xml({ invoice: invoice }, method, options);
    },
    save:function(options)
    {
        var method = this.invoice_id ? 'invoice.update' : 'invoice.create';
        return this._super(method, options,'invoice_id');
    },
    addLines: function(lines)
    {
        if (!this.invoice_id)
            throw new Error('Must have an invoice_id')
        return this.application.entities.invoices.addLines(this.invoice_id,lines);
    },
    updateLines: function(lines)
    {
        if (!this.invoice_id)
            throw new Error('Must have an invoice_id')
        return this.application.entities.invoices.updateLines(this.invoice_id,lines);
    },
    deleteLine: function(lineId)
    {
        if (!this.invoice_id)
            throw new Error('Must have an invoice_id');
        return this.application.entities.invoices.deleteLine(this.invoice_id,lineId);
    }
});


module.exports = Invoice;
module.exports.InvoiceSchema = InvoiceSchema;
module.exports.InvoiceLineSchema = InvoiceLineSchema;
module.exports.InvoiceContactSchema = InvoiceContactSchema;
module.exports.InvoiceLine = InvoiceLine;
