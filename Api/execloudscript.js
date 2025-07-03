const { Matches, Users, Inventors, Catalog } = require("../db");

// --- Вспомогательные функции генерации ---
function makeNumericId(length) {
  let result = "";
  const chars = "0123456789";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function makeAlphaId(length, useLowercase) {
  const chars = useLowercase
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function makeSessionToken() {
  return (
    makeAlphaId(8, true) +
    "-" +
    makeAlphaId(4, true) +
    "-" +
    makeAlphaId(4, true) +
    "-" +
    makeAlphaId(4, true) +
    "-" +
    makeAlphaId(12, true)
  );
}

async function getNextRoomId() {
  const room = await Matches.find({}).sort({ _id: -1 }).limit(1).next();
  return room ? room.id + 1 : 200000;
}

// --- Обработчики функций ---
async function handleImportInventory(request) {
  const ticket = request.headers["x-authorization"];
  const inventoryDB = await Inventors.findOne({ ticket });
  return {
    code: 200,
    status: "OK",
    data: {
      Inventory: inventoryDB?.Inventory || [],
      VirtualCurrency: inventoryDB?.VirtualCurrency || {},
      VirtualCurrencyRechargeTimes: {},
    },
  };
}

function handleAuthenticatePlayer() {
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "authenticatePlayer",
      Revision: 521,
      FunctionResult: {
        IsValid: true,
        IsExpired: false,
        AccountInfo: {
          PlayFabId: `I6OLEESRTW0NWZB4`,
          EntityId: `SPD0J3DQBWG7OZB4`,
          Platform: "Steam",
          PlatformAccountId: `76561198213050131`,
          Name: `FreeTP.org`,
          Type: "Player",
        },
      },
      Logs: [],
      ExecutionTimeSeconds: 0.0494505,
      ProcessorTimeSeconds: 0.001161,
      MemoryConsumedBytes: 5752,
      APIRequestsIssued: 2,
      HttpRequestsIssued: 0,
    },
  };
}

async function handleRegisterGameServer(request) {
  const roomId = await getNextRoomId();
  const params = request.body["FunctionParameter"];
  const lobbyId = makeNumericId(20);
  const address = params["ServerIPV4Address"];
  const pings = address === "91.219.235.155" ? "1,1,1,1,1,1,1,1,1,1" : params["Pings"];

  params["lobbyid"] = lobbyId;
  await Matches.updateOne(
    { id: roomId },
    {
      $set: {
        BuildVersion: "dummy",
        GameMode: "dummy",
        GameServerState: 0,
        GameServerStateEnum: "Open",
        LastHeartbeat: "2022-06-17T09:59:18.216Z",
        LobbyID: lobbyId,
        PlayerUserIds: [],
        Region: "EUWest",
        RunTime: 0,
        ServerHostname: address,
        ServerIPV4Address: address,
        ServerPort: params["ServerPort"],
        Tags: {
          AccountID: params["AccountId"],
          AllowJoin: params["AllowJoin"],
          BeaconPort: params["BeaconPort"],
          DockerHost: "imp_03005",
          DockerServer: "57",
          GameMode: params["GameMode"],
          QueueName: "InvasionFrontline48",
          IsConsoleServer: "false",
          IsNoviceServer: "false",
          IsModded: "false",
          IsOfficial: "false",
          Visibility: "3",
          IsPasswordProtected: params["IsPasswordProtected"],
          Location: params["Location"],
          MapName: params["MapName"],
          MaxPlayers: params["MaxPlayers"],
          OperatingSystem: params["OperatingSystem"],
          Pings: pings,
          Players: params["Players"],
          Region: params["Region"],
          ReservedSlots: params["ReservedSlots"],
          ServerName: params["ServerName"],
          Version: params["Version"],
          HostId: "imp_09002",
          InstanceId: "109002008",
        },
      },
      $currentDate: { lastUpdate: true },
    },
    { upsert: true }
  );
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "registerGameServer",
      Revision: 521,
      FunctionResult: {
        LobbyId: lobbyId,
        ServerToken: makeSessionToken(),
      },
      Logs: [],
      ExecutionTimeSeconds: 0.1286295,
      ProcessorTimeSeconds: 0.002263,
      MemoryConsumedBytes: 40432,
      APIRequestsIssued: 4,
      HttpRequestsIssued: 0,
    },
  };
}

async function handleRefreshGameServer(request) {
  const lobbyId = request.body["FunctionParameter"]?.LobbyId;
  await Matches.updateOne({ LobbyID: lobbyId }, { $currentDate: { lastUpdate: true } });
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "refreshGameServer",
      Revision: 521,
      FunctionResult: {},
      Logs: [],
      ExecutionTimeSeconds: 0.0366089,
      ProcessorTimeSeconds: 0.001069,
      MemoryConsumedBytes: 6312,
      APIRequestsIssued: 3,
      HttpRequestsIssued: 0,
    },
  };
}

async function handleUpdateGameServer(request) {
  const params = request.body["FunctionParameter"];
  const lobbyId = params?.LobbyId;
  await Matches.updateOne(
    { LobbyID: lobbyId },
    {
      $set: {
        "Tags.Players": params?.Players,
        "Tags.MapName": params?.MapName,
        "Tags.GameMode": params?.GameMode,
        "Tags.ServerName": params?.ServerName,
      },
      $currentDate: { lastUpdate: true },
    }
  );
  return {
    code: 200,
    status: "OK",
    data: {
      FunctionName: "updateGameServer",
      Revision: 521,
      FunctionResult: {},
      Logs: [],
      ExecutionTimeSeconds: 0.0357778,
      ProcessorTimeSeconds: 0.0016,
      MemoryConsumedBytes: 18144,
      APIRequestsIssued: 3,
      HttpRequestsIssued: 0,
    },
  };
}

function handleUnlockItems() {
  return {
    code: 200,
    status: "OK",
  };
}

// --- Основной роут ---
async function routes(fastify) {
  fastify.post("/Client/ExecuteCloudScript", async (request, reply) => {
    try {
      const functionName = request.body?.FunctionName;
      let response;
      switch (functionName) {
        case "importInventory":
          response = await handleImportInventory(request);
          break;
        case "authenticatePlayer":
          response = handleAuthenticatePlayer();
          break;
        case "registerGameServer":
          response = await handleRegisterGameServer(request);
          break;
        case "refreshGameServer":
          response = await handleRefreshGameServer(request);
          break;
        case "updateGameServer":
          response = await handleUpdateGameServer(request);
          break;
        case "unlockItems":
          response = handleUnlockItems();
          break;
        default:
          response = { code: 400, status: "Unknown FunctionName" };
      }
      return reply.send(response);
    } catch (err) {
      console.error("ExecuteCloudScript error:", err);
      return reply.code(500).send({ code: 500, status: "Internal server error" });
    }
  });
}

module.exports = routes;