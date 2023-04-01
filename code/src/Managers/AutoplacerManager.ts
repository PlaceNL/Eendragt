import { ActivityType } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import Discord from '../Providers/Discord';

const WebSocket = require('ws');

export default class AutoplacerManager {

    private static attempts: number = 0;
    private static updateReady: boolean = true;

    public static Start() {
        const ws = new WebSocket('wss://chief.placenl.nl/ws');

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
                type: 'subscribe',
                payload: ['stats']
            }));
        };

        ws.onmessage = (ev: MessageEvent<any>) => {
            const data = JSON.parse(ev.data);

            console.log(data);

            if (data.type == 'hello') {
                this.attempts = 0;
            } else if (data.type == 'ping') {
                ws.send(JSON.stringify({
                    type: 'pong'
                }));
            } else if (data.type == 'stats') {
                if (this.updateReady) {
                    console.log('Heb de stats!');
                    Discord.GetClient().user.setActivity(`${data.payload.capabilities.place} autoplacers`, { type: ActivityType.Watching });
                    this.updateReady = false;
                }
            }
        };

        setInterval(() => {
            this.updateReady = true;
        }, SettingsConstants.ACTIVITY_UPDATE_INTERVAL);
    }
}
