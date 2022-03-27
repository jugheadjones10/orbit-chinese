const { GoogleSpreadsheet } = require("google-spreadsheet");

const googleCreds = require("./google-credentials.json");

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

module.exports = {
  rows: getRows
}
