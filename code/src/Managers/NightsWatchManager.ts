import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import NightsWatchEmbeds from '../Embeds/NightsWatchEmbed';
import { Redis } from '../Providers/Redis';
import DiscordService from '../Services/DiscordService';
import { Utils } from '../Utils/Utils';

export default class NightsWatchManager {

    private static readonly nightsWatchKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.NIGHTS_WATCH}`;

    public static CreateNightCheckInterval() {
        setInterval(() => {
            this.CheckNight();
        }, Utils.GetMinutesInMiliSeconds(1));

        this.CheckNight();
    }

    private static CheckNight() {
        const time = new Date().toLocaleTimeString('nl-NL', { timeZone: 'Europe/Amsterdam' });
        const hours = parseInt(time.split(':')[0]);

        if (hours >= SettingsConstants.TIME.NIGHT_START && hours < SettingsConstants.TIME.NIGHT_END) {
            this.OpenNightsWatch();
        } else {
            this.CloseNightsWatch();
        }
    }

    private static async CloseNightsWatch() {
        const state = await Redis.get(this.nightsWatchKey);
        if (!state) {
            return;
        }

        await Redis.del(this.nightsWatchKey);

        const channel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNELS.NIGHTS_WATCH_ID);

        channel.permissionOverwrites.edit(SettingsConstants.ROLES.PLACER_ID, {
            ViewChannel: false,
            SendMessages: false,
        });
    }

    private static async OpenNightsWatch() {
        const state = await Redis.get(this.nightsWatchKey);
        if (state) {
            return;
        }

        await Redis.set(this.nightsWatchKey, 1);

        const channel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNELS.NIGHTS_WATCH_ID);

        channel.permissionOverwrites.edit(SettingsConstants.ROLES.PLACER_ID, {
            ViewChannel: true,
            SendMessages: true,
        });

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('nightswatch')
                    .setLabel('Word beschermer van de nacht')
                    .setStyle(ButtonStyle.Primary),
            );

        channel.send({
            content: `<@&${SettingsConstants.ROLES.NIGHTS_WATCH_ID}>`,
            allowedMentions: { roles: [SettingsConstants.ROLES.NIGHTS_WATCH_ID] },
            embeds: [NightsWatchEmbeds.GetWelcomeEmbed()],
            components: [actionRow],
        });
    }
}