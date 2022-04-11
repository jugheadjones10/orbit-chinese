const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config()

async function handler(event) {

  console.log(event)
  console.log(event.body)
  try {

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    if (event.httpMethod === 'OPTIONS') {
      // To enable CORS
      return {
        statusCode: 200, 
        headers,
        body: 'success'
      };

    }else{
      const updateArr = Object.values(JSON.parse(event.body))
      console.log("updateArr", updateArr)

      Promise.all(updateArr.map(item => {
        item.key = item.key.toString()
        console.log(item)
        const json = {
          bindVars: item
        }

        return fetch("https://api-bullhead-dc53baa7.paas.macrometa.io/_fabric/_system/_api/restql/execute/update-word", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "apikey " + process.env.MACROMETA_API_KEY
          },
          body: JSON.stringify(json)
        })
          .then(res => res.json())
          .then(res => {
            console.log("response", res)
          })
      }))
        .then(res => console.log(res))
        .catch(x => console.log(x))


      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }

  } catch (error) {

    console.log("Error", error)

    return {
      statusCode: error.httpStatusCode || 500,
      body: JSON.stringify(
        {
          error: error.message,
        },
        null,
        2
      ),
    };
  }
}

exports.handler = handler;
