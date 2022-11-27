import { Command } from "./command.js";
import config from "../config.json" assert {type: "json"};

import { ClearRaidList } from "../raid/raidMisc.js"
import { CreateRaid } from "../raid/raidManagement.js"

class RaidCommand extends Command {
    Run(args, message) {
        if (raidChannels.includes(message.channel.id)) {
            Command.prototype.SaveRun.call(this, args, message);
        } else {
            message.channel.send("Данную команду можно отправлять только в канал для рейдов.");
        }
    }
}

export function GetRaidCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new RaidCommand("!clean", on, false, "очистить канал от старых рейдов и лишних сообщений;", async function (args, message) {
        await ClearRaidList(message);
    }));
    array.push(new RaidCommand("!сбор ДД.ММ ЧЧ:ММ название активности, комментарии", on, false, "создание сбора на активность на 6 человек;", async function (args, message) {
        CreateRaid(message, args);
    }));
    array.push(new RaidCommand("!сбор ДД.ММ ЧЧ:ММ [N] название активности, комментарии", on, false, "создание сбора на активность на N человек;", null));

    return array;
}

const raidChannels = config.guilds.map(guild => guild.raids);