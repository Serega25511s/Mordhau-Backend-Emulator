const axios = require("axios");
const { Inventors, Users } = require("../db");

async function getNextClientId() {
  var client = await Inventors.find({}).sort({ _id: -1 }).limit(1).next();
  if (client) return client.id + 1;
  return 1;
}

async function routes(fastify) {
  fastify.post("/Client/GetUserInventory", async (request, reply) => {
    var ip = request.ip
    var users = Users.findOne({ip: ip})
    var steamid = users["steamid"]
    var id = await getNextClientId()
    const ticket = request.headers["x-authorization"]
    var inventoryDB = await Inventors.findOne({ticket: ticket})

    var data = {"code":200,"status":"OK","data":{
        "Inventory":inventoryDB["Inventory"],
        "VirtualCurrency":inventoryDB["VirtualCurrency"],
        "VirtualCurrencyRechargeTimes":{}}}
    reply.send(data);
  });
}

module.exports = routes;
