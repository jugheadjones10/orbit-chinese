const { GoogleSpreadsheet } = require("google-spreadsheet");
const googleCreds = require("../google-credentials.json");
require('dotenv').config()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getRows(){
  const doc = new GoogleSpreadsheet("12ACZR7Wfd2qlFvz_8RB18Y_tr4BrzB5vCB2MBNUugVI");
  await doc.useServiceAccountAuth(googleCreds);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Sheet1"];
 const rows = await sheet.getRows();
  console.log(rows)
  return rows.map(x => {
    return {
      word: x["_rawData"][0],
      meaning: "Hey my name is YJ"
    }
  })
}

async function getMacroMetaRows(){
  
  const fetchUrl = process.env.GET_ALL === "true" ?  "https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-user-words": "https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-by-date"

	const body = {
		bindVars: {
      username: "fucker"
		}
	}

  return fetch(fetchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "apikey " + process.env.MACROMETA_API_KEY
    },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(res => Promise.all([import("fisher-yates-shuffle"), res]))
    .then(([ { default: fisherYatesShuffle }, res]) => {
      console.log("response", res)
      console.log("RESULTS", res.result)

      var finalWords = []

      res.result.forEach(item => {

        // console.log("item - pre", item)
        var examples = fisherYatesShuffle(item.examples).slice(0, 2) 
        item.examples = examples
        var arrayCopy = [...examples]
        // console.log("item", item)

        const array = ["coverType", "defType", "examplesType", "examplesType"]
        array.forEach(type => {
          if(type === "examplesType"){
            // console.log("in -item", item)
           finalWords.push({
              ...item,
              type: type,
              frontExample: arrayCopy.pop()
              // frontExample: "成长，不在是那刚拱出地面怯生生的嫩芽，它已经成为狂风暴雨中的娇艳的花朵。成长，意味从此不再留恋雨后的七彩虹云，而要脚踏实地地去奋斗!在成长的路程里，难免会有些牺牲。但我相信，我不会退缩，不会后悔。"
            })
          }else{
            finalWords.push({
              ...item,
              type: type
            })
          }
        })

      })

      // console.log("final words", finalWords)
      return fisherYatesShuffle(finalWords)
    })
    .catch(x => console.log(x))
}

module.exports = {
  rows: getRows,
  macroMetaRows: getMacroMetaRows
}
