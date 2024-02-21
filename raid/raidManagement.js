import { CatchError, CatchErrorAndDeleteByTimeout, CatchRaidError } from "../core/catcherror.js";
import { SendPrivateMessageToMember, SendPrivateMessageToMemberById } from "../core/messaging.js";
import { CreateRaidMessage, GetRaidDataFromMessage } from "./raidEmbed.js";
import { ParseCommandAndGetRaidData, ParseCommandAndGetDate, FormRaidInfoPrivateMessage, FormFullRaidInfoPrivateMessage } from "./raidLines.js";
import { SheduleRaid, CancelSheduledRaid } from "../core/sheduler.js";
import { SafeDeleteMessageByTimeout } from "../core/safedeleting.js";
import config from "../config.json" assert {type: "json"};

export function CreateRaid(message, args) {
    try {
        if (CheckIfMemberHasBanRole(message.member)) throw 'Вы не можете создавать рейды.';     
        var data = ParseCommandAndGetRaidData(args, message);
        data.AddRaidMember(message.member.id);
        FetchMentionsAndInvite(data, message);

        var embed = CreateRaidMessage(data);
        
        message.channel.send(embed).then((msg) => {
            msg.react(":yes:1045279820910702614");
            msg.react(":no:1045279822621986876");
            msg.react(":info:1209800527152545812");
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

export function ChangeRaidDescription(message, args, raidMessage) {
    if (args.length < 2) throw 'Указано недостаточно данных.';

    var data = GetRaidDataFromMessage(raidMessage);
    var oldDescription = data.description;
    data.description = args.filter((_, i) => i > 0).join(" ");
    var embed = CreateRaidMessage(data);
    raidMessage.edit(embed);

    InformRaidMembers(data, "Коментарий к активности на которую вы записывались был изменен:", message.guild, oldDescription ?? "");
    
    message.delete();
}

export function AddRaidMember(message, user) {    
    var data = GetRaidDataFromMessage(message);

    if (data.left.find(m => m.id == user.id && m.isKicked)) return;
    if (data.members.length == data.numberOfPlaces) return;
    var discordMember = message.guild.members.cache.find(member => member.user.id == user.id);
    if (!CheckMemberAndAddToRaid(discordMember, data)) return;

    message.edit(CreateRaidMessage(data));
}

export function InviteRaidMember(message, args, raidMessage) {
    if (args.length < 2) throw 'Указано недостаточно данных.';

    var data = GetRaidDataFromMessage(raidMessage);

    FetchMentionsAndInvite(data, message);

    raidMessage.edit(CreateRaidMessage(data));
    message.delete();
}

function FetchMentionsAndInvite(data, message) {
    let memberMatcher = id => message.guild.members.cache.find(member => member.user.id == id);
    var members = message.mentions.users
					.filter(user => user.id != message.client.user.id)
					.map(user => memberMatcher(user.id));
    members.forEach(member => {
        if(CheckMemberAndAddToRaid(member, data))
            SendPrivateMessageToMember(member, 
                FormRaidInfoPrivateMessage(data, "Автор сбора добавил вас в активность."));
            })
}


function CheckMemberAndAddToRaid(discordMember, data){
    if (CheckIfMemberHasBanRole(discordMember)) return false;
    if (!data.AddRaidMember(discordMember.id)) return false;
    data.RemoveFromLeftField(discordMember.id);
    return true;
}

export function RemoveRaidMember(message, user) {
    var data = GetRaidDataFromMessage(message);
    if (!data.members.includes(user.id)) return;
    data.RemoveRaidMember(user.id);
    data.AddToLeftField(user.id);
    message.edit(CreateRaidMessage(data));
}

export async function RefreshRaidUi(message) {
    var data = GetRaidDataFromMessage(message);
    message.edit(CreateRaidMessage(data));

    await message.fetch();

    if (message.reactions.cache.find(r => r.emoji.name == "yes") == undefined)
        message.react(":yes:1045279820910702614");

    if (message.reactions.cache.find(r => r.emoji.name == "no") == undefined)
        message.react(":no:1045279822621986876");

    if (message.reactions.cache.find(r => r.emoji.name == "info") == undefined)
        message.react(":info:1209800527152545812");
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
        SendPrivateMessageToMemberById(userId, message.guild, 
            FormRaidInfoPrivateMessage(data, "Автор сбора отказался от вашего участия в активности, в которую вы записывались."));
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
    SafeDeleteMessageByTimeout(raidMessage, 150);
}

export function InformRaidMembers(data, messageText, guild, oldData) {
    data.members.forEach(function (discord_id) {
        if (discord_id == "слот свободен") return;
        SendPrivateMessageToMemberById(discord_id, guild, 
            FormRaidInfoPrivateMessage(data, messageText, oldData));
    });
}

export function CheckIfMemberHasBanRole(discordMember){
    var banRole = config.guilds.find(g => g.id == discordMember.guild.id).ban;
    return (discordMember.roles.cache.find( role => role.id == banRole));
}

export async function PmRaidInfo(message, user) {
    var data = GetRaidDataFromMessage(message);
    SendPrivateMessageToMemberById(user.id, message.guild, 
        await FormFullRaidInfoPrivateMessage(data, message.guild));
}