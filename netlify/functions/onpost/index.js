const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { DateTime } = require("luxon");
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
      const body = JSON.parse(event.body)
      const { IANA, username, email } = body
      delete body.username
      delete body.IANA
      delete body.email

      const updateArr = Object.values(body)
      console.log("updateArr", updateArr)

      const scheduleDates = new Set()
      updateArr.forEach(item => {
        // console.log("Due date in korea time", DateTime.fromISO(item.dueDate, { IANA }))
        // console.log("Due date in start of day", DateTime.fromISO(item.dueDate, { IANA }).startOf("day").toISO())
        // console.log("Due date in start of day UTC", DateTime.fromISO(item.dueDate, { IANA }).startOf("day").toUTC().toISO())
        scheduleDates.add(DateTime.fromISO(item.dueDate, { IANA }).startOf("day").toUTC().toISO())
      })

      console.log(JSON.stringify({
        username,
        scheduleDates: [...scheduleDates],
        email
      }))

      const scheduleDatesPromise = await fetch("http://158.247.193.21:8000/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          username,
          scheduleDates: [...scheduleDates],
          email
        })
      })
        .then(res => {
          console.log("response 1", res)
        })

      await Promise.all([
        ...updateArr.map(item => {
          item.key = item.key.toString()
          console.log(item)
          const json = {
            bindVars: item
          }

          return fetch("https://api-bullhead-dc53baa7-ap-south.paas.macrometa.io/_fabric/_system/_api/restql/execute/update-word", {
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
        })])

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
