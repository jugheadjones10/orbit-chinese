require('dotenv').config()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { DateTime } = require("luxon");
const getUserDetails = require("./user-details.js")

module.exports = async function getMacroMetaRows(configData){

  const username = configData.eleventy?.serverless?.query?.username || "dick"
  const { IANA } = await getUserDetails(configData)
  const endOfUserDay = DateTime.local({ zone: IANA }).endOf("day").toUTC().toISO()

  const fetchUrl = process.env.GET_ALL === "true" ?  "https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-user-words": "https://api-bullhead-dc53baa7-ap-south.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-by-date"

  const body = {
    bindVars: {
      username,
      filterTime: endOfUserDay
    }
  }
  console.log(body)

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
      console.log("response", res)

      var finalWords = []

      res.result.forEach(item => {

        var examples = fisherYatesShuffle(item.examples).slice(0, 2) 
        item.examples = examples
        var arrayCopy = [...examples]
        // console.log("item", item)
        // item.englishDefs = ["EFh ehfehfw ehfweh hwef whefhwef hwfe whf wef ewf wef wef wefw w", "efwef  fwef wef wef we fw e w ef wfe wew wf we wfwef ewf e fw fw efwe fw f ewf wef w ef wf",
        // "WEFEWEG wg we gwg e gwg  g ewg e wegewg w gwewg weg wg weg w gw "]

        const array = ["coverType", "defType", "examplesType", "examplesType"]
        array.forEach(type => {
          if(type === "defType" && item.englishDefs[0].includes("English definition unavailable")) return
          if(type === "examplesType"){
            finalWords.push({
              ...item,
              type: type,
              frontExample: arrayCopy.pop()
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
        // console.log("WORD: ", x.word, "TYPE: ", x.type)
      })
      console.log("TOTAL COUNT: ", finalWords.length)

      // console.log("final words", finalWords)
      return fisherYatesShuffle(finalWords)
    })
    .catch(x => console.log(x))
}




