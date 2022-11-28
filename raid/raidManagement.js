import { CatchError, CatchErrorAndDeleteByTimeout, CatchRaidError } from "../core/catcherror.js";
import { SendPrivateMessageToMember  } from "../core/messaging.js";
import { CreateRaidMessage, GetRaidDataFromMessage } from "./raidEmbed.js";
import { ParseCommandAndGetRaidData, ParseCommandAndGetDate, FormRaidInfoPrivateMessage } from "./raidLines.js";
import { SheduleRaid, CancelSheduledRaid } from "../core/sheduler.js";
import config from "../config.json" assert {type: "json"};

export function CreateRaid(message, args) {
    try {
        if (CheckIfMemberHasBanRole(message.member)) throw 'Вы не можете создавать рейды.';     
        var data = ParseCommandAndGetRaidData(args, message.member);
        data.AddRaidMember(message.member.id);
        var embed = CreateRaidMessage(data);
        
        message.channel.send(embed).then((msg) => {
            msg.react(":yes:1045279820910702614");
            msg.react(":no:1045279822621986876");
            SheduleRaid(data, msg);
        });
    } catch (e) {
        if (typeof (e) == 'object') CatchError(e, message.channel);
        else CatchRaidError(e, message.content, message.channel);
    }
    message.delete();
}

export function MoveRaid(message, args, raidMessage) {
    var data = GetRaidDataFromMessage(raidMessage);
    var oldDate = data.date;
    data.date = ParseCommandAndGetDate(args);
    var embed = CreateRaidMessage(data);
    raidMessage.edit(embed);

    CancelSheduledRaid(raidMessage);
    SheduleRaid(data, raidMessage);
    InformRaidMembers(data, "Активность на которую вы записывались была перенесена:", message.guild, oldDate);
    
    message.delete();
}

export function AddRaidMember(message, user, forced) {
    var discordMember = message.guild.members.cache.find(member => member.user.id == user.id);
    if (CheckIfMemberHasBanRole(discordMember)) return;
    
    var data = GetRaidDataFromMessage(message);
    if (!forced && data.left.find(m => m.id == user.id && m.isKicked)) return;
    if (data.members.length == data.numberOfPlaces) return;
    data.AddRaidMember(user.id);
    data.RemoveFromLeftField(user.id);
    message.edit(CreateRaidMessage(data));
}

export function RemoveRaidMember(message, user) {
    var data = GetRaidDataFromMessage(message);
    if (!data.members.includes(user.id)) return;
    data.RemoveRaidMember(user.id);
    data.AddToLeftField(user.id);
    message.edit(CreateRaidMessage(data));
}

export function InviteRaidMember(message, args, raidMessage) {
    if (args.length < 2) throw 'Указано недостаточно данных.';

    var data = GetRaidDataFromMessage(raidMessage);
    var discordId = args[1].replace(/\D/g, '');

    AddRaidMember(raidMessage, { id: discordId }, true);

    var discordMember = message.guild.members.cache.find(member => member.user.id == discordId);
    SendPrivateMessageToMember(discordMember, FormRaidInfoPrivateMessage(data, "Автор сбора добавил вас в активность."));
    message.delete();
}

export function KickRaidMemberByEmoji(message, user, reaction) {
    var data = GetRaidDataFromMessage(message);
    if (data.author.id != user.id) {
        user.send("Вы не являетесь автором сбора. Вы не можете им управлять.");
        return;
    }
    var userId = data.GetUserIdByPosition(reaction._emoji.name.charAt(0));
    data.RemoveRaidMember(userId);
    data.AddToLeftField(userId, true);

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
    InformRaidMembers(data, "Активность на которую вы записывались была отменена автором сбора:", raidMessage.guild);
    CancelSheduledRaid(raidMessage);
    setTimeout(() => { raidMessage.delete(); }, 150);
}

export function InformRaidMembers(data, messageText, guild, oldData) {
    data.members.forEach(function (discord_id) {
        if (discord_id == "слот свободен") return;
        var member = guild.members.cache.find(user => user.id == discord_id);
        SendPrivateMessageToMember(member, FormRaidInfoPrivateMessage(data, messageText, oldData));
    });
}

export function CheckIfMemberHasBanRole(discordMember){
    var banRole = config.guilds.find(g => g.id == discordMember.guild.id).ban;
    return (discordMember.roles.cache.find( role => role.id == banRole));
}