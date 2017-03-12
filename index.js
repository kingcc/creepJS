// Import Package
const
  scrapeIt = require("scrape-it"),
  yaml = require('js-yaml'),
  JM = require('json-mapper'),
  fs = require('fs'),

  creeperItem = require('./creeperItem');

// Define Const Var
const
  log = console.log;

// Import config.yml
try {
  var { path, times, defaultCreeperObject, creeperMarks } = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8')),
    bookMarks = JSON.parse(fs.readFileSync(path, 'utf8')).roots.bookmark_bar;
} catch (err) {
  log(err);
}

/**
 * CreeperObject Getter
 * @Author   kingcc
 * @DateTime 2017-03-12T21:57:47+0800
 * @param    {[type]}                 creeperMarks [description]
 * @param    {[type]}                 bookMarks    [description]
 * @return   {[type]}                              [description]
 */
function constructObject(creeperMarks, bookMarks) {
  let creeperObjectArray = [],
    nameList = [];

  for (let item of creeperMarks) {
    creeperObjectArray.push(new creeperItem(item));
  }

  for (let i in JM.makeConverter({
      name: ['children', JM.map('name')]
    })(bookMarks).name) {
    nameList.push(JM.makeConverter({
      name: ['children', JM.map('name')]
    })(bookMarks.children[i]).name);
  }


  for (let [i, n] of new Map(creeperObjectArray.map((n, i) => [i, n]))) {
    for (let [ii, nn] of new Map(nameList.map((n, i) => [i, n]))) {
      for (let [iii, nnn] of new Map(nn.map((n, i) => [i, n]))) {
        if (nnn.search(n.name) !== -1) {
          creeperObjectArray[i].url = bookMarks.children[ii].children[iii].url;
        }
      }
    }
  }

  return creeperObjectArray;
}

/**
 * [creeper description]
 * @Author   kingcc
 * @DateTime 2017-03-12T21:58:21+0800
 * @param    {[type]}                 creeperObject [description]
 * @return   {[type]}                               [description]
 */
function creeper(creeperObject) {
  // scrapeIt("http://ionicabizau.net", {
  //   title: ".header h1",
  //   desc: ".header h2",
  //   avatar: {
  //     selector: ".header img",
  //     attr: "src"
  //   }
  // }).then(page => {
  //   log(page);
  // });
}

//Main Call Block
let creeperObjectArray = constructObject(creeperMarks, bookMarks);


// Construct Creeper Object
