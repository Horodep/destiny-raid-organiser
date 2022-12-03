export function SafeDeleteMessageByTimeout(message, timeout){
    setTimeout(() => SafeDeleteMessage(message), timeout);
}

export function SafeDeleteMessage(message){
    message?.delete().catch(() => null);
}