const { Users } = require("../db");
async function routes(fastify) {
    fastify.post("/Client/GetUserReadOnlyData", async (request, reply) => {
        var ip = request.ip
        var users = await Users.findOne({ip: ip})
        var steamid = users["steamid"]
        var entityid = users["entityid"]
        var name = users["username"]
        var playfabid = users["playfabid"]
        var data = {"code":200,
            "status":"OK",
            "data":{
            "Data":{
                "AccountInfo":{
                    "Value":`{\"PlayFabId\":\"${playfabid}\",` +
                        `\"EntityId\":\"${entityid}\",` +
                        "\"Platform\":\"Steam\"," +
                        `\"PlatformAccountId\":\"${steamid}\",` +
                        `\"Name\":\"${name}\",` +
                        "\"Type\":\"Player\"}",
                    "LastUpdated":"2023-05-21T10:57:35.443Z",
                    "Permission":"Public"},
                "ImportedInventory":{"Value":"true","LastUpdated":"2021-04-24T09:54:57.673Z","Permission":"Private"}},
                "DataVersion":2182}}
        reply.send(data);
    });
}

module.exports = routes;
