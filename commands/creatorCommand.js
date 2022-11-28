import { Command } from "./command.js";
import { CatchErrorAndDeleteByTimeout } from "../core/catcherror.js";
import { InviteRaidMember, MoveRaid, ChangeRaidDescription, CancelRaidByMessage } from "../raid/raidManagement.js";
import { GetRaidAuthorFromMessage } from "../raid/raidMisc.js";

class CreatorCommand extends Command {
    async Run(args, message) {
        try{
            if (!message.reference)
                throw("Данное сообщение может быть использовано только как ответ на сообщение рейда.");

            var raidMessage = await message.channel.messages.fetch(message.reference.messageId);
            
            if (message.author.id != GetRaidAuthorFromMessage(raidMessage).id)
                throw("Вы не являетесь автором сбора. Вы не можете им управлять.");

            Command.prototype.SaveRun.call(this, args, message, raidMessage);
        }catch(e){
            CatchErrorAndDeleteByTimeout(e, message.channel, 9500);
            setTimeout(() => { message.delete(); }, 10000);
        }
    }
}

export function GetCreatorCommandsArray() {
    const on = 0;
    const wip = 1;
    const off = 2;
    var array = [];

    array.push(new CreatorCommand("!перенос ДД.ММ ЧЧ:ММ", on, false, "перенос рейда, _должно быть ответом на сообщение рейда_", async function (args, message, raidMessage) {
        MoveRaid(message, args, raidMessage);
    }));
    array.push(new CreatorCommand("!комментарий новый комментарий", on, false, "изменить комментарий к рейду, _должно быть ответом на сообщение рейда_", async function (args, message, raidMessage) {
        ChangeRaidDescription(message, args, raidMessage);
    }));
    array.push(new CreatorCommand("!отмена", on, false, "отмена рейда, _должно быть ответом на сообщение рейда_", async function (args, message, raidMessage) {
        CancelRaidByMessage(message, args, raidMessage);
    }));
    array.push(new CreatorCommand("!бронь @DiscordTag", on, false, "забронировать место за стражем, _должно быть ответом на сообщение рейда_", async function (args, message, raidMessage) {
        InviteRaidMember(message, args, raidMessage);
    }));

    return array;
}