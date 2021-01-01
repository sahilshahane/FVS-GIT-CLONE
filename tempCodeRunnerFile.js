const fs = require('fs');
const path = require('path');

fs.readdirSync(__dirname, (err, files) => {
  console.log("inside");
  if(err){
    return console.log("there was an error");
  }
  files.map((file) => {
    console.log(path.join(__dirname, file));
    console.log(fs.lstatSync().isDirectory())
  })
})
