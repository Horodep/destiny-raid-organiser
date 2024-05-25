import { Command } from "./command.js";
import { CommandManager } from "./commandManager.js"
import { AsyncGetPlannedRaids } from "../raid/raidMisc.js"
import { raidChannels } from "../raid/contents.js"
import { SafeDeleteMessageByTimeout } from "../core/safedeleting.js";

class MainCommand extends Command {
    Run(args, message) {
        if (!raidChannels.includes(message.channel.id)) {
            Command.prototype.SaveRun.call(this, args, message);
        } else {
            message.channel.send("Данная команда не предназначена для канала рейдов.")
                .then(msg => SafeDeleteMessageByTimeout(msg, 10000));
            SafeDeleteMessageByTimeout(message, 10000);
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
    array.push(new MainCommand("!myraids", on, false, "список рейдов, в которые записался страж;", async function (args, message) {
        await AsyncGetPlannedRaids(message, args.length > 1 ? args[1] : message.author.id)
    }));

    return array;
}