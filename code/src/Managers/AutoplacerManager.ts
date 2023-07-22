import { ActivityType, TextChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import Discord from '../Providers/Discord';
import DiscordService from '../Services/DiscordService';
import AutoplacerEmbeds from '../Embeds/AutoplacerEmbeds';

const WebSocket = require('ws');

export default class AutoplacerManager {

    private static attempts: number = 0;
    private static updateReady: boolean = true;
    private static ws: WebSocket;

    private static lastCorrectPercentage: number = 0;

    public static Start() {
        const ws = new WebSocket('wss://chief.placenl.nl/ws');
        this.ws = ws;

        ws.onerror = () => {
            console.error('Could not connect to chief websocket.');
            this.attempts += 1;
            if (this.attempts >= 5) {
                console.error('Too many failed attempts to connect to chief websocket. Stopping attempts.');
                return;
            }

            setTimeout(() => {
                this.Start();
            }, 1000 * 10);
        };

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'brand',
                payload: {
                    author: 'PlaceNL',
                    name: 'Eendragt',
                    version: '1.0.0',
                }
            }));

            ws.send(JSON.stringify({
                type: 'subscribe',
                payload: 'stats'
            }));

            ws.send(JSON.stringify({
                type: 'subscribe',
                payload: 'orders'
            }));
        };

        ws.onmessage = async (ev: MessageEvent<any>) => {
            const data = JSON.parse(ev.data);

            if (data.type == 'hello') {
                this.attempts = 0;
            } else if (data.type == 'ping') {
                ws.send(JSON.stringify({
                    type: 'pong'
                }));
            } else if (data.type == 'stats') {
                if (this.updateReady) {
                    Discord.GetClient().user.setActivity(`${data.payload.capabilities.place} autoplacers`, { type: ActivityType.Watching });
                    this.updateReady = false;
                }

                const {right, total} = data.payload.completion;
                const correctPercentage = right/total*100;
                if(correctPercentage < this.lastCorrectPercentage - 20) { //20 should be enough
                    const channel = <TextChannel> await DiscordService.FindChannelById('1091364427263123506');
                    channel.send({
                        embeds: [AutoplacerEmbeds.GetErrorEmbed(this.lastCorrectPercentage, correctPercentage)]
                    });
                }
                this.lastCorrectPercentage = correctPercentage;
            } else if (data.type == 'order') {
                const channel = <TextChannel> await DiscordService.FindChannelById('1132052836616781935');
                channel.send({
                    embeds: [AutoplacerEmbeds.GetNewTemplateEmbed(data.payload)]
                });
            }
        };

        setInterval(() => {
            this.updateReady = true;
        }, SettingsConstants.ACTIVITY_UPDATE_INTERVAL);
    }

    public static GetLatestOrder() {
        this.ws.send(JSON.stringify({
            type: 'getOrder',
        }));
    }
}
