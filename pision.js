var fs = require("fs");
var path = require("path");

var dir = (process.argv.length > 2 ? process.argv[2] : ".");

console.log("Listing of: " + dir);

fs.readdir(dir, function(err, files)
{
	if(err)
	{
		console.log(err);
	}
	else
	{
		var disks = files.filter(function(value, index, array)
		{
			return path.extname(value) == '.js';
		});

		var dirs = files.filter(function(value, index, array)
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
