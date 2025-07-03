const { Matches } = require("../db");
async function routes(fastify) {
    fastify.post("/Client/GetCurrentGames", async (request, reply) => {
        const docs = await Matches.find({}).toArray();
        const data = {
            code: 200,
            status: "OK",
            data: {
                GameCount: docs.length,
                Games: docs,
                PlayerCount: 0
            }
        }
        return reply.send(data);

    });
}

module.exports = routes;