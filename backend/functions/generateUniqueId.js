export function generateUniqueId(length, existingIds) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    let tries = 0;
    const maxTries = 1000;

    while (tries < maxTries) {
        let id = '';
        for (let i = 0; i < length; i++) {
            id += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        if (!existingIds.has(id)) return id;
        tries++;
    }

    return null;
}