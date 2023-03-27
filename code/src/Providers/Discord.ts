import { Client, GatewayIntentBits, Guild, Interaction, Message, MessageReaction, PartialMessageReaction, Partials, PartialUser, ThreadChannel, User, VoiceState } from 'discord.js';
import DiscordService from '../Services/DiscordService';

export default class Discord {

    public static client: Client;

    public static eventReadyCallback: Function;
    public static eventGuildCreateCallback: Function;
    public static eventGuildDeleteCallback: Function;
    public static eventThreadCreateCallback: Function;
    public static eventMessageCreateCallback: Function;
    public static eventReactionAddCallback: Function;
    public static eventInteractionSlashCommandCallback: Function;
    public static eventInteractionButtonCallback: Function;
    public static eventInteractionModalCallback: Function;
    public static eventInteractionSelectMenuCallback: Function;
    public static eventInteractionContextMenuCommandCallback: Function;
    public static eventVoiceStateUpdateCallback: Function;

    public static SetEventReadyCallback(callback: Function) {
        this.eventReadyCallback = callback;
    }

    public static SetEventGuildCreateCallback(callback: Function) {
        this.eventGuildCreateCallback = callback;
    }

    public static SetEventGuildDeleteCallback(callback: Function) {
        this.eventGuildDeleteCallback = callback;
    }

    public static SetEventThreadCreateCallback(callback: Function) {
        this.eventThreadCreateCallback = callback;
    }

    public static SetEventMessageCreateCallback(callback: Function) {
        this.eventMessageCreateCallback = callback;
    }

    public static SetEventReactionAddCallback(callback: Function) {
        this.eventReactionAddCallback = callback;
    }

    public static SetEventInteractionSlashCommandCallback(callback: Function) {
        this.eventInteractionSlashCommandCallback = callback;
    }

    public static SetEventInteractionButtonCallback(callback: Function) {
        this.eventInteractionButtonCallback = callback;
    }

    public static SetEventInteractionModalCallback(callback: Function) {
        this.eventInteractionModalCallback = callback;
    }

    public static SetEventInteractionSelectMenuCallback(callback: Function) {
        this.eventInteractionSelectMenuCallback = callback;
    }

    public static SetEventInteractionContextMenuCommandCallback(callback: Function) {
        this.eventInteractionContextMenuCommandCallback = callback;
    }

    public static SetEventVoiceStateUpdateCallback(callback: Function) {
        this.eventVoiceStateUpdateCallback = callback;
    }

    public static async Init() {
        this.client = new Client({
            partials: [Partials.Channel, Partials.Message, Partials.Reaction],
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
            ]
        });

        DiscordService.SetClient(this.client);

        this.client.once('ready', () => { Discord.EventReady(); });
        this.client.on('shardDisconnect', (event, id) => { console.log('Disconnect!', id); });
        this.client.on('guildCreate', (guild) => { Discord.EventGuildCreate(guild); });
        this.client.on('guildDelete', (guild) => { Discord.EventGuildDelete(guild); });
        this.client.on('threadCreate', (thread) => { Discord.EventThreadCreate(thread); });
        this.client.on('messageCreate', (message) => { Discord.EventMessageCreate(message); });
        this.client.on('messageReactionAdd', (reaction, user) => { Discord.EventReactionAdd(reaction, user); });
        this.client.on('interactionCreate', (interaction) => { Discord.EventInteractionCreate(interaction); });
        this.client.on('voiceStateUpdate', (oldState, newState) => { Discord.VoiceStateUpdate(oldState, newState); });
        await this.client.login(process.env.TOKEN);
    }

    public static GetClient() {
        return this.client;
    }

    private static EventReady() {
        if (this.eventReadyCallback == null) {
            return;
        }

        this.eventReadyCallback();
    }

    private static EventGuildCreate(guild: Guild) {
        if (this.eventGuildCreateCallback == null) {
            return;
        }

        this.eventGuildCreateCallback(guild);
    }

    private static EventGuildDelete(guild: Guild) {
        if (this.eventGuildDeleteCallback == null) {
            return;
        }

        this.eventGuildDeleteCallback(guild);
    }

    private static EventMessageCreate(message: Message) {
        if (this.eventMessageCreateCallback == null) {
            return;
        }

        if (message.author.bot) {
            return;
        }

        this.eventMessageCreateCallback(message);
    }

    private static EventThreadCreate(message: ThreadChannel) {
        if (this.eventThreadCreateCallback == null) {
            return;
        }

        this.eventThreadCreateCallback(message);
    }

    private static async EventReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        if (this.eventReactionAddCallback == null) {
            return;
        }

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                return;
            }
        }

        if (user.bot) {
            return;
        }

        this.eventReactionAddCallback(reaction, user);
    }

    private static EventInteractionCreate(interaction: Interaction) {
        if (!interaction.inCachedGuild()) {
            return;
        }

        if (interaction.isCommand()) {
            if (this.eventInteractionSlashCommandCallback == null) {
                return;
            }

            this.eventInteractionSlashCommandCallback(interaction);
        } else if (interaction.isButton()) {
            if (this.eventInteractionButtonCallback == null) {
                return;
            }

            this.eventInteractionButtonCallback(interaction);
        } else if (interaction.isModalSubmit()) {
            if (this.eventInteractionModalCallback == null) {
                return;
            }

            this.eventInteractionModalCallback(interaction);
        } else if (interaction.isAnySelectMenu()) {
            if (this.eventInteractionSelectMenuCallback== null) {
                return;
            }

            this.eventInteractionSelectMenuCallback(interaction);
        } else if (interaction.isContextMenuCommand()) {
            if (this.eventInteractionSelectMenuCallback== null) {
                return;
            }

            this.eventInteractionSelectMenuCallback(interaction);
        }
    }

    private static VoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        if (this.eventVoiceStateUpdateCallback == null) {
            return;
        }

        this.eventVoiceStateUpdateCallback(oldState, newState);
    }
}