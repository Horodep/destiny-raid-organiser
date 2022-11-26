import { CatchError, CatchErrorAndDeleteByTimeout, CatchRaidError } from "../core/catcherror.js";
import { SendPrivateMessageToMember  } from "../core/messaging.js";
import { CreateRaidMessage, GetRaidDataFromMessage } from "./raidEmbed.js";
import { ParseCommandAndGetRaidData, ParseCommandAndGetDate, FormRaidInfoPrivateMessage } from "./raidLines.js";

export function CreateRaid(message, args) {
    try {
        var data = ParseCommandAndGetRaidData(args, message.member);
        data.AddRaidMember(message.member.id);
        var embed = CreateRaidMessage(data);
        
        message.channel.send(embed).then((msg) => {
            msg.react(":yes:1045279820910702614");
            msg.react(":no:1045279822621986876");
        });
    } catch (e) {
        if (typeof (e) == 'object') CatchError(e, message.channel);
        else CatchRaidError(e, message.content, message.channel);
    }
    message.delete();
}

export function MoveRaid(message, args, raidMessage) {
    try {
        var data = GetRaidDataFromMessage(raidMessage);
        data.date = ParseCommandAndGetDate(args);
        var embed = CreateRaidMessage(data);
        raidMessage.edit(embed);

        data.members.forEach(function (discord_id) {
            if (discord_id == "слот свободен") return;
            var member = message.guild.members.cache.find(user => user.id == discord_id);
            SendPrivateMessageToMember(member, FormRaidInfoPrivateMessage(data, "Активность на которую вы записывались была перенесена:"));
        });
    } catch (e) {
        if (typeof (e) == 'object') CatchError(e, message.channel);
        else CatchErrorAndDeleteByTimeout(e, message.channel, 10000);
    }
    message.delete();
}

export function AddRaidMember(message, user) {
    var data = GetRaidDataFromMessage(message);
    if (data.members.length == data.numberOfPlaces) return;
    data.AddRaidMember(user.id);
    data.RemoveFromLeftField(user.id);
    message.edit(CreateRaidMessage(data));
}

export function RemoveRaidMember(message, user, showAsLeaver) {
    var data = GetRaidDataFromMessage(message);
    if (!data.members.includes(user.id)) return;
    data.RemoveRaidMember(user.id);
    if (showAsLeaver) data.AddToLeftField(user.id);
    message.edit(CreateRaidMessage(data));
}

export function KickRaidMember(message, user, reaction) {
    var data = GetRaidDataFromMessage(message);
    if (data.author.id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете им управлять.");
        return;
    }
    var userId = data.GetUserIdByPosition(reaction._emoji.name.charAt(0));
    data.RemoveRaidMember(userId);

    if (userId?.length > 0) {
        var member = message.guild.members.cache.find(user => user.id == userId);
        SendPrivateMessageToMember(member, FormRaidInfoPrivateMessage(data, "Автор сбора отказался от вашего участия в активности, в которую вы записывались."));
    }
    message.edit(CreateRaidMessage(data));
}

export function CancelRaidByEmoji(message, user) {
    var data = GetRaidDataFromMessage(message);
    if (data.author.id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете его отменить.");
        return;
    }
    CancelRaid(data, message);
}

export function CancelRaidByMessage(message, args, raidMessage) {
    var data = GetRaidDataFromMessage(raidMessage);
    CancelRaid(data, raidMessage);
    message.delete();
}

export function CancelRaid(data, raidMessage) {
    data.members.forEach(function (discord_id) {
        if (discord_id == "слот свободен") return;
        var member = raidMessage.guild.members.cache.find(user => user.id == discord_id);
        SendPrivateMessageToMember(member, FormRaidInfoPrivateMessage(data, "Активность на которую вы записывались была отменена автором сбора."));
    });
    setTimeout(() => { raidMessage.delete(); }, 150);
}

export function ForcedAddRaidMember(message, args) {
    if (args.length < 3) throw 'Указаны не все параметры';
    message.channel.messages.fetch(args[1]).then(msg => {
        AddRaidMember(msg, { id: args[2] });
        var member = message.guild.members.cache.find(user => user.id == args[2]);
        setTimeout(() => { message.delete(); }, 5000);
        var data = GetRaidDataFromMessage(message);
        SendPrivateMessageToMember(member, FormRaidInfoPrivateMessage(data, "Гильдмастер добавил вас в сбор активности."));
    });
}

export function ForcedRemoveRaidMember(message, args) {
    if (args.length < 3) throw 'Указаны не все параметры';
    message.channel.messages.fetch(args[1]).then(msg => {
        RemoveRaidMember(msg, { id: args[2] });
        var member = message.guild.members.cache.find(user => user.id == args[2]);
        setTimeout(() => { message.delete(); }, 5000);
        var data = GetRaidDataFromMessage(message);
        SendPrivateMessageToMember(member, FormRaidInfoPrivateMessage(data, "Гильдмастер отказался от вашего участия в активности, в которую вы записывались."));
    });
}