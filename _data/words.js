require('dotenv').config()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getMacroMetaRows(){
  
  const fetchUrl = process.env.GET_ALL === "true" ?  "https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-user-words": "https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-by-date"

	const body = {
		bindVars: {
      username: "fucker2"
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
    .then(res => Promise.all([import("project-utils"), res]))
    .then(([ { fisherYatesShuffle }, res]) => {

      var finalWords = []

      res.result.forEach(item => {

        var examples = fisherYatesShuffle(item.examples).slice(0, 2) 
        item.examples = examples
        var arrayCopy = [...examples]
        console.log("item", item)

        const array = ["coverType", "defType", "examplesType", "examplesType"]
        array.forEach(type => {
          if(type === "examplesType"){
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

      finalWords.forEach(x => {
        console.log("WORD: ", x.word, "TYPE: ", x.type)
      })
      console.log("TOTAL COUNT: ", finalWords.length)

      // console.log("final words", finalWords)
      return fisherYatesShuffle(finalWords)
    })
    .catch(x => console.log(x))
}

module.exports = {
  macroMetaRows: getMacroMetaRows
}
