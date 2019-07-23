var jsforce = require("jsforce");
var fs = require("fs");
var request = require("request");

require('dotenv').config({ path: require('find-config')('.env') });

let organizationId;

var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on("close", callback);
  });
};

async function main() {
  var conn = new jsforce.Connection();

  await conn.login(process.env.EMAIL, process.env.PASSWORD, function(err, userInfo) {
    if (err) {
      return console.error(err);
    }
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID:" + userInfo.organizationId);
    organizationId = userInfo.organizationId;
  });
  console.log(organizationId);

  await conn.query("SELECT Id, DeveloperName, Type FROM Document", async function(
    err,
    result
  ) {
    if (err) {
      return console.error(err);
    }

    for (var i in result['records']) {

      url = conn.instanceUrl
        .concat("/servlet/servlet.ImageServer?id=")
        .concat(result['records'][i]['Id'])
        .concat("&oid=")
        .concat(organizationId);

      download(
        url,
        "documents/"
          .concat(result['records'][i]['Id'])
          .concat("_")
          .concat(result['records'][i]['DeveloperName'])
          .concat(".")
          .concat(result['records'][i]['Type']),
        function() {
          console.log("done");
        }
      );
    }
  });
}

main();
