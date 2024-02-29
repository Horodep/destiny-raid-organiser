import { AddRaidMember, RemoveRaidMember, RefreshRaidUi, PmRaidInfo, KickRaidMemberByEmoji, CancelRaidByEmoji } from "../raid/raidManagement.js";
import { CatchErrorAndDeleteByTimeout } from "../core/catcherror.js";
import { LoggingToChannel } from "../core/messaging.js";

export async function AsyncMessageReactionAdd(reaction, user) {
	try {
		if (user.bot) return;
		if (reaction.partial) await reaction.fetch();
		if (reaction.client.user.id != reaction.message.author.id) return;
		var line = `${user.username} set reaction ${reaction._emoji.name}`;
		console.log(line);
		LoggingToChannel (reaction.message.guild, line);

		if (reaction.message.embeds[0]?.footer?.text.startsWith("Собрал")) HandleRaids(reaction, user);
	} catch (error) {
		CatchErrorAndDeleteByTimeout(error, reaction?.message?.channel, 15000);
		return;
	}
};

function HandleRaids(reaction, user) {
	switch (reaction._emoji.name) {
		case "yes":
			AddRaidMember(reaction.message, user);
			reaction.users.remove(user);
			break;
		case "no":
			RemoveRaidMember(reaction.message, user, true);
			reaction.users.remove(user);
			break;
		case "refresh":
			RefreshRaidUi(reaction.message);
			reaction.users.remove(user);
			break;
		case "info":
		case "ℹ️":
			PmRaidInfo(reaction.message, user);
			reaction.users.remove(user);
			break;
		case "🚫":
			if (typeof (reaction.message) != "undefined") reaction.users.remove(user);
			CancelRaidByEmoji(reaction.message, user);
			break;
		case "1️⃣":
		case "2️⃣":
		case "3️⃣":
		case "4️⃣":
		case "5️⃣":
		case "6️⃣":
		case "7️⃣":
		case "8️⃣":
		case "9️⃣":
		case "0️⃣":
			KickRaidMemberByEmoji(reaction.message, user, reaction);
			reaction.users.remove(user);
			break;
	}
}