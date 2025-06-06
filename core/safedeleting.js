export function SafeDeleteMessageByTimeout(message, timeout){
    setTimeout(() => SafeDeleteMessage(message), timeout);
}

export function SafeDeleteMessage(message){
	console.log("Сообщение", message.id, "удалено.");
    message?.delete().catch(() => null);
}