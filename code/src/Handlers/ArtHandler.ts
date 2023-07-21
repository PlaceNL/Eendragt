import {
    ActionRowBuilder,
    Attachment,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction
} from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import IResultInfo from '../Interfaces/IResultInfo';
import MessageService from '../Services/MessageService';
import {getPixels} from 'ndarray-pixels';
import ArtEmbeds from '../Embeds/ArtEmbeds';
import {Utils} from '../Utils/Utils';
import SuggestionHandler from './SuggestionHandler';
import DiplomacyHandler from './DiplomacyHandler';
import LogService from '../Services/LogService';
import {LogType} from '../Enums/LogType';
import VariableManager from '../Managers/VariableManager';
import {VariableKey} from '../Enums/VariableKey';
import {Redis} from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';
import LanguageLoader from '../Utils/LanguageLoader';

const { createCanvas, loadImage } = require('canvas');

const fetch = require('cross-fetch');

export default class ArtHandler {

    private static readonly keyCoordinatePixels: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.ART}${RedisConstants.KEYS.COORDINATE}`;
    private static readonly keyCoordinateTime: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.ART}${RedisConstants.KEYS.COORDINATE}${RedisConstants.KEYS.TIME}`;
    private static readonly keyClaimCooldown: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.ART}${RedisConstants.KEYS.COOLDOWN}`;
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
            case commands.GRID:
                this.OnGrid(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static async OnClaimPixel(messageInfo: IMessageInfo, id: string) {
        try {
            const cooldownKey = `${this.keyClaimCooldown}${messageInfo.member.id}`;
            const cooldown = await Redis.get(cooldownKey);
            if (cooldown) {
                const expire = await Redis.ttl(cooldownKey);
                const minutes = Math.floor(expire / 60);
                const seconds = expire - minutes * 60;

                const content = LanguageLoader.LangConfig.WAIT_BEFORE_CLAIMING_ANOTHER_PIXEL
                    .replace('{minutes}', minutes <= 0 ? '' : `${minutes} ${LanguageLoader.LangConfig.MINUTES}`)
                    .replace('{and}', minutes <= 0 || seconds <= 0 ? '' : ` ${LanguageLoader.LangConfig.AND} `)
                    .replace('{seconds}', seconds <= 0 ? '' : `${seconds} ${LanguageLoader.LangConfig.SECONDS}`);
                await (<ButtonInteraction> messageInfo.interaction).reply({
                    content: content,
                    ephemeral: true,
                });

                return;
            }

            const keyPixels = `${this.keyCoordinatePixels}${id}`;
            const keyTime = `${this.keyCoordinateTime}${id}`;

            let keys: Array<string>;
            let fromCache = false;

            const pixels = await Redis.hgetall(keyPixels);
            if (pixels == null) {
                keys = this.pixelDataCache[id];
                if (keys == null) {
                    (<ButtonInteraction> messageInfo.interaction).reply({
                        content: LanguageLoader.LangConfig.CURRENTLY_NO_PIXEL_AVAILABLE,
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

            Redis.hdel(keyPixels, pixelString);

            const epoch = parseInt((await Redis.get(keyTime)) || '0');
            let timePassed = epoch == 0;
            let diff = 0;

            if (epoch != 0) {
                const now = new Date().getTime();
                const time = epoch;
                if (now > time) {
                    timePassed = true;
                } else {
                    diff = Math.floor((time - now) / 1000); // calculate difference in seconds
                    diff = Math.ceil(diff / 60); // convert to minutes, rounding up
                }
            }

            if (!fromCache) {
                setTimeout(() => {
                    Redis.hset(keyPixels, pixelString, 1);
                }, Utils.GetMinutesInMiliSeconds(timePassed ? 5 : diff));
            }

            Redis.set(`${this.keyClaimCooldown}${messageInfo.member.id}`, 1, 'EX', Utils.GetMinutesInSeconds(timePassed ? 5 : diff));

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

            const embed = ArtEmbeds.GetClaimPixelEmbed(pixelData.x, pixelData.y, pixelData.color, url, timePassed ? 0 : epoch / 1000);

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
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.CoordinateClaim, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async OnValidate(messageInfo: IMessageInfo) {
        try {
            const attachment = (<ChatInputCommandInteraction> messageInfo.interaction).options.getAttachment('art');

            if (messageInfo.channel.isThread()) {
                if (messageInfo.channel.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
                    const resultInfo = await this.IsLegitArt(attachment);
                    SuggestionHandler.OnValidateArt(messageInfo, resultInfo, attachment);
                    return;
                } else if (messageInfo.channel.parentId == SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID) {
                    const resultInfo = await this.IsLegitArt(attachment);
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
            const art = interaction.options.getAttachment('art');
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
                content: `${LanguageLoader.LangConfig.HERE_YOU_GO}\n\`x=${x}, y=${y}\``,
                files: [{ attachment: canvas.toBuffer(), name: `template_${art.name}`}]
            });

            LogService.Log(LogType.TemplateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.TemplateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async OnCoordinate(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ChatInputCommandInteraction;
            const art = interaction.options.getAttachment('art');
            const xCanvas = interaction.options.getNumber('x');
            const yCanvas = interaction.options.getNumber('y');
            const time = interaction.options.getString('tijd', false);

            // Check if time is of the format HH:MM
            if (time != null && !time.match(/^[0-9]{2}:[0-9]{2}$/)) {
                interaction.reply({
                    content: LanguageLoader.LangConfig.TIME_FORMAT,
                    ephemeral: true,
                });

                return;
            }

            const resultInfo = await this.IsLegitArt(art);
            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.member.id, 'Channel', messageInfo.channel.id);
                return;
            }

            const imageResponse = await fetch(art.url);
            const imageArrayBuffer = await imageResponse.arrayBuffer();
            const imageBuffer = Buffer.from(imageArrayBuffer);
            const bytesIn = new Uint8Array(imageArrayBuffer);

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

            const keyPixels = `${this.keyCoordinatePixels}${art.id}`;
            const keyTime = `${this.keyCoordinateTime}${art.id}`;

            await Redis.hmset(keyPixels, pixelData);
            const expire = Utils.GetHoursInSeconds(24);
            await Redis.expire(keyPixels, expire);

            this.pixelDataCache[art.id] = Object.keys(await Redis.hgetall(keyPixels));

            const total = pixelData.length / 2;

            let epoch = 0;

            if (time != null) {
                epoch = Utils.HHMMToEpoch(time);
            }

            await Redis.set(keyTime, epoch, 'EX', expire);

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`coordinate_claim_${art.id}`)
                        .setLabel(LanguageLoader.LangConfig.CLAIM_A_PIXEL)
                        .setStyle(ButtonStyle.Primary),
                );

            const reply = await interaction.reply({
                embeds: [ArtEmbeds.GetCoordinateEmbed('attachment://image.png', xCanvas, yCanvas, epoch / 1000, time != null ? total : null, 0)],
                components: [actionRow],
                files: [{ attachment: imageBuffer, name: 'image.png' }],
            });

            const message = await reply.fetch();

            if (time != null) {
                const f: any = async () => {
                    const now = new Date().getTime();
                    const time = epoch;
                    if (now > time) {
                        message.embeds[0].fields.pop();
                        message.edit({
                            embeds: [message.embeds[0]],
                        });
                        clearInterval(f);
                        return;
                    }

                    const data = await Redis.hgetall(keyPixels);

                    if (data == null) {
                        clearInterval(f);
                        return;
                    }

                    message.embeds[0].fields[0].value = `${total - Object.keys(data).length} / ${total}`;
                    message.edit({
                        embeds: [message.embeds[0]],
                        files: [],
                    });

                };

                setInterval(f, 10000);
            }

            LogService.Log(LogType.CoordinateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.CoordinateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async OnGrid(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ChatInputCommandInteraction;
            const art = interaction.options.getAttachment('art');
            const startX = interaction.options.getNumber('x');
            const startY = interaction.options.getNumber('y');

            const resultInfo = await this.IsLegitArt(art);
            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.member.id, 'Channel', messageInfo.channel.id);
                return;
            }

            await interaction.deferReply();
            const pixels = await this.GetPixels(art);
            interaction.followUp({
                content: LanguageLoader.LangConfig.FILE_FORMAT_NOT_CORRECT.replace('{format}', 'PNG'),
                ephemeral: true,
            });

            const size = 35;

            const image = await loadImage(art.url);
            const canvas = createCanvas(image.width * size, image.height * size);
            const ctx = canvas.getContext('2d');

            if (startX + image.width > VariableManager.Get(VariableKey.CanvasHeight)
            || startY + image.height > VariableManager.Get(VariableKey.CanvasWidth)) {
                interaction.followUp({
                    content: LanguageLoader.LangConfig.PIXEL_ART_DOES_NOT_FIT_LOCATION,
                    ephemeral: true,
                });

                return;
            }

            if (startX + image.width > 1000 ||
                startY + image.height > 1000) {
                ctx.font = '9px sans-serif';
            }

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(image, 0, 0, image.width * size, image.height * size);

            for (let i = 0; i < image.height; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * size);
                ctx.lineTo(image.width * size, i * size);
                ctx.stroke();
            }

            for (let i = 0; i < image.width; i++) {
                ctx.beginPath();
                ctx.moveTo(i * size, 0);
                ctx.lineTo(i * size, image.height * size);
                ctx.stroke();
            }

            for (let i = 0; i < image.height; i++) {
                for (let j = 0; j < image.width; j++) {
                    if (pixels.get(j, i, 3) == 0) {
                        continue;
                    }

                    const r = pixels.get(j, i, 0);
                    const g = pixels.get(j, i, 1);
                    const b = pixels.get(j, i, 2);

                    // Use black text if the pixel is light
                    const brightness = Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
                    if (brightness > 125) {
                        ctx.fillStyle = '#000000';
                    } else {
                        ctx.fillStyle = '#ffffff';
                    }

                    ctx.fillText(`x:${startX + j}`, j * size + 2, i * size + 13);
                    ctx.fillText(`y:${startY + i}`, j * size + 2, i * size + 28);
                }
            }

            interaction.followUp({
                content: LanguageLoader.LangConfig.HERE_YOU_GO,
                files: [{ attachment: canvas.toBuffer(), name: `grid_${art.name}`}]
            });

            LogService.Log(LogType.GridCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.GridCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async IsLegitArt(attachment: Attachment) {
        const resultInfo: IResultInfo = {
            result : false
        };

        if (!attachment.url.toLowerCase().endsWith('.png')) {
            resultInfo.reason = LanguageLoader.LangConfig.FILE_FORMAT_NOT_CORRECT.replace('{format}', 'PNG');
            return resultInfo;
        }

        const pixels = await this.GetPixels(attachment);
        if (pixels == null) {
            resultInfo.reason = LanguageLoader.LangConfig.FILE_FORMAT_NOT_CORRECT.replace('{format}', 'PNG');
            return resultInfo;
        }

        let transparent = false;
        let colors = false;

        if (pixels.shape[0] > SettingsConstants.MAX_IMAGE_SIZE
            || pixels.shape[1] > SettingsConstants.MAX_IMAGE_SIZE) {
            resultInfo.reason = LanguageLoader.LangConfig.FILE_SIZE_INCORRECT
                .replace('{width}', `${SettingsConstants.MAX_IMAGE_SIZE}`)
                .replace('{height}', `${SettingsConstants.MAX_IMAGE_SIZE}`);
            return resultInfo;
        }

        let currentColor = '';
        let currentColorCount = 0;
        let singlePixel = false;

        for (let x = 0; x < pixels.shape[0]; x++) {
            for (let y = 0; y < pixels.shape[1]; y++) {
                const r = pixels.get(x, y, 0);
                const g = pixels.get(x, y, 1);
                const b = pixels.get(x, y, 2);
                const a = pixels.get(x, y, 3);

                if (!singlePixel) {
                    const colorString = `${r},${g},${b},${a}`;
                    if (currentColor == colorString) {
                        currentColorCount++;
                    } else {
                        if (currentColorCount == 1) {
                            singlePixel = true;
                        }

                        currentColorCount = 1;
                        currentColor = colorString;
                    }
                }

                if (a == 0) {
                    transparent = true;
                } else if (a < 255) {
                    resultInfo.reason = LanguageLoader.LangConfig.PIXEL_IS_TRANSLUCENT
                        .replace('{x}', `${x}`)
                        .replace('{y}', `${y}`);
                    return resultInfo;
                } else {
                    colors = true;

                    const hex = Utils.RGBAToHex(r, g, b);

                    if (!VariableManager.Get(VariableKey.ValidColors).includes(hex)) {
                        resultInfo.reason = LanguageLoader.LangConfig.COLOUR_AT_POSITION_NOT_ALLOWED
                            .replace('{hex}', `${hex}`)
                            .replace('{x}', `${x}`)
                            .replace('{y}', `${y}`);
                        return resultInfo;
                    }
                }
            }
        }

        if (!singlePixel) {
            resultInfo.reason = LanguageLoader.LangConfig.SCALE_INCORRECT;
            return resultInfo;
        }

        if (!transparent) {
            resultInfo.reason = LanguageLoader.LangConfig.ARTWORK_NOT_TRANSPARENT;
            return resultInfo;
        }

        if (!colors) {
            resultInfo.reason = LanguageLoader.LangConfig.ARTWORK_HAS_NO_COLOURS;
            return resultInfo;
        }

        resultInfo.result = true;
        return resultInfo;
    }

    private static async GetPixels(attachment: Attachment) {
        try {
            const bytesIn = await fetch(attachment.url)
                .then((res: any) => res.arrayBuffer())
                .then((arrayBuffer: any) => new Uint8Array(arrayBuffer));

            return await getPixels(bytesIn, 'image/png');
        } catch (error) {
            return null;
        }
    }
}