// Import Package
const
  scrapeIt = require("scrape-it"),
  yaml = require('js-yaml'),
  JM = require('json-mapper'),
  fs = require('fs'),

  creeperItem = require('./creeperItem');


/**
 * function CreeperObject
 * @Author   kingcc
 * @DateTime 2017-03-12T21:57:47+0800
 * @param    {[type]}                 creeperMarks [description]
 * @param    {[type]}                 bookMarks    [description]
 * @return   {[type]}                              [description]
 */

function constructObject(creeperMarks, bookMarks, defaultCreeperObjectConstruct) {
  let
    creeperObjectArray = [],
    nameList = [];

  for (let item of creeperMarks) {
    creeperObjectArray.push(new creeperItem(item, defaultCreeperObjectConstruct));
  }

  for (let i in JM.makeConverter({
      name: ['children', JM.map('name')]
    })(bookMarks).name) {
    nameList.push(JM.makeConverter({
      name: ['children', JM.map('name')]
    })(bookMarks.children[i]).name);
  }

  function mapping(a) {
    let arr = []
    let isNext = function(arg) {
      return typeof arg === 'object'
    }
    for (let i in a) {
      if (isNext(a[i])) {
        arr.push(a[i])
        arr.push(...mapping(a[i]))
      }
    }
    return arr
  }

  // for (let [i, n] of new Map(creeperObjectArray.map((n, i) => [i, n]))) {
  //   for (let [ii, nn] of new Map(nameList.map((n, i) => [i, n]))) {
  //     for (let [iii, nnn] of new Map(nn.map((n, i) => [i, n]))) {
  //       if (nnn.search(n.name) !== -1) {
  //         creeperObjectArray[i].url = bookMarks.children[ii].children[iii].url;
  //       }
  //     }
  //   }
  // }


  let bookArray = mapping(bookMarks)
  for (let i of creeperObjectArray) {
    for (let j of bookArray) {
      j.name = j.name || ''
      if (j.name.indexOf(i.name) !== -1) {
        i.url = j.url
      }
    }
  }
  return creeperObjectArray;
}


/**
 * [creeperObjectCheck description]
 * @Author   kingcc
 * @DateTime 2017-03-14T10:04:12+0800
 * @param    {[type]}                 creeperObject [description]
 * @return   {[type]}                               [description]
 */

function creeperObjectCheck(creeperObject) {
  if (typeof creeperObject.construct.data.title.convert === 'string') {
    eval('creeperObject.construct.data.title.convert=' + creeperObject.construct.data.title.convert);
  }
  if (typeof creeperObject.construct.data.date.convert === 'string') {
    eval('creeperObject.construct.data.date.convert=' + creeperObject.construct.data.date.convert);
  }
  if (typeof creeperObject.construct.data.link.convert === 'string') {
    eval('creeperObject.construct.data.link.convert=' + creeperObject.construct.data.link.convert);
  }
  return creeperObject;
}


/**
 * [creeperDO description]
 * @Author   kingcc
 * @DateTime 2017-03-14T21:23:38+0800
 * @param    {[type]}                 creeperObject [description]
 * @param    {[type]}                 resultArray   [description]
 * @return   {[type]}                               [description]
 */

function creeperDO(creeperObject, resultArray) {
  return scrapeIt(creeperObject.url, {
    articles: creeperObject.construct
  }).then(res => {
    for (let i of res.articles) {
      resultArray.push(i);
    }
  });
}


/**
 * Main Call Block
 * @Author   kingcc
 * @DateTime 2017-03-20T17:31:42+0800
 * @param    {[type]}                 items [description]
 * @param    {...[type]}              args  [description]
 * @return   {[type]}                       [description]
 */

function creeper(items, ...args) {
  // Import config.yml
  try {
    var { path, times, defaultCreeperObjectConstruct, creeperMarks } = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8')),
      bookMarks = JSON.parse(fs.readFileSync(path, 'utf8')).roots.bookmark_bar;
  } catch (err) {
    return new Error('Can\'t Open files .');
  }

  let creeperObjectArray = constructObject(creeperMarks, bookMarks, defaultCreeperObjectConstruct),
    creeperPromiseArray = [],
    resultArray = [];

  creeperObjectArray.forEach((el) => {
    creeperPromiseArray.push(creeperDO(creeperObjectCheck(el), resultArray));
  });

  return Promise.all(creeperPromiseArray)
    .then(res => {
      return new Promise((re, rj) => {
        re(resultArray.sort((a, b) => {
          return b.date.getTime() - a.date.getTime();
        }));
      });
    })
    .then(res => {
      return res.slice(0, items);
    });
};

module.exports = creeper;
