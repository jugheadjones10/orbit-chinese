const { EleventyServerless } = require("@11ty/eleventy");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const googleCreds = require("../../../google-credentials.json");


async function handler(event) {

  console.log(event)
  console.log(event.body)
  const doc = new GoogleSpreadsheet("12ACZR7Wfd2qlFvz_8RB18Y_tr4BrzB5vCB2MBNUugVI");
  await doc.useServiceAccountAuth(googleCreds);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle["Sheet1"];
  const rows = await sheet.getRows();
  // console.log(rows)

  const processedRows = rows.map(row => {
    return {
      rowNumber: row._rowNumber,
      word: row._rawData[0],
      level: row._rawData[1],
      date: row._rawData[2]
    }
  })

  // const { rowNumber } = processedRows.find(x => bookNum === parseInt(x.bookNumber, 10))
  //   await sheet.loadCells(rowNumber + ":" + rowNumber);
  //   const inventoryCell = sheet.getCell(rowNumber - 1, 5) 
  //   inventoryCell.value = 0
  //   await sheet.saveUpdatedCells()

  const data = rows.map(x => x["_rawData"])

  try {

    return {
     statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(data),
    };

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
