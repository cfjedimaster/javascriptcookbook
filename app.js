var express = require('express');
var app = express();

var ArticleProvider = require('./articleprovider-mongo').ArticleProvider;
var articleProvider = new ArticleProvider('localhost',27017);

var hbs = require('hbs');
var hbHelpers = require('./hbHelpers');
hbs.registerHelper('dateFormat',hbHelpers.dateFormat);

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
    articleProvider.findLatest(5,function(err, data) {
        res.render('index',{articles:data,homepage:true});
    });
});

//Todo: Secure
app.get('/article/new', function(req, res) {
    res.render('articlenew', { title: "New Article" });    
});

app.post('/article/new', function(req, res) {
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
		res.render('article', {article:article, title:article.title});
	});
});


app.get('/tags', function(req, res) {
	articleProvider.getTags(function(error, tags) {
		res.send(JSON.stringify(tags));
	});
});
app.listen(3000);