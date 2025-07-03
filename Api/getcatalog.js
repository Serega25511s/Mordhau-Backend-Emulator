const fs = require('fs');
const { Catalog } = require("../db");
async function routes(fastify) {
  fastify.post("/Client/GetCatalogItems", async (request, reply) => {
    var catalog = await Catalog.findOne({id: "catalog"})
    var data = {
      code: 200,
      status: "OK",
      data: {Catalog: catalog["Inventory"]}
    }
    reply.send(data);
  });
}

module.exports = routes;
