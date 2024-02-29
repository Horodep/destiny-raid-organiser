export async function AsyncMessageReactionRemove(reaction, user) {
	try {
		if (user.bot) return;
		if (reaction.partial) await reaction.fetch();
		if (reaction.client.user.id != reaction.message.author.id) return;
		//console.log(`${user.username} removed reaction ${reaction._emoji.name}.`);

	} catch (error) {
		return;
	}
};