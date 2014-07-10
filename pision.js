var express = require("express");
var handlebars = require("express3-handlebars");
var fs = require("fs");
var path = require("path");

var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var startDir = (process.argv.length > 2 ? process.argv[2] : ".");
var dirs, disks;

app.get('/', function(req, res)
{
	res.render('home', {dirs: dirs, disks: disks});
});

function listDirectory(dir)
{
	console.log("Listing of: " + dir);

	fs.readdir(dir, function(err, files)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			disks = files.filter(function(value, index, array)
			{
				return path.extname(value) == '.js';
			});

			dirs = files.filter(function(value, index, array)
			{
				return path.extname(value) == '';
			});

			console.log('Directories:\n');

			for(var i = 0; i < dirs.length; i++)
			{
				console.log(dirs[i]);
			}

			console.log('\n\nDisks:\n');

			for(var i = 0; i < disks.length; i++)
			{
				console.log(disks[i]);
			}
		}
	});
}

listDirectory(startDir);

app.listen(3000);
