export async function AsyncMessageReactionRemove(reaction, user) {
	try {
		if(user.bot) return;
		if (reaction.partial) await reaction.fetch();
		console.log(`${user.username} removed reaction ${reaction._emoji.name}.`);

	} catch (error) {
		CatchErrorAndDeleteByTimeout(error, reaction?.message?.channel, 15000);
		return;
	}
};