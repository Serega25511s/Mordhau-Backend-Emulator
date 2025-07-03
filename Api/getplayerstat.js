async function routes(fastify) {
  fastify.post("/Client/GetPlayerStatistics", async (request, reply) => {
    var data = {"code":200,"status":"OK","data":{"Statistics":[]}}
    reply.send(data);
  });
}

module.exports = routes;
