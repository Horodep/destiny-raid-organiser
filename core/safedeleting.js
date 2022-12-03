export function SafeDeleteMessageByTimeout(message, timeout){
    setTimeout(() => SafeDeleteMessage(message), timeout);
}

export async function SafeDeleteMessage(message){
    var fetchedMessage = await message.channel.messages
        .fetch(message.id)
        .catch(() => null);
    fetchedMessage?.delete(); 
}