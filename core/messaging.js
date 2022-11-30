import config from "../config.json" assert {type: "json"};

export function SendCustomMessage(client, args){
    if (args.length < 3) return;
    var channel = client.channels.cache.get(args[1]);
    var text = args.filter((_,i) => i > 1).join(" ");
    channel.send(text);
}

export function SendPrivateMessageByRole(guild, args){  
    if (args.length < 3) return;  
	var roleId = args[1].replace(/\D/g, '');
    var members = guild.roles.cache.find(role => role.id == roleId).members;
    var text = args.filter((_,i) => i > 1).join(" ");
    
    var textedMembers = [];
    members.forEach(member => { textedMembers.push({discordMember: member, text: text});});
    SendPrivateMessagesToArray(textedMembers);
}

export function SendPrivateMessagesToArray(textedMembers){
	var i = 0;
	var sending = function () {
		if (i < textedMembers.length) {
            SendPrivateMessageToMember(textedMembers[i].discordMember, textedMembers[i].text);
			i++;
			setTimeout(sending, 2000);
		}
	}
	sending();
}

export function SendPrivateMessage(guild, args){ 
    if (args.length < 3) return;  
	var memberId = args[1].replace(/\D/g, '');
    var member = guild.members.cache.find(m => m.id == memberId);
    var text = args.filter((_,i) => i > 1).join(" ");
    
    SendPrivateMessageToMember(member, text);
}

export function SendPrivateMessageToMember(discordMember, text){
    try {
        if (discordMember.user.bot) return;
        discordMember.send(text);
        console.log("pm " + discordMember.displayName);
    } catch (e) {
        console.error("pm " + discordMember.displayName + " WAS NOT SENT");
    }
}

export function LoggingToChannel (guild, ...args) {
    var channel_id = config.guilds.find(g => g.id == guild.id).log;
    if ((channel_id ?? "") == "") return;
    var channel = guild.client.channels.cache.get(channel_id);
    channel.send(args.join(" "));
}
