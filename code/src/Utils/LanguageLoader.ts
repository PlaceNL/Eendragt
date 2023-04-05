import * as fs from 'fs';

type LangConfig = {
    ROLE_SELECTOR_PLACEHOLDER: string,
    I_WANT_TO_HELP: string,
    ROLE_APPLICATION_ALREADY_SUBMITTED: string,
    SHOW_PROOF_OF_SKILL: string,
    APPLICATION_SENT: string,
    APPLICATION_LETTER: string,
    ROLE_APPLICATIONS_CLOSED: string,
    ROLE_APPLICATION: string,
    ROLE_CATEGORY_APPLICATION_OPEN_STATUS: string,
    OPEN: string,
    CLOSED: string,
    LOG_ROLE_CATEGORY_APPLICATION_OPEN_STATUS: string,
    CATEGORY: string,
    HERE_YOU_GO: string,
    CLAIM_A_PIXEL: string,
    PIXEL_ART_DOES_NOT_FIT_LOCATION: string,
    TIME_FORMAT: string,
    CURRENTLY_NO_PIXEL_AVAILABLE: string,
    WAIT_BEFORE_CLAIMING_ANOTHER_PIXEL: string,
    MINUTES: string,
    SECONDS: string,
    AND: string,
    FILE_FORMAT_NOT_CORRECT: string,
    FILE_SIZE_INCORRECT: string,
    COLOUR_AT_POSITION_NOT_ALLOWED: string,
    SCALE_INCORRECT: string,
    ARTWORK_NOT_TRANSPARENT: string,
    ARTWORK_HAS_NO_COLOURS: string,
    BILLY_TIME_JOKES: string[],
    YOU_ALREADY_HAVE_THIS_ROLE: string
};

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
export default class LanguageLoader {
    public static LangConfig: LangConfig = {
        APPLICATION_LETTER: 'Sollicitatiebrief',
        APPLICATION_SENT: 'Je sollicitatie is verzonden!',
        ROLE_APPLICATION_ALREADY_SUBMITTED: 'Je hebt al een sollicitatie ingediend voor deze rol.',
        SHOW_PROOF_OF_SKILL: 'Link naar iets dat je hebt gemaakt',
        ROLE_SELECTOR_PLACEHOLDER: 'Selecteer een rol',
        I_WANT_TO_HELP: '🌷 Ik wil meehelpen!',
        ROLE_APPLICATIONS_CLOSED: 'Bedankt voor je interesse, maar wij nemen momenteel geen nieuwe {roleName} meer aan.\nHoud de aankondigingen in de gaten om te weten wanneer je weer voor deze rol kan solliciteren.',
        ROLE_APPLICATION: 'Sollicitatie {roleName}',
        ROLE_CATEGORY_APPLICATION_OPEN_STATUS: 'De {roleCategory} sollicitaties zijn nu {status}.',
        OPEN: 'open',
        CLOSED: 'gesloten',
        LOG_ROLE_CATEGORY_APPLICATION_OPEN_STATUS: '{roleCategory} applicaties zijn nu {status}.',
        CATEGORY: 'Categorie',
        HERE_YOU_GO: 'Alsjeblieft',
        CLAIM_A_PIXEL: 'Claim een pixel!',
        PIXEL_ART_DOES_NOT_FIT_LOCATION: 'Deze pixel art past niet op de meegegven locatie.',
        TIME_FORMAT: 'De tijd moet in het formaat `HH:MM` zijn.',
        CURRENTLY_NO_PIXEL_AVAILABLE: 'Er zijn momenteel geen pixels meer beschikbaar. Probeer het later nog eens.',
        WAIT_BEFORE_CLAIMING_ANOTHER_PIXEL: 'Je moet {minutes}{and}{seconds} wachten voordat je weer een pixel kan claimen.',
        MINUTES: 'minuten',
        SECONDS: 'seconden',
        AND: 'en',
        FILE_FORMAT_NOT_CORRECT: 'Het is geen {format} formaat',
        FILE_SIZE_INCORRECT: 'De afbeelding is te groot.\nMax breedte: {width}, max hoogte: {height}',
        COLOUR_AT_POSITION_NOT_ALLOWED: 'De kleur {hex} op positie ({x}, {y}) is niet toegestaan.',
        SCALE_INCORRECT: 'Je pixel art lijkt geen 1:1 scaling te hebben. Als het wel 1:1 scaling heeft, voeg rechts dan een transparante rand toe.',
        ARTWORK_NOT_TRANSPARENT: 'Je hebt geen transparante achtergrond. Is je art rechthoekig? Voeg rechts dan een transparante rand toe.',
        ARTWORK_HAS_NO_COLOURS: 'Deze afbeelding is volledig transparant.',
        BILLY_TIME_JOKES: ['Zeg Billy, hoe laat is het bij jou?\nBilly: {time}'],
        YOU_ALREADY_HAVE_THIS_ROLE: 'Je hebt de rol al.'
    };
    public static LoadLanguageConfig(languageCode: string) {
        try {
            const json = fs.readFileSync(`lang/${languageCode}.json`, 'utf8');
            const parsedObject: Partial<LangConfig> = JSON.parse(json);
            this.LangConfig = Object.assign(this.LangConfig, parsedObject);
        } catch (e) {
            if (e instanceof Error) {
                console.log(`Error Message: ${e.message}\nAn error occurred while loading the language configuration, settings default values...`);
            }
        }
    }
}
