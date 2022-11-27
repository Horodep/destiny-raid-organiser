import { Command } from "./command.js";
import config from "../config.json" assert {type: "json"};

import { CommandManager } from "./commandManager.js"
import { AsyncGetPlannedRaids } from "../raid/raidMisc.js"

class MainCommand extends Command {
    Run(args, message) {
        if (!raidChannels.includes(message.channel.id)) {
            Command.prototype.SaveRun.call(this, args, message);
        } else {
            message.channel.send("Данная команда не предназначена для канала рейдов.")
                .then(msg => {setTimeout(() => { msg.delete(); }, 10000)});
            setTimeout(() => { message.delete(); }, 10000);
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

    return array;
}

const raidChannels = config.guilds.map(guild => guild.raids);