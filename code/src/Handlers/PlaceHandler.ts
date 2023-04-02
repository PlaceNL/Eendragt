import { Canvas, createCanvas, loadImage } from 'canvas';
import { ChatInputCommandInteraction, Message, TextChannel } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Redis } from '../Providers/Redis';

const fetch = require('cross-fetch');

export default class PlaceHandler {

    private static readonly keyMessage: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.CANVAS}${RedisConstants.KEYS.MESSAGE}`;
    private static readonly keyCooldown: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.CANVAS}${RedisConstants.KEYS.COOLDOWN}`;

    private static cacheCanvas: Canvas;
    private static cacheMessage: Message;

    public static OnCommand(messageInfo: IMessageInfo) {
        const commandsSlash = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commandsSlash.CANVAS:
                this.OnCanvas(messageInfo);
                break;
            case commandsSlash.PLACE:
                this.OnPlace(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    private static async OnCanvas(messageInfo: IMessageInfo) {
        const interaction = messageInfo.interaction as ChatInputCommandInteraction;

        const canvas = createCanvas(SettingsConstants.MINI_CANVAS_SIZE, SettingsConstants.MINI_CANVAS_SIZE);
        this.cacheCanvas = canvas;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, SettingsConstants.MINI_CANVAS_SIZE, SettingsConstants.MINI_CANVAS_SIZE);

        const canvasImageData = canvas.toBuffer();
        const image = await loadImage(canvasImageData);

        const scaledCanvas = createCanvas(SettingsConstants.MINI_CANVAS_UPSCALE, SettingsConstants.MINI_CANVAS_UPSCALE);
        const scaledCtx = scaledCanvas.getContext('2d');

        scaledCtx.drawImage(image, 0, 0, canvas.width, canvas.height, 0, 0, scaledCanvas.width, scaledCanvas.height);

        this.cacheMessage = await interaction.channel.send({
            content:
`Alleen kan je iets maken.
Samen kan je meer maken.

Gebruik \`/place\` om een pixel te plaatsen.`,
            files: [{ attachment: scaledCanvas.toBuffer(), name: 'canvas.png'}],
        });

        Redis.hmset(this.keyMessage, {
            messageId: this.cacheMessage.id,
            channelId: this.cacheMessage.channel.id,
        });

        await interaction.reply({
            content: 'Done',
            ephemeral: true,
        });

    }

    private static async OnPlace(messageInfo: IMessageInfo) {
        const interaction = messageInfo.interaction as ChatInputCommandInteraction;
        const x = interaction.options.getInteger('x');
        const y = interaction.options.getInteger('y');
        const color = `#${interaction.options.getString('kleur')}`;

        const cooldown = await Redis.get(`${this.keyCooldown}${interaction.user.id}`);

        if (cooldown) {
            await interaction.reply({
                content: 'Je moet even wachten voordat je weer een pixel kan plaatsen.',
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        if (this.cacheCanvas == null) {
            const messageData = await Redis.hgetall(this.keyMessage);
            if (messageData == null) {
                interaction.reply({
                    content: 'Er is geen canvas om op te plaatsen.',
                    ephemeral: true,
                });
                return;
            } else {
                const channelId = messageData.channelId;
                const channel = await interaction.guild.channels.fetch(channelId) as TextChannel;
                this.cacheMessage = await channel.messages.fetch(messageData.messageId);
                const attachment = this.cacheMessage.attachments.first();
                const imageData = await fetch(attachment.url);
                const image = await loadImage(imageData.url);

                const canvas = createCanvas(SettingsConstants.MINI_CANVAS_SIZE, SettingsConstants.MINI_CANVAS_SIZE);
                this.cacheCanvas = canvas;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, SettingsConstants.MINI_CANVAS_UPSCALE, SettingsConstants.MINI_CANVAS_UPSCALE, 0, 0, SettingsConstants.MINI_CANVAS_SIZE, SettingsConstants.MINI_CANVAS_SIZE);
            }
        }

        const canvas = this.cacheCanvas;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);

        const canvasImageData = canvas.toBuffer();
        const image = await loadImage(canvasImageData);

        const scaledCanvas = createCanvas(SettingsConstants.MINI_CANVAS_UPSCALE, SettingsConstants.MINI_CANVAS_UPSCALE);
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCtx.imageSmoothingEnabled = false;

        scaledCtx.drawImage(image, 0, 0, canvas.width, canvas.height, 0, 0, scaledCanvas.width, scaledCanvas.height);

        this.cacheMessage.edit({
            files: [{ attachment: scaledCanvas.toBuffer(), name: 'canvas.png'}],
        });

        const time = new Date().getTime() + SettingsConstants.MINI_PLACE_COOLDOWN * 1000;

        Redis.set(`${this.keyCooldown}${interaction.user.id}`, '1', 'ex', SettingsConstants.MINI_PLACE_COOLDOWN);

        interaction.followUp({
            content: `Ik heb de kleur ${color} geplaatst op ${x}, ${y}\n
Je mag <t:${Math.floor(time / 1000)}:R> weer een pixel plaatsen.`,
            ephemeral: true,
        });
    }
}