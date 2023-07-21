export default class CommandConstants {
    public static readonly SLASH = {
        UDPATE: 'update',
        ORDER: 'order',
        BILLY: 'billy',
        APPLICATIONS: 'sollicitaties',
        VALIDATE: 'validate',
        GRID: 'grid',
        TEMPLATE: 'template',
        ONBOARDING: 'onboarding',
        ROLES: 'rollen',
        COORDINATE: 'coordinate',
        VOICE: 'voice',
        VOTE: 'stemming',
        TREATY: 'treaty',
        THREAD: {
            COMMAND: 'thread',
            CLOSE: 'close',
            LOCK: 'lock',
            TAGS: 'tags',
        },
        ROLE: {
            COMMAND: 'rol',
            DIPLOMAT: 'diplomaat',
            ARTIST: 'pixelaar',
        },
        VARIABLE: {
            COMMAND: 'variable',
            SET: 'set',
            GET: 'get',
            GETALL: 'getall',
        }
    };

    public static readonly MENU = {
        APPROVE: 'Goedkeuren',
        DECLINE: 'Afwijzen',
        DELAY: 'Uitstellen',
        VOTE: 'Stemming',
        PEEK: 'Gluren',
    };
}