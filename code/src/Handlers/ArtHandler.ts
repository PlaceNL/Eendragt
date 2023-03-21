import { ActionRowBuilder, Attachment, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import IResultInfo from '../Interfaces/IResultInfo';
import MessageService from '../Services/MessageService';
import { getPixels } from 'ndarray-pixels';
import ArtEmbeds from '../Embeds/ArtEmbeds';
import { Utils } from '../Utils/Utils';
import SuggestionHandler from './SuggestionHandler';
import DiplomacyHandler from './DiplomacyHandler';
import LogService from '../Services/LogService';
import { LogType } from '../Enums/LogType';
import VariableManager from '../Managers/VariableManager';
import { VariableKey } from '../Enums/VariableKey';
import { Redis } from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';
const { createCanvas, loadImage } = require('canvas');

const fetch = require('cross-fetch');

export default class ArtHandler {

    private static readonly coordinatePixelsKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.ART}${RedisConstants.KEYS.COORDINATE}`;
    private static readonly coordinateDataKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.ART}${RedisConstants.KEYS.COORDINATE}${RedisConstants.KEYS.DATA}`;
    private static readonly claimCooldownKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.ART}${RedisConstants.KEYS.COOLDOWN}`;
    private static readonly pixelImageCache: any = {};
    private static readonly pixelDataCache: any = {};

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.VALIDATE:
                this.OnValidate(messageInfo);
                break;
            case commands.TEMPLATE:
                this.OnTemplate(messageInfo);
                break;
            case commands.COORDINATE:
                this.OnCoordinate(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static async OnClaimPixel(messageInfo: IMessageInfo, id: string) {
        try {
            const cooldownKey = `${this.claimCooldownKey}${messageInfo.member.id}`;
            const cooldown = await Redis.get(cooldownKey);
            if (cooldown) {
                const expire = await Redis.ttl(cooldownKey);
                const minutes = Math.floor(expire / 60);
                const seconds = expire - minutes * 60;

                await (<ButtonInteraction> messageInfo.interaction).reply({
                    content: `Je moet ${minutes <= 0 ? '' : `${minutes} minuten`}` + `${minutes <= 0 || seconds <= 0 ? '' : ' en '}` + `${seconds <= 0 ? '' : `${seconds} seconden`} wachten voordat je weer een pixel kan claimen.`,
                    ephemeral: true,
                });

                return;
            }

            const coordinateKey = `${this.coordinatePixelsKey}${id}`;
            const dataKey = `${this.coordinateDataKey}${id}`;

            let keys: Array<string>;
            let fromCache = false;

            const pixels = await Redis.hgetall(coordinateKey);
            if (pixels == null) {
                keys = this.pixelDataCache[id];
                if (keys == null) {
                    (<ButtonInteraction> messageInfo.interaction).reply({
                        content: 'Er zijn momenteel pixels meer beschikbaar. Probeer het later nog eens.',
                        ephemeral: true,
                    });
                    return;
                }
                fromCache = true;
            } else {
                keys = Object.keys(pixels);
            }

            const pixelString = keys[Math.floor(Math.random() * keys.length)];
            const pixelData = JSON.parse(pixelString);

            Redis.hdel(coordinateKey, pixelString);

            const data = await Redis.hgetall(dataKey);
            const timeString = data.text;
            const epoch = data.epoch;
            let timePassed = timeString == 'now';
            let diff = 0;

            if (epoch != null) {
                const now = new Date().getTime();
                const time = parseInt(epoch);
                if (now > time) {
                    timePassed = true;
                } else {
                    diff = Math.floor((time - now) / 1000); // calculate difference in seconds
                    diff = Math.ceil(diff / 60); // convert to minutes, rounding up
                }
            }

            if (!fromCache) {
                setTimeout(() => {
                    Redis.hset(coordinateKey, pixelString, 1);
                }, Utils.GetMinutesInMiliSeconds(timePassed ? 5 : diff));
            }

            Redis.set(`${this.claimCooldownKey}${messageInfo.member.id}`, 1, 'EX', Utils.GetMinutesInSeconds(timePassed ? 5 : diff));

            let url = this.pixelImageCache[pixelData.color];
            let file;
            if (url == null) {
                const canvas = createCanvas(100, 100);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = pixelData.color;
                ctx.fillRect(0, 0, 100, 100);

                const name = 'pixel.png';
                file = new AttachmentBuilder(canvas.toBuffer(), {
                    name: name,
                });

                url = `attachment://${name}`;
            }

            const embed = ArtEmbeds.GetClaimPixelEmbed(pixelData.x, pixelData.y, pixelData.color, url, timePassed ? null : timeString);

            const replyOptions: any = {
                embeds: [embed],
                ephemeral: true
            };

            if (file != null) {
                replyOptions.files = [file];
            }

            const reply = await (<ButtonInteraction> messageInfo.interaction).reply(replyOptions);
            const message = await reply.fetch();

            if (file != null) {
                this.pixelImageCache[pixelData.color] = message.embeds[0].image.url;
            }

            LogService.Log(LogType.CoordinateClaim, messageInfo.member.id, 'Art', id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.CoordinateClaim, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async OnValidate(messageInfo: IMessageInfo) {
        try {
            const attachment = (<ChatInputCommandInteraction> messageInfo.interaction).options.get('art')?.attachment;

            if (messageInfo.channel.isThread()) {
                if (messageInfo.channel.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
                    const resultInfo = await this.IsLegitArt(attachment);
                    SuggestionHandler.OnValidateArt(messageInfo, resultInfo, attachment);
                    return;
                } else if (messageInfo.channel.parentId == SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID) {
                    const resultInfo = await this.IsLegitArt(attachment, true);
                    DiplomacyHandler.OnValidateArt(messageInfo, resultInfo, attachment);
                    return;
                }
            }

            const resultInfo = await this.IsLegitArt(attachment);
            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.member.id, 'Channel', messageInfo.channel.id);
                return;
            }

            await MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetValidArtEmbed(attachment.url));
            LogService.Log(LogType.ValidateArtGood, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.ValidateArt, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async OnTemplate(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ChatInputCommandInteraction;
            const art = interaction.options.get('art')?.attachment;
            const x = interaction.options.getNumber('x');
            const y = interaction.options.getNumber('y');

            const resultInfo = await this.IsLegitArt(art);
            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.member.id, 'Channel', messageInfo.channel.id);
                return;
            }

            await interaction.deferReply();

            const image = await loadImage(art.url);

            const canvas = createCanvas(VariableManager.Get(VariableKey.CanvasWidth), VariableManager.Get(VariableKey.CanvasHeight));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, x, y);

            interaction.followUp({
                content: `Alsjeblieft :)\n\`x=${x}, y=${y}\``,
                files: [{ attachment: canvas.toBuffer(), name: `template_${art.name}`}]
            });

            LogService.Log(LogType.TemplateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.TemplateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async OnCoordinate(messageInfo: IMessageInfo) {
        const interaction = messageInfo.interaction as ChatInputCommandInteraction;
        const art = interaction.options.get('art')?.attachment;
        const xCanvas = interaction.options.getNumber('x');
        const yCanvas = interaction.options.getNumber('y');
        const time = interaction.options.getString('tijd', false);

        const resultInfo = await this.IsLegitArt(art);
        if (!resultInfo.result) {
            MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
            LogService.Log(LogType.ValidateArtBad, messageInfo.member.id, 'Channel', messageInfo.channel.id);
            return;
        }

        const bytesIn = await fetch(art.url)
            .then((res: any) => res.arrayBuffer())
            .then((arrayBuffer: any) => new Uint8Array(arrayBuffer));

        const pixels = await getPixels(bytesIn, 'image/png');

        const pixelData = [];

        for (let x = 0; x < pixels.shape[0]; x++) {
            for (let y = 0; y < pixels.shape[1]; y++) {
                const r = pixels.get(x, y, 0);
                const g = pixels.get(x, y, 1);
                const b = pixels.get(x, y, 2);
                const a = pixels.get(x, y, 3);

                if (a == 0) {
                    continue;
                }

                const hex = Utils.RGBAToHex(r, g, b);

                pixelData.push(
                    JSON.stringify({
                        x: x + xCanvas,
                        y: y + yCanvas,
                        color: hex
                    })
                );

                pixelData.push(1);
            }
        }

        const keyPixels = `${this.coordinatePixelsKey}${art.id}`;
        const keyData = `${this.coordinateDataKey}${art.id}`;

        this.pixelDataCache[art.id] = pixelData;
        await Redis.hmset(keyPixels, pixelData);
        const expire = Utils.GetHoursInSeconds(24);
        await Redis.expire(keyPixels, expire);

        if (time != null) {
            const epoch = Utils.HHMMToEpoch(time);
            await Redis.hmset(keyData, 'epoch', epoch, 'text', time);
        } else {
            await Redis.hmset(keyData, 'text', 'now');
        }

        await Redis.expire(keyData, expire);

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`coordinate_claim_${art.id}`)
                    .setLabel('Claim een pixel!')
                    .setStyle(ButtonStyle.Primary),
            );

        await interaction.reply({
            embeds: [ArtEmbeds.GetCoordinateEmbed(art.url, xCanvas, yCanvas, time)],
            components: [actionRow]
        });

        LogService.Log(LogType.CoordinateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
    }

    private static async IsLegitArt(attachment: Attachment, english: boolean = false) {
        const resultInfo: IResultInfo = {
            result : false
        };

        if (!attachment.url.toLowerCase().endsWith('.png')) {
            resultInfo.reason = english ? 'It\'s not in PNG format' : 'Het is geen PNG formaat';
            return resultInfo;
        }

        const bytesIn = await fetch(attachment.url)
            .then((res: any) => res.arrayBuffer())
            .then((arrayBuffer: any) => new Uint8Array(arrayBuffer));

        const pixels = await getPixels(bytesIn, 'image/png');
        let transparent = false;

        for (let x = 0; x < pixels.shape[0]; x++) {
            for (let y = 0; y < pixels.shape[1]; y++) {
                const r = pixels.get(x, y, 0);
                const g = pixels.get(x, y, 1);
                const b = pixels.get(x, y, 2);
                const a = pixels.get(x, y, 3);
                if (a == 0) {
                    transparent = true;
                }

                const hex = Utils.RGBAToHex(r, g, b);

                if (!VariableManager.Get(VariableKey.ValidColors).includes(hex)) {
                    resultInfo.reason = english
                        ? `The color ${hex} at position (${x}, ${y}) is not allowed.`
                        : `De kleur ${hex} op positie (${x}, ${y}) is niet toegestaan.`;
                    return resultInfo;
                }
            }
        }

        if (!transparent) {
            resultInfo.reason = english
                ? 'You don\'t have a transparent background. Is your art square? Give it a transparent border around it.'
                : 'Je hebt geen transparante achtergrond. Is je art vierkant? Geef deze dan een transparante rand eromheen.';
            return resultInfo;
        }

        resultInfo.result = true;
        return resultInfo;
    }
}