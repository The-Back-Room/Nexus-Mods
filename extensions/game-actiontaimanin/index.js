
const spec = {
  "game": {
    "id": "actiontaimanin",
    "name": "Action Taimanin",
    "executable": "ActionTaimanin.exe",
    "logo": "actiontaimanin.png",
    "mergeMods": true,
    "modPath": "",
    "modPathIsRelative": true,
    "requiredFiles": [
      "ActionTaimanin.exe"
    ],
    "details": {
      "steamAppId": 1335200,
      "nexusPageId": "actiontaimanin"
    },
    "environment": {
      "SteamAPPId": "1335200"
    }
  },
  "discovery": {
    "ids": [
      "1335200"
    ],
    "names": []
  }
};

const tools = [];
const { actions, fs, util } = require('vortex-api');
const path = require('path');
const template = require('string-template');
function modTypePriority(priority) {
    return {
        high: 25,
        low: 75,
    }[priority];
}

function pathPattern(api, game, pattern) {
    var _a;
    return template(pattern, {
        gamePath: (_a = api.getState().settings.gameMode.discovered[game.id]) === null || _a === void 0 ? void 0 : _a.path,
        documents: util.getVortexPath('documents'),
        localAppData: process.env['LOCALAPPDATA'],
        appData: util.getVortexPath('appData'),
    });
}

function makeFindGame(api, gameSpec) {
    return () => util.GameStoreHelper.findByAppId(gameSpec.discovery.ids)
        .catch(() => util.GameStoreHelper.findByName(gameSpec.discovery.names))
        .then((game) => game.gamePath);
}

function makeGetModPath(api, gameSpec) {
    return () => gameSpec.game.modPathIsRelative !== false
        ? gameSpec.game.modPath || '.'
        : pathPattern(api, gameSpec.game, gameSpec.game.modPath);
}

function makeRequiresLauncher(api, gameSpec) {
    return () => Promise.resolve((gameSpec.game.requiresLauncher !== undefined)
        ? { launcher: gameSpec.game.requiresLauncher }
        : undefined);
}

function applyGame(context, gameSpec) {
    const game = {
        ...gameSpec.game,
        queryPath: makeFindGame(context.api, gameSpec),
        queryModPath: makeGetModPath(context.api, gameSpec),
        requiresLauncher: makeRequiresLauncher(context.api, gameSpec),
        requiresCleanup: true,
        executable: () => gameSpec.game.executable,
        supportedTools: tools,
    };
    context.registerGame(game);
    (gameSpec.modTypes || []).forEach((type, idx) => {
        context.registerModType(type.id, modTypePriority(type.priority) + idx, (gameId) => gameId === gameSpec.game.id, (game) => pathPattern(context.api, game, type.targetPath), () => Promise.resolve(false), { name: type.name });
    });
}


function main(context) {
  applyGame(context, spec);
  context.once(() => {
  });
  return true;
}

module.exports = {
  default: main,
};
