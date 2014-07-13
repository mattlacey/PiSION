
/*jshint strict:false*/
/*jshint node:true*/
var express = require('express');
var handlebars = require('express3-handlebars');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec, child;

var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var startDir = (process.argv.length > 2 ? process.argv[2] : '.');
var dirStack = [];

var data =
{
	dirs: [],
	disks: [],
	message: ''
};

app.get('/', function(req, res)
{
	listDirectory(startDir, res);
});

app.get('/load', function(req, res)
{
	var disk = data.disks[req.query.disk];

	var fullpath = '"' + dirStack.join('/') + '/' + disk + '"';

	if(child)
	{
		child.kill();
		child = null;
	}

	console.log('Path: ' + fullpath);

	child = exec('sio2bsd ' + fullpath, function (error, stdout, stderr)
	{
    	if(error !== null)
    	{
			console.log('exec error: ' + error);
			data.message = 'Error: ' + error;
		}
		else
		{
			data.message = 'Loaded: ' + disk;		
		}

		res.render('home', data);
    });
});

app.get('/dir', function(req, res)
{
	var dir = data.dirs[req.query.dir];
	listDirectory(dir, res);
});

app.get('/up', function(req, res)
{

	if(dirStack.length > 1)
	{
		dirStack.pop();

		listDirectory(dirStack[dirStack.length - 1], res);
	}
	else
	{
		listDirectory(startDir, res);
	}
});

function listDirectory(dir, res)
{
	console.log('Listing of: ' + dir);
	
	if(dir != dirStack[dirStack.length - 1])
	{
		dirStack.push(dir);
	}

	dir = dirStack.join('/');

	fs.readdir(dir, function(err, files)
	{
		if(err)
		{
			console.log(err);
			data.message = 'Error: ' + err;
		}
		else
		{
			data.disks = files.filter(function(value)
			{
				return path.extname(value) !== '';
			});

			data.dirs = files.filter(function(value)
			{
				return path.extname(value) === '';
			});

			data.message = 'Current Directory: ' + dir;			
		}

		if(res)
		{
			res.render('home', data);
		}
	});
}

app.listen(3000);
