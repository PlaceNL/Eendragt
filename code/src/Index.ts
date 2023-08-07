import LanguageLoader from "./Utils/LanguageLoader";

require('dotenv').config();

import './Utils/MonkeyPatches';
import BotManager from './Managers/BotManager';
import Discord from './Providers/Discord';
import SettingsConstants from "./Constants/SettingsConstants";

class Main {

    constructor() {
        LanguageLoader.LoadLanguageConfig(SettingsConstants.LANGUAGE)
        Discord.SetEventReadyCallback(BotManager.OnReady);
        Discord.SetEventReactionAddCallback(BotManager.OnReactionAdd);
        Discord.SetEventThreadCreateCallback(BotManager.OnThreadCreate);
        Discord.SetEventInteractionSlashCommandCallback(BotManager.OnInteractionSlashCommand);
        Discord.SetEventInteractionButtonCallback(BotManager.OnInteractionButton);
        Discord.SetEventInteractionModalCallback(BotManager.OnInteractionModal);
        Discord.SetEventInteractionSelectMenuCallback(BotManager.OnInteractionSelectMenu);
        Discord.SetEventInteractionContextMenuCommandCallback(BotManager.OnInteractionContextMenuCommand);
        Discord.SetEventVoiceStateUpdateCallback(BotManager.OnVoiceStateUpdate);
        Discord.Init();
    }
}

new Main();