var _ = require('lodash')
    , logger = require('../logger')
    , EntityHelper = require('./entity_helper')
    , Invoice = require('../entities/invoice')
    , InvoiceLine = require('../entities/invoice').InvoiceLine
    , p = require('../misc/promise')
    , util = require('util')

var Invoices = EntityHelper.extend({
    constructor: function (application, options)
    {
        EntityHelper.call(this, application, _.extend({ entityName:'invoice', entityPlural:'invoices',
            entityConstructor: this.newInvoice.bind(this), idField: 'invoice'},
            options));
    },
    newInvoice: function (data, options)
    {
        return new Invoice(this.application, data, options)
    },
    newInvoiceLine: function (data, options)
    {
        return new InvoiceLine(this.application, data, options)
    },
    addOrUpdateLines: function(mode,invoiceId, lines)
    {
        var linesToAdd = [];
        _.forEach(lines, function (line)
        {
            linesToAdd.push({line: line.toObject()})
        })
        return this.application.post('invoice.lines.' + mode,this.application.js2xml({ staff: linesToAdd, invoice_id: invoiceId}));
    },
    addLines: function(invoiceId,lines)
    {
        return this.addOrUpdateLines('add',invoiceId,lines);
    },
    updateLines: function(invoiceId,lines)
    {
        return this.addOrUpdateLines('update',invoiceId,lines);
    },
    deleteLine: function(invoiceId,lineId)
    {
        return this.application.post('invoice.lines.delete',this.application.js2xml({ line_id: lineId, invoice_id: invoiceId}));

    }

})

module.exports = Invoices;

