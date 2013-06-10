var express = require('express');
var app = express();

var ArticleProvider = require('./articleprovider-mongo').ArticleProvider;
var articleProvider = new ArticleProvider('localhost',27017);

var hbs = require('hbs');
var hbHelpers = require('./hbHelpers');
hbs.registerHelper('dateFormat',hbHelpers.dateFormat);
hbs.registerHelper('urlFormat',function(input) {
	return hbs.handlebars.Utils.escapeExpression(input);
});

var fs = require('fs');

app.configure(function() {
    app.set('view engine', 'html');
    app.engine('html', hbs.__express);
    
    app.use("/public",express.static(__dirname + '/public'));
    
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret:'foo'}));
    
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.locals({
    title:"JavaScript Cookbook"
});

app.get('/', function(req,res) {
	/*
	Tiny bit of callback hell here (callback heck?)
	*/
	articleProvider.getTags(function(err, tags) {
		articleProvider.findLatest(5,function(err, data) {
			res.render('index',{articles:data,homepage:true,tags:tags});
		});
	});
});

app.get('/about', function(req, res) {
    res.render('about', { title: "JavaScript Cookbook: About" });    
});

//Todo: Secure
app.get('/article/new', secure, function(req, res) {
    res.render('articlenew', { title: "New Article" });    
});

app.post('/article/new', secure, function(req, res) {
    articleProvider.save({
        title:req.param('title'), 
        body:req.param('body'),
		tags:req.param('tags'),
		sourceurl:req.param('sourceurl'),
		sourceauthor:req.param('sourceauthor'),
		code:req.param('code')
    }, function(err, docs) {
       res.redirect('/'); 
    });
});

/*
By ID loader - may return
app.get('/article/:id', function(req, res) {
	articleProvider.findById(req.params.id, function(error, article) {
		res.render('article', {article:article, title:article.title});
	});
});
*/

app.get('/article/:ses', function(req, res) {
	articleProvider.findBySES(req.params.ses, function(error, article) {
		res.render('article', {article:article, title:"JavaScript Cookbook: " + article.title});
	});
});


app.get('/tag/:tag', function(req, res) {
	articleProvider.findByTag(req.params.tag, function(error, articles) {
		res.render('tag', {articles:articles,title:"JavaScript Cookbook: Tag - "+req.params.tag, tag:req.params.tag});
	});
});

app.get('/login', function(req, res) {
    if(req.session.error) {
        res.locals.error = req.session.error;
        delete req.session.error;
    }
    res.render('login',{title:"Admin Login"});		
});

app.post('/login', function(req, res) {
	if(authenticate(req.body.username, req.body.password)) {
		req.session.regenerate(function() {
			req.session.loggedin=true;
			res.redirect('/admin');
		});
	} else {
		req.session.error = 'Invalid login.';        
		res.redirect('/login');
	}
});

app.get('/admin', secure, function(req, res) {
	res.render('admin', {title:'Admin'});	
});

function authenticate(username, password) {
	return (username === app.get('adminusername') && password === app.get('adminpassword'));
}

function secure(req, res, next) {    
    if(req.session.loggedin) {
        next();   
    } else {
        res.redirect('/login');
    }
}

/*
Do a file read to get JSON config for admin credentials
*/
fs.readFile('./adminauth.json', 'utf8', function(err, data) {
	if(err) {
		process.exit(1);	
	}
	data = JSON.parse(data);
	app.set('adminusername', data.username);
	app.set('adminpassword', data.password);
	app.listen(3000);
});

