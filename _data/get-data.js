const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { DateTime } = require("luxon");

module.exports = async function getData(configData){

  const username = configData.eleventy?.serverless?.query?.username || "dick"

  const IANA = await macroMetaFetch("get-user-iana", { username })
  console.log("IANA", IANA)

  const { email, words } = await macroMetaFetch("get-by-date", { 
    username, 
    filterTime: DateTime.local({ zone: IANA }).endOf("day").toUTC().toISO()
  })

  console.log("email", email)
  console.log("words", words)

  const { fisherYatesShuffle } = await import("project-utils") 
  const finalWords = []

  words.forEach(item => {

    item.examples = fisherYatesShuffle(item.examples).slice(0, 2)
    const arrayCopy = [...item.examples]

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

  return {
    words: fisherYatesShuffle(finalWords),
    email,
    username,
    IANA
  }

}

async function macroMetaFetch(query, body){

  const response = await fetch("https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/" + query, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "apikey " + process.env.MACROMETA_API_KEY
    },
    body: JSON.stringify({
      bindVars: {
        ...body
      }
    })
  })

  const data  = await response.json()

  if(data.error){
    throw `
    MacroMeta fetch returned error for query:
    Query: ${query}
    Body: ${JSON.stringify(body)}
    Response: ${data}
    `
  }

  return data.result[0]

}
