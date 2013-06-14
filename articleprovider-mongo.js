/*
Data Model:

title
body (really a short-ish description of what this item does)
sourceurl (where did I find the snippet)
sourceauthor (ditto - both this and sourceurl may be blank)
code
tags
created_at, updated_at
sesURL (used for links)


*/

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
	this.db= new Db('javascriptcookbook', new Server(host, port, {auto_reconnect: true}, {}));
	this.db.open(function(){});
};


ArticleProvider.prototype.getCollection = function(callback) {
	this.db.collection('articles', function(error, article_collection) {
		if( error ) callback(error);
		else callback(null, article_collection);
	});
};

ArticleProvider.prototype.findAll = function(callback) {
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			article_collection.find().toArray(function(error, results) {
				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};


ArticleProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, 						function(error, result) {
					if( error ) callback(error)
					else callback(null, result)
			});
		}
	});
};

ArticleProvider.prototype.findBySES = function(ses, callback) {
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			article_collection.findOne({sesURL: ses}, function(error, result) {
					if( error ) callback(error)
					else callback(null, result)
			});
		}
	});
};

ArticleProvider.prototype.findBySearch = function(term, callback) {
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			var reg = new RegExp(term,"i");
			article_collection.find({$or:[{title: reg},{body:reg}]}).toArray(function(error, results) {				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};

ArticleProvider.prototype.findByTag = function(tag, callback) {
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			article_collection.find({tags: tag}).toArray(function(error, results) {
				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};

ArticleProvider.prototype.findLatest = function(max,callback) {
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			article_collection.find().sort({created_at:-1}).limit(max).toArray(function(error, results) {
				if( error ) callback(error)
				else callback(null, results)
			});
		}
	});
};

ArticleProvider.prototype.generateSESURL = function(title) {
	var newTitle = title.replace(/&amp;/g,"");
	newTitle = newTitle.replace(/&.*?;/g,"");
	newTitle = newTitle.replace(/[^0-9a-z ]/gi, "");
	newTitle = newTitle.replace(/ /g, "-");
	return newTitle;	
}

ArticleProvider.prototype.getTags = function(callback) {
	this.getCollection(function(error, article_collection) {
		if(error) {
			callback(error);
			return;
		}
		article_collection.distinct("tags", function(error, result) {
			if(error) callback(error);
			else callback(null, result);
		});
	});
}

ArticleProvider.prototype.save = function(article, callback) {

	article.sesURL = this.generateSESURL(article.title);
	
	this.getCollection(function(error, article_collection) {
		if( error ) callback(error)
		else {
			article.created_at = new Date();
			if(article.tags.length) {
				article.tags = article.tags.split(',');	
			}
			article.updated_at = new Date();
			console.log(article.title, article.sesURL);
			
			article_collection.insert(article, function() {
				callback(null, article);
			});
		
		
		}
	});
};

exports.ArticleProvider = ArticleProvider;