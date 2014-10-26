var _ = require('lodash'),
    logger = require('./logger'),
    OAuth = require('./oauth/oauth').OAuth,
    p = require('./misc/promise'),
    fs = require('fs'),
    extend = require('./misc/extend'),
    dateformat = require('dateformat'),
    querystring = require('querystring'),
    Entities = require('./entities'),
    qs = require('querystring'),
    xml2js = require('xml2js'),
    request = require('request')


function Application(options) {
    logger.debug('Application::constructor');
    this.options = _.merge(_.clone(Application.defaults), options);
    this.init();

    var entities = new Entities(this);

    Object.defineProperties(this, {
        entities: {
            get: function () {
                return entities;
            }
        }
    })
}

Application.extend = extend;

_.extend(Application, {
    defaults: {
        type: '',
        token: '',
        secret: '',
        account: '',
        requestTokenUrl: 'https://<%=x %>.freshbooks.com/oauth/oauth_request.php',
        accessTokenUrl: 'https://<%=x %>.freshbooks.com/oauth/oauth_access.php',
        authorizeUrl: 'https://<%=x %>.freshbooks.com/oauth/oauth_authorize.php',
        authorizeCallbackUrl: '',
        apiEndPointUrl: 'https://<%=x %>.freshbooks.com/api/2.1/xml-in',
        pageMaxRecords: 100
    }
})

_.extend(Application.prototype, {
    init: function () {
    },
    post: function (method, obj, options, callback) {
        var self = this;

        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }
        options = options || {};
        var deferred = p.defer();
        var params = {};

        var endPointUrl = merge(this.options.apiEndPointUrl, { x: this.options.account });
        var xmlStr;
        try {
            if (_.isObject(obj))
                xmlStr = obj.toXml(method,options);
            else if (_.isString(obj))
                xmlStr = obj;
            else
                xmlStr = self.js2xml(null,method,options);
        }
        catch(err) {
            callback && callback(err);
            deferred.reject(err);
            return;
        }

        process.nextTick(doPost)

        function doPost() {
            if (self.options.type == 'public') {
                // OAuth
                self.oa.post(endPointUrl, self.options.accessToken, self.options.accessSecret,xmlStr, function (err, data, res) {

                    if (err && data && data.indexOf('oauth_problem') >= 0) {
                        var dataParts = qs.parse(data);
                        var errObj = {statusCode: err.statusCode, data: dataParts};
                        deferred.reject(errObj);
                        callback && callback(errObj);
                        return;
                    }
                    processResponse(err, data, res);
                });
            }
            else {
                // Private
                var reqInstance = self.createRequestInstance(endPointUrl, 'POST', xmlStr, function (err, res, body) {
                    processResponse(err, body, res);
                });
            }
        }
        function processResponse(err,data,res)
        {
            self.xml2js(data)
                .then(function (obj) {
                    var errObj;
                    if (err) {
                        errObj = {statusCode: err.statusCode};
                    }
                    if (obj.response.$.status == 'fail')
                    {
                        var errObj = {error: obj.response.error, code: obj.response.code};
                    }
                    if (errObj)
                    {
                        deferred.reject(errObj);
                        callback && callback(errObj);
                        return;
                    }

                    var ret = {response: obj.response, res: res};
                    if (options.entityConstructor) {
                        ret.entities = self.convertEntities(obj.Response, options);
                    }
                    deferred.resolve(ret);
                    callback && callback(null, obj, res, ret.entities);

                })

        };
        return deferred.promise;
    },
    get: function (method, options, callback) {
        var self = this;
        options = options || {};
        var getOptions = _.extend({}, options.filter);
        if (!_.isEmpty(options.pager))
        {
            getOptions.per_page = options.pager.per_page || this.options.pageMaxRecords;
        }

        var deferred, promise;
        deferred = p.defer();
        promise = deferred.promise;

        if (!_.isEmpty(options.pager))
            getResource(options.pager.start || 1)
        else
            getResource();

        return promise;
        function getResource(offset) {
            var endPointUrl = merge(self.options.apiEndPointUrl, { x: self.options.account});
            var params = {};
            if (offset) {
                getOptions.page = offset;
            }

            var xmlStr;
            try {
                xmlStr = self.js2xml(null,method,getOptions);
            }
            catch(err) {
                callback && callback(err);
                deferred.reject(err);
                return;
            }

            if (self.options.type == 'public') {
                self.oa.post(endPointUrl, self.options.accessToken, self.options.accessSecret, xmlStr, function (err, data, res) {
                    if (options.stream && !err) {
                        // Already done
                        return deferred.resolve();
                    }
                    if (err && data && data.indexOf('oauth_problem') >= 0) {
                        var dataParts = qs.parse(data);
                        var errObj = {statusCode: err.statusCode, data: dataParts};
                        deferred.reject(errObj);
                        callback && callback(errObj);
                        return;
                    }
                    processResponse(err,data,res);
                });
            }
            else
            {
                var reqInstance = self.createRequestInstance(endPointUrl,'POST',xmlStr, function(err,res,body)
                {
                    processResponse(err,body,res);
                });
            }

            function processResponse(err,data,res)
            {
                self.xml2js(data)
                    .then(function (obj) {
                        var ret = {response: obj.response, res: res};
                        var errObj;
                        if (err) {
                            errObj = {statusCode: err.statusCode};
                        }
                        if (obj.response.$.status == 'fail')
                        {
                            var errObj = {error: obj.response.error, code: obj.response.code};
                        }
                        if (errObj)
                        {
                            deferred.reject(errObj);
                            callback && callback(errObj);
                            return;
                        }
                        if (options.pager && options.pager.callback) {
                            options.pager.callback(err, ret, function (err, result) {
                                result = _.defaults({}, result, {recordCount: 0, stop: false});
                                if (!result.stop)
                                    getResource(result.nextOffset || ++offset);
                                else
                                    done();
                            })
                            return;
                        }

                        done();

                        function done() {
                            deferred.resolve(ret);
                            callback && callback(null, obj, res);
                        }
                    })
            };

        }
    },
    createRequestInstance: function(url,method,body,callback)
    {
        var reqOpts = {
            url: url,
            method: method,
            headers: {
                'Content-Length': body.length,
                'Authorization': 'Basic ' + new Buffer(this.options.token + ':X').toString('base64')
            },
            body: body
        };
        return request(reqOpts,callback);
    },
    asArray: function (obj) {
        if (_.isArray(obj))
            return obj;
        else if (!_.isUndefined(obj))
            return [obj];
    },
    convertEntities: function (obj, options) {
        var entities = [];
        var entitiesTop = _.deepResult(obj, options.entityPath);
        if (!entitiesTop)
            return;

        if (_.isArray(entitiesTop)) {
            _.each(entitiesTop, function (entityObj) {
                addEntity(entityObj);
            })
        }
        else {
            addEntity(entitiesTop);
        }
        return entities;

        function addEntity(entityObj) {
            var entity = options.entityConstructor();
            entity.fromXmlObj(entityObj);
            entities.push(entity);
        }
    },

    getEntities: function (method,options,callback) {
        var self = this;
        var clonedOptions = _.clone(options || {});


        var callerPagerCallback;
        if (clonedOptions.pager) {
            callerPagerCallback = clonedOptions.pager.callback;
            clonedOptions.pager.callback = pagerCallback;
        }

        return this.get(method,options,callback)
            .then(function (ret) {
                if (ret && ret.response)
                    return self.convertEntities(ret.response, clonedOptions);
            })


        function pagerCallback(err, result, cb) {

            if (err) {
                if (callerPagerCallback)
                    callerPagerCallback(err, null,
                        function () {
                            cb(err);
                        })
                else
                    cb(err);
            }
            else {
                var entities = self.convertEntities(result.response, clonedOptions);
                result = {
                    recordCount: entities.length,
                    stop: entities.length < self.options.pageMaxRecords
                };

                if (callerPagerCallback)
                    callerPagerCallback(err, {
                        data: entities,
                        finished: entities.length < self.options.pageMaxRecords
                    },
                    function (err, _result) {
                        _.merge(result,_result)
                        cb(err, result);
                    });
                else
                    cb(err,result);
            }
        }
    },
    xml2js: function (xml) {
        var parser = new xml2js.Parser({explicitArray: false});
        return p.nbind(parser.parseString, parser)(xml);
    },
    js2xml: function (obj, method,options) {
        options = options || {};
        var builder = new xml2js.Builder({rootName: 'request', xmldec: { version: '1.0', encoding: 'UTF-8'}});
        var data = {
            '$': {
                method: method
            }
        };

        _.extend(data,options,obj);
        return builder.buildObject(data);
    }
})


var PrivateApplication = Application.extend({
    constructor: function (options) {
        logger.debug('PrivateApplication::constructor');
        Application.call(this, _.extend({}, options, {type: 'private'}));
    },
    init: function () {
        Application.prototype.init.apply(this, arguments);
    }

});

var RequireAuthorizationApplication = Application.extend({
    constructor: function (options) {
        logger.debug('RequireAuthorizationApplication::constructor');
        Application.call(this, options);
    },
    init: function () {
        Application.prototype.init.apply(this, arguments);
    },
    getRequestToken: function (extras, callback) {
        if (_.isFunction(extras)) {
            callback = extras;
            extras = {};
        }
        extras = extras || {};

        var deferred = p.defer();
        this.oa.getOAuthRequestToken(extras, function (err, token, secret, results) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve({token: token, secret: secret, results: results});
            callback && callback.apply(callback, arguments);
        });
        return deferred.promise;
    },
    getAccessToken: function (token, secret, verifier, callback, options) {
        var deferred = p.defer();
        this.oa.getOAuthAccessToken(token, secret, verifier,
            function (err, token, secret, results) {
                if (err)
                    deferred.reject(err);
                else
                    deferred.resolve({token: token, secret: secret, results: results});
                callback && callback.apply(callback, arguments);
            })
        return deferred.promise;
    },
    buildAuthorizeUrl: function (requestToken, other) {
        var q = _.extend({}, {oauth_token: requestToken}, other);
        return merge(this.options.authorizeUrl,{ x: this.options.account}) + '?' + querystring.stringify(q);
    }
});


var PublicApplication = RequireAuthorizationApplication.extend({
    constructor: function (options) {
        logger.debug('PublicApplication::constructor');
        RequireAuthorizationApplication.call(this, _.extend({}, options, {type: 'public'}));
    },
    init: function () {
        RequireAuthorizationApplication.prototype.init.apply(this, arguments);
        this.oa = new OAuth(
            merge(this.options.requestTokenUrl,{ x: this.options.account}) ,
            merge(this.options.accessTokenUrl,{ x: this.options.account}),
            this.options.account,
            this.options.secret,
            "1.0",
            this.options.authorizeCallbackUrl,
            "PLAINTEXT"
        );

    }
});

function merge(s, c)
{
    return _.template(s,c);
}
module.exports.PrivateApplication = PrivateApplication;
module.exports.PublicApplication = PublicApplication;
module.exports.Application = Application;