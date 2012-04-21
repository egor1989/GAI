var fs = require('fs');
var path = require('path');
var csv = require('csv');

var opts = process.argv.slice(2);

var input_file = opts[0];
var output_file = opts[1];

if (input_file == undefined || output_file == undefined) {
    console.log("script <in> <out>");
    process.exit(-1);
}

var result = [];

csv()
    .fromPath(__dirname + "/" + input_file, { delimiter: ';' })
    .transform(function(data, index){
        return data;
    })
    .on('data',function(data,index){
        var idx = 0;
        var all_empty = true;

        for (idx = 0; idx < data.length; idx++) {
            if (data[idx].trim() != "") {
                all_empty = false;
                break;
            }
        }

        if (all_empty)
            return;

        result.push(data);
    })
    .on('end',function(count){
        console.log('Number of lines: '+count);

        fs.open(output_file, "w+", function(err, fd) {
            if(err) throw err;

            fs.write(fd, JSON.stringify(result, null, '\t'));
            fs.close(fd);
        });
    })
    .on('error',function(error){
        console.log(error.message);
    });
