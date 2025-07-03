const { Users, Matches, End, Inventors } = require("../db");
const { Servers } = require("../db");
const { Awards } = require("../db");


async function getUserByEntityId(entityId) {
  return Users.findOne({ entityid: entityId });
}

async function getServerByEntityId(entityId) {
  return Servers.findOne({ entityid: entityId });
}

function buildAccountInfoResponse({ playfabId, entityId, accountId, type, name }) {
  const isPlayer = type === "Player";
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "updateAccountInfo",
      Revision: 521,
      FunctionResult: {
        PlayFabId: playfabId,
        EntityId: entityId,
        Platform: "Steam",
        PlatformAccountId: accountId,
        ...(isPlayer ? { Name: name } : {}),
        Type: type,
      },
      Logs: isPlayer
        ? [
            {
              Level: "Info",
              Message: "playerAccount",
            },
          ]
        : [],
      ExecutionTimeSeconds: 0.0862204,
      ProcessorTimeSeconds: 0.0021509,
      MemoryConsumedBytes: 22032,
      APIRequestsIssued: 4,
      HttpRequestsIssued: 0,
    },
  };
}

function buildStartMatchResponse() {
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "startMatch",
      Revision: 521,
      Logs: [],
      ExecutionTimeSeconds: 0.0204083,
      ProcessorTimeSeconds: 0.000448,
      MemoryConsumedBytes: 7384,
      APIRequestsIssued: 1,
      HttpRequestsIssued: 0,
    },
  };
}

function buildEndMatchResponse() {
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "endMatch",
      Revision: 521,
      Logs: [],
      ExecutionTimeSeconds: 0.0268167,
      ProcessorTimeSeconds: 0.001112,
      MemoryConsumedBytes: 9512,
      APIRequestsIssued: 2,
      HttpRequestsIssued: 0,
    },
  };
}

function buildGetMatchRewardsResponse(serverId, matchId) {
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "getMatchRewards",
      Revision: 521,
      FunctionResult: { Gold: 0, Xp: 0 },
      Logs: [
        {
          Level: "Info",
          Message: `Rewarded 0 Gold and 0 XP (Server: ${serverId}, Match: ${matchId})`,
        },
      ],
      ExecutionTimeSeconds: 0.1585883,
      ProcessorTimeSeconds: 0.00385,
      MemoryConsumedBytes: 0,
      APIRequestsIssued: 5,
      HttpRequestsIssued: 0,
    },
  };
}

function buildUpdateEntitlementsResponse() {
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "updateEntitlements",
      Revision: 521,
      Logs: [],
      ExecutionTimeSeconds: 0.0862204,
      ProcessorTimeSeconds: 0.0021509,
      MemoryConsumedBytes: 0,
      APIRequestsIssued: 0,
      HttpRequestsIssued: 0,
    },
  };
}

async function routes(fastify) {
  fastify.post("/CloudScript/ExecuteEntityCloudScript", async (request, reply) => {
    try {
      const entityId = request.body?.Entity?.Id;
      const functionName = request.body?.FunctionName;
      let response;
      switch (functionName) {
        case "updateAccountInfo": {
          const user = await getUserByEntityId(entityId);
          if (user) {
            response = buildAccountInfoResponse({
              playfabId: user.playfabid,
              entityId: user.entityid,
              accountId: user.steamid,
              type: "Player",
              name: user.username,
            });
          } else {
            const server = await getServerByEntityId(entityId);
            response = buildAccountInfoResponse({
              playfabId: server?.playfabid,
              entityId: server?.entityid,
              accountId: server?.customid,
              type: "Server",
            });
          }
          break;
        }
        case "startMatch":
          response = buildStartMatchResponse();
          break;
        case "endMatch":
          response = buildEndMatchResponse();
          break;
        case "getMatchRewards": {
          const serverId = request.body?.FunctionParameter?.ServerId;
          const matchId = request.body?.FunctionParameter?.MatchId;
          response = buildGetMatchRewardsResponse(serverId, matchId);
          break;
        }
        default:
          response = buildUpdateEntitlementsResponse();
      }
      return reply.send(response);
    } catch (err) {
      console.error("ExecuteEntityCloudScript error:", err);
      return reply.code(500).send({ code: 500, status: "Internal server error" });
    }
  });
}

module.exports = routes;
