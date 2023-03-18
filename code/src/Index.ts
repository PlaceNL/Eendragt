require('dotenv').config();

import './Utils/MonkeyPatches';
import BotManager from './Managers/BotManager';
import Discord from './Providers/Discord';

class Main {

    constructor() {
        Discord.SetEventReadyCallback(BotManager.OnReady);
        Discord.SetEventReactionAddCallback(BotManager.OnReactionAdd);
        Discord.SetEventThreadCreateCallback(BotManager.OnThreadCreate);
        Discord.SetEventInteractionCommandCallback(BotManager.OnInteractionCommand);
        Discord.SetEventInteractionButtonCallback(BotManager.OnInteractionButton);
        Discord.SetEventInteractionModalCallback(BotManager.OnInteractionModal);
        Discord.SetEventInteractionSelectMenuCallback(BotManager.OnInteractionSelectMenu);
        Discord.Init();
    }
}

new Main();