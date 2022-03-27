var fs = require('fs');
const jsonfile = require('jsonfile')
require('dotenv').config()

const path = './google-credentials.json'
try {
  if(fs.existsSync(path)){
    fs.unlinkSync(path)
  }

  const obj = {
    type: "service_account",
    project_id: "gvh-payment",
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: "gvh-library@gvh-payment.iam.gserviceaccount.com",
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/gvh-library%40gvh-payment.iam.gserviceaccount.com"
  }
  jsonfile.writeFileSync(path, obj, { spaces: 2})

} catch(err) {
  console.error(err)
}

