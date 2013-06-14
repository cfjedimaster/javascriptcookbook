
exports.adminindex = function(req, res) {
	res.render('admin', {title:'Admin'});	
};

exports.adminlist = function(req, res) {
	req.app.get('articleProvider').findAll(function(error, articles) {
		res.render('admin_list', {articles:articles,title:'Admin - List'});
	});
};

exports.articleedit = function(req, res) {
	var id = req.param('id');
	if(id) {
		req.app.get('articleProvider').findById(id,function(err, ob) {
			res.render('articleedit', {title: "Edit Article", article:ob});
		});
	} else {
		res.render('articleedit', { title: "New Article" });
	}
};

exports.articlesave = function(req, res) {
	if(req.param('delete') == 'delete') {
		req.app.get('articleProvider').delete(req.param('_id'), function(err) {
			res.redirect('/admin');
		});
	} else {
		req.app.get('articleProvider').save({
			title:req.param('title'), 
			body:req.param('body'),
			tags:req.param('tags'),
			sourceurl:req.param('sourceurl'),
			sourceauthor:req.param('sourceauthor'),
			code:req.param('code'),
			created_at:req.param('created_at'),
			_id:req.param('_id')
		}, function(err, docs) {
		   res.redirect('/admin'); 
		});
	}
};