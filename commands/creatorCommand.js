import { Command } from "./command.js";
import { CatchErrorAndDeleteByTimeout } from "../core/catcherror.js";
import { GetRaidAuthorFromMessage } from "../raid/raidMisc.js";

class CreatorCommand extends Command {
    async Run(args, message) {
        try{
            var raidMessage = await message.channel.messages.fetch(message.reference.messageId);

            if (message.author.id == GetRaidAuthorFromMessage(raidMessage).id) {
                Command.prototype.SaveRun.call(this, args, message);
            } else {
                throw("Вы не являетесь автором сбора. Вы не можете им управлять.");
            }
        }catch(e){
            CatchErrorAndDeleteByTimeout(e, message.channel, 10000);
        }
        setTimeout(() => { message.delete(); }, 10000);
    }
}

export function GetCreatorCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new CreatorCommand("!перенос ДД.ММ ЧЧ:ММ", wip, false, "перенос рейда, _должно быть ответом на сообщение рейда_", async function (args, message) {
        //wip
    }));
    array.push(new CreatorCommand("!бронь @DiscordTag", wip, false, "забронировать место за стражем, _должно быть ответом на сообщение рейда_", async function (args, message) {
        //wip
    }));

    return array;
}