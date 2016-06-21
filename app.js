var express = require('express');
var promise = require('bluebird');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

var options = {
	promiseLib: promise
};

var pgp = require('pg-promise')(options);

//database access credentials
var un = 'postgres'; //database username
var pw = '12345'; //database password

var db = pgp('postgres://' + un + ':' + pw + '@localhost:5432/todo');

app.set('view engine','hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));



//"users"ROUTES"BELOW
/* "/users"
* GET: view entire to-do list
* POST: creates a new list entry
*/
app.get("/", function(req,res,next){
	res.send("<p>Click <a href='/entries'>here</a> to view Ryan's to-do list app!</p>");
});

app.get("/entries", function(req, res, next) {
	db.any('SELECT * FROM entries')
	.then(function(data){
		res.render('index', {data: data});
	})
	.catch(function(err){
		return next(err);
	});
});

app.get('/entries/:id', function(req,res,next){
	db.one('SELECT * FROM entries WHERE id= $1', req.params.id)
	.then(function(data){
		res.render('entry', {id: data.id, message: data.data, date: data.date});
	})
	.catch(function(err){
		return next(err);
	});
});

app.post('/entries', function(req,res,next){
	db.none('INSERT INTO entries (data,date) values (${text},${date})', req.body)
	.then(function(){
		res.redirect('/entries');
	})
	.catch(function(err){
		return next(err);
	});
});

app.post('/updateentry/:id', function(req,res,next){
	var text = req.body.text;
	var date = req.body.date;
	db.none("UPDATE entries SET data='" + text + "', date='" + date + "' WHERE id=" + req.params.id)
	.then(function(){
		res.redirect('/entries/' + req.params.id);
	})
	.catch(function(err){
		return next(err);
	});
});

app.post('/entries/:id', function(req,res,next){
	db.none('DELETE FROM entries WHERE id=$1', req.params.id)
	.then(function(){
		res.redirect('/entries');
	})
	.catch(function(err){
		return next(err);
	});
});

app.post('/deletefromentries', function(req,res,next){
	db.none('DELETE FROM entries WHERE id=$1', req.body.id)
	.then(function(){
		res.redirect('/entries');
	})
	.catch(function(err){
		return next(err);
	});
});

/* "/users/:id"
* GET: find entry by id
* PUT: update entry by id
* DELETE: deletes entry by id
*/

app.listen(3000, function(){
	console.log("Listening on port 3000.")
});