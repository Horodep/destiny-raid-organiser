import { Command } from "./command.js";
import config from "../config.json" assert {type: "json"};

import { CommandManager } from "./commandManager.js"
import { AsyncGetPlannedRaids } from "../raid/raidMisc.js"
import { CreateRaid } from "../raid/raidManagement.js"

class MainCommand extends Command {
    Run(args, message) {
        if (raidChannels.includes(message.channel.id)) {
            Command.prototype.SaveRun.call(this, args, message);
        } else {
            message.channel.send("не тот канал.");
        }
    }
}

export function GetMainCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new MainCommand("!help", on, false, "список доступных команд;", async function (args, message) {
        if (args.length == 1) message.channel.send(CommandManager.GetHelp());
    }));
    array.push(new MainCommand("!myraids", wip, false, "список рейдов, в которые записался страж;", async function (args, message) {
        await AsyncGetPlannedRaids(message, args.length > 1 ? args[1] : message.author.id)
    }));
    array.push(new MainCommand("!сбор ДД.ММ ЧЧ:ММ название активности, комментарии", on, false, "создание сбора на активность на 6 человек;", async function (args, message) {
        CreateRaid(message, args);
    }));
    array.push(new MainCommand("!сбор ДД.ММ ЧЧ:ММ [N] название активности, комментарии", on, false, "создание сбора на активность на N человек;", null));

    return array;
}

const raidChannels = config.channels.raids;