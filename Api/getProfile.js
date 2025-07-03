const { Matches, Users, Inventors, Catalog} = require("../db");
async function routes(fastify) {
    fastify.post("/Profile/GetProfiles", async (request, reply) => {
        let userEntityId = request.body["Entities"]["Id"]
        let users = await Users.findOne({entityid: userEntityId})

        let data = {
            "code": 200,
            "status": "OK",
            "data": {
                "Profiles": [{
                    "Entity": {
                        "Id": `${users["entityid"]}`,
                        "Type": "title_player_account",
                        "TypeString": "title_player_account"
                    },
                    "EntityChain": `title_player_account!4036ED7198382680/12D56/${users["playfabid"]}/${users["entityid"]}/`,
                    "VersionNumber": 4,
                    "Objects": {
                        "AccountInfo": {
                            "DataObject": {
                                "PlayFabId": `${users["playfabid"]}`,
                                "EntityId": `${users["entityid"]}`,
                                "Platform": "Steam",
                                "PlatformAccountId": `${users["steamid"]}`,
                                "Name": `${users["username"]}`,
                                "Type": "Player",
                                "LastIndexed": 1670246368
                            },
                            "ObjectName": "AccountInfo"
                        }
                    },
                    "Lineage": {
                        "NamespaceId": "4036ED7198382680",
                        "TitleId": "12D56",
                        "MasterPlayerAccountId": `${users["playfabid"]}`,
                        "TitlePlayerAccountId": `${users["entityid"]}`
                    },
                    "Created": "2021-02-18T19:24:10.888Z"
                }]
            }
        }
        reply.send(data);
    });
}

module.exports = routes;