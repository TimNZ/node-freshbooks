var express = require('express'),
    freshbooks = require('..'),
    swig = require('swig'),
    fs = require('fs'),
    nodemailer = require('nodemailer')


function getFreshbooksApp(session)
{
    var config={ authorizeCallbackUrl: 'http://localhost:3100/access',
                 account: 'cloudglue',
                 secret: 'fV6sZP5MQ9PR5EkSMpfHQKtzvcKzYyzxv' };


    if (session)
    {
        if (session.oauthAccessToken && session.oauthAccessSecret)
        {
            config.accessToken=session.oauthAccessToken;
            config.accessSecret=session.oauthAccessSecret;
        }
    }
    return new freshbooks.PublicApplication(config);
} 

var app = express();

//set up swig templating
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.set('view cache', false);
swig.setDefaults({ cache: false });


app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: '123456'}));

function authorizeRedirect(req,res,returnTo)
{
    var freshbooksApp = getFreshbooksApp(null,returnTo);
    freshbooksApp.getRequestToken(function (err, token, secret)
    {
        if (!err) {
            req.session.oauthRequestToken = token;
            req.session.oauthRequestSecret = secret;
            req.session.returnto = returnTo;
            var authoriseUrl = freshbooksApp.buildAuthorizeUrl(token);
            res.redirect(authoriseUrl);
        }
        else {
            res.redirect('/error');
        }
    })

}

function authorizedOperation(req,res,returnTo, callback)
{
    if (req.session.oauthAccessToken)
    {
        var freshbooksApp = getFreshbooksApp(req.session);
        callback(freshbooksApp);
    }
    else
        authorizeRedirect(req,res,returnTo);
}

// Home Page
app.get('/', function (req, res)
{
    res.render('index.html');
});

// Redirected from freshbooks with oauth results
app.get('/access', function (req, res)
{
    var freshbooksApp = getFreshbooksApp();

    if (req.query.oauth_verifier && req.query.oauth_token == req.session.oauthRequestToken) {
        freshbooksApp.getAccessToken(req.session.oauthRequestToken, req.session.oauthRequestSecret, req.query.oauth_verifier,
            function (err, accessToken, accessSecret, results)
            {
                req.session.oauthAccessToken = accessToken;
                req.session.oauthAccessSecret = accessSecret;
                var returnTo = req.session.returnto;
                res.redirect(returnTo || '/');
            }
        )
    }
});

app.get('/staff', function (req, res)
{
    authorizedOperation(req,res,'/staff', function(freshbooksApp)
    {
        var staff = [];
        freshbooksApp.entities.staff_members.list({ pager: { callback: pagerCallback}})
            .then(function()
            {
                res.render('staff.html', { staff_members: staff});
            })
            .fail(function(err)
            {
                console.log(err);
                res.render('staff.html', { error: err});
            })

        function pagerCallback(err,response, cb)
        {
            staff.push.apply(staff,response.data);
            cb()
        }
    })
});

app.get('/error', function(req,res)
{
    res.render('error.html', { error: req.query.error});
})

app.get('/clients', function (req, res)
{
    authorizedOperation(req,res,'/clients', function(freshbooksApp)
    {
        var clients = [];
        freshbooksApp.entities.clients.list({ pager: { callback: pagerCallback}})
            .then(function()
            {
                res.render('clients.html', { clients: clients});
            })
            .fail(function(err)
            {
                res.render('clients.html', { error: error});
            })

        function pagerCallback(err,response, cb)
        {
            clients.push.apply(clients,response.data);
            cb()
        }
    })
});


app.get('/timeentries', function (req, res)
{
    authorizedOperation(req,res,'/timeentries', function(freshbooksApp)
    {
        freshbooksApp.entities.time_entries.list()
            .then(function(timeEntries)
            {
                res.render('timeentries.html', { time_entries: timeEntries});
            })
    })
});

app.use('/createtimeentry', function (req, res)
{
    if (req.method == 'GET')
    {
        return res.render('createtimeentry.html');
    }
    else if (req.method == 'POST') {
        authorizedOperation(req, res, '/createtimeentry', function (freshbooksApp)
        {
            var timeEntry = freshbooksApp.entities.time_entries.newTimeEntry({
                project_id: req.body.project_id,
                staff_id: req.body.staff_id,
                task_id: req.body.task_id,
                hours: req.body.hours
            });
            timeEntry.save()
                .then(function (timeEntryId)
                {
                        res.render('createtimeentry.html', { created_time_entry_id: timeEntryId})
                })
                .fail(function (err)
                {
                    res.render('createtimeentry.html', { err: err})
                })

        })
    }
});


app.get('/invoices', function (req, res)
{
    authorizedOperation(req,res,'/invoices', function(freshbooksApp)
    {
        freshbooksApp.entities.invoices.list()
            .then(function(invoices)
            {
                res.render('invoices.html', { invoices: invoices});
            })

    })
});

app.get('/items', function (req, res)
{
    authorizedOperation(req,res,'/items', function(freshbooksApp)
    {
        freshbooksApp.entities.items.list()
            .then(function(items)
            {
                res.render('items.html', { items: items});
            })

    })
});

app.get('/projects', function (req, res)
{
    authorizedOperation(req,res,'/projects', function(freshbooksApp)
    {
        freshbooksApp.entities.projects.list()
            .then(function(projects)
            {
                res.render('projects.html', { projects: projects});
            })

    })
});

app.use('/createinvoice', function (req, res)
{
    if (req.method == 'GET')
    {
        return res.render('createinvoice.html');
    }
    else if (req.method == 'POST') {
        authorizedOperation(req, res, '/createinvoice', function (freshbooksApp)
        {
            var invoice = freshbooksApp.entities.invoices.newInvoice({
                client_id: req.body.client_id
            });
            invoice.save()
                .then(function (invoiceId)
                {
                    res.render('createinvoice.html', { outcome: 'Invoice created', created_invoice_id: invoiceId})
                })
                .fail(function (err)
                {
                    res.render('createinvoice.html', { outcome: 'Error', err: err})
                })

        })
    }
});

app.use('/emailinvoice', function (req, res)
{
    if (req.method == 'GET' && !req.query.a)
    {
        res.render('emailinvoice.html', { id: req.query.id});
    }
    else
    {
        authorizedOperation(req,res,'/emailinvoice?id=' + req.query.id + '&a=1&email=' + encodeURIComponent(req.body.Email), function(freshbooksApp)
        {
            freshbooksApp.entities.invoices.get(req.query.id)
                .then(function(invoice)
                {
                    var transporter = nodemailer.createTransport(); // Direct
                    var mailOptions = {
                        from: 'test@gmail.com',
                        to: req.body.Email || req.query.email,
                        subject: 'Test email for invoice ' + invoice.invoice_id,
                        text: 'Email text',
                        html: 'This is a freshbooks invoice',
                    };
                    transporter.sendMail(mailOptions, function(err,info)
                    {
                        if (err)
                            res.render('emailinvoice.html', { outcome: 'Error', err: err, id: req.query.id});
                        else
                            res.render('emailinvoice.html', { outcome: 'Email sent', id: req.query.id});
                    })

                })
                .fail(function(err)
                {
                    res.render('emailinvoice.html', { outcome: 'Error', err: err, id: req.query.id});
                })

        })

    }
});

app.use(function(req,res,next)
{
    if (req.session)
        delete req.session.returnto;
})
app.listen(3100);
console.log("listening on http://localhost:3100");