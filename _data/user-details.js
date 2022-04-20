const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function getUserDetails(configData){

  const username = configData.eleventy?.serverless?.query?.username || "dick"
  const response = await fetch("https://api-bullhead-dc53baa7-ap-south.paas.macrometa.io/_fabric/_system/_api/restql/execute/get-user-details", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "apikey " + process.env.MACROMETA_API_KEY
    },
    body: JSON.stringify({
      bindVars: {
        username
      }
    })
  })

  const data  = await response.json()

 if(data.error){
    throw "get-user-details DB operation returned error: " + data
  }
  console.log("User details", data.result[0])

  return data.result[0]

}

