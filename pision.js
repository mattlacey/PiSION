
/*jshint strict:false*/
/*jshint node:true*/
var express = require('express');
var handlebars = require('express3-handlebars');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').spawn, child;

var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var startDir = (process.argv.length > 2 ? process.argv[2] : '.');
var command = (process.argv.length > 3 ? process.argv[3] : 'sio2bsd');
var dirStack = [];

var root = '/8bit';

console.log('Using command: ' + command);

var data =
{
	dirs: [],
	disks: [],
	message: ''
};

app.get(root, function(req, res)
{
	listDirectory(startDir, res);
});

app.get(root + '/basic', function(req, res)
{
	var args = [process.cwd() + '/basicfiles.atr'];
	runCommand(args, 'BASIC', res);
});

app.get(root + '/load', function(req, res)
{
	var disk = data.disks[req.query.disk];
	var fullpath = dirStack.join('/') + '/' + disk;
	var args = [fullpath, process.cwd() + '/blank.atr'];

	runCommand(args, disk, res);

});

function runCommand(args, message, res)
{
	if(child)
	{
		console.log('Sending kill to PID ' + child.pid);
		child.kill();
		child = null;
	}

	console.log('Running: ' + command + ' with ' + args);

	child = exec(command, args);

	if(child)
	{
		data.message = 'Loaded: ' + message;		
		res.render('home', data);
	}
}

app.get(root + '/dir', function(req, res)
{
	var dir = data.dirs[req.query.dir];
	listDirectory(dir, res);
});

app.get(root + '/up', function(req, res)
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
				return fs.lstatSync(dir + '/' + value).isFile();
			});

			data.dirs = files.filter(function(value)
			{
				return fs.lstatSync(dir + '/' + value).isDirectory();
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
