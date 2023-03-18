import SettingsConstants from '../Constants/SettingsConstants';

export default class CommandService {

    public static GetCommandString(command?: string, args?: Array<string>, asValues?: boolean) {
        if (command == null) { return ''; }

        let str;
        str = `\`${SettingsConstants.DEFAULT_PREFIX}${command}`;

        if (args != null) {
            for (const arg of args) {
                str += asValues ? ` ${arg}` : ` [${arg}]`;
            }
        }

        return `${str}\``;
    }
}