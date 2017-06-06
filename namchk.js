const ArgumentParser = require('argparse').ArgumentParser;
const ora = require('ora');
const chalk = require('chalk');
var Horseman = require('node-horseman');

//globals
var target;

//colors
var error = chalk.bold.red;
var success = chalk.bold.green;
var warn = chalk.bold.yellow;
var info = chalk.bold.blue

//parser
const parser = new ArgumentParser({
  version: '0.1',
  addHelp: true,
  epilog: "Use wisely."
});

parser.addArgument(
  ['-u', '--username'], {
    help: 'The username to search on namechk.',
    nargs: 1,
    metavar: "username"
  }
);

var args = parser.parseArgs();

if (args.username !== null) {
  if (args.username[0].length > 0) {
    target = args.username[0]
    runSearch(args.username[0])
  } else {
    console.log("Please specify a username!")
    process.exit()
  }
} else {
  console.log("Please specify a username!")
  process.exit()
}

function runSearch(username) {
  //Init spinner
  //const spinner = ora("Initializing...").start();

  //init horseman
  var horseman = new Horseman({
    loadImages: false,
    diskCache: true,
    timeout: 30000,
    injectJquery: false
  })

  horseman
    .open('https://www.namechk.com')
    .waitForSelector('.search-field')
    .click('.search-field')
    .type('input[name=q]', username)
    .click('.search-btn')
    .waitForSelector('.unavailable')
    .wait(40000)
    .evaluate(function() {
      var services = $('.service')
      var results = []
      for (var i = 0; i < services.length; i++) {
        var object = {
          html: services[i].outerHTML,
          name: services[i].innerText,
          innerhtml: services[i].innerHTML
        }
        results.push(object);
      }
      return results
    })
    .then(function(data) {
      //spinner.text = 'Parsing information...'
      for (var i = 0; i < data.length; i++) {

        var service = data[i].html.match('unavailable')
        if (service !== null) {
          console.log(data[i].name)
        }

        var failed = data[i].html.match('failed')
        if (failed !== null) {
          console.log("FAIL! " + data[i].name)
        }
      }
    })
}
