export function addStyle(css: string): void {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
}

export function ignore(...args: unknown[]): void {
    // just ignore
}

export function defaultValue<T = string>(val: T | undefined, _defaultValue: T): T {
    if (val === undefined) {
        return _defaultValue;
    }

    return val;
}

export function stringifyError(input: string | Error): string {
    const error: string = typeof input === 'string' ? input : typeof input.message === 'string' ? input.message : 'No Error message available!';
    return error;
}

export type WaitFunction<T = boolean, A = T> = () => T | A | undefined | null | false | Promise<T | A | undefined | null | false>;

export interface WaitOptions<T, A = T, E = Exclude<T | A, false | null | undefined>> {
    additionalMessage?: string;
    insteadOfError?: E;
    minimalWaitTime?: number;
}

export function setIntervalAsync(callback: (args: void) => Promise<void>, ms?: number): Timer {
    let currentlyInInterval = false;
    const _finished: () => void = () => {
        currentlyInInterval = false;
    };
    const ID: Timer = setInterval((): void => {
        if (currentlyInInterval === true) {
            console.warn('In SetIntervalAsync: The Task took to long for a single Interval!');
            return;
        }
        callback().then(_finished).catch(_finished);
    }, ms);

    return ID;
}

export async function waitFor<T = boolean, A = T, E = Exclude<T | A, false | null | undefined>>(
    func: WaitFunction<T, A>,
    interval: IntervalOption | number = 500,
    timeout: IntervalOption | number = 30 * TIME.sec,
    options: WaitOptions<T, A, E> = {}
): Promise<Exclude<T | A, false | null | undefined> | E> {
    if (typeof interval === 'object' && typeof timeout === 'object') {
        throw new Error('Only Timeout or Interval can have a amount defined!');
    }

    const _interval: number = typeof interval === 'number' ? interval : (timeout as number) / interval.amount;
    const _timeout: number = typeof timeout === 'number' ? timeout : _interval * timeout.amount;

    return new Promise((resolve) => {
        const startTime = new Date().getTime();
        const returnPromise: (arg: Exclude<T | A, false | null | undefined> | E) => Promise<void> = async (arg) => {
            const now = new Date().getTime();
            if (options.minimalWaitTime !== undefined && startTime - now < options.minimalWaitTime) {
                await sleep(options.minimalWaitTime - (startTime - now));
                return resolve(arg);
            }
            return resolve(arg);
        };

        const tID = setTimeout((): Promise<void> => {
            clearInterval(ID);
            clearTimeout(tID);
            if (options.insteadOfError === undefined) {
                throw new Error(`Took to long${options.additionalMessage !== undefined ? `: ${options.additionalMessage}` : '!'}`);
            } else {
                return returnPromise(options.insteadOfError);
            }
        }, _timeout);
        const ID = setIntervalAsync(async (): Promise<void> => {
            try {
                const result: T | A | Awaited<T | A> | undefined | null | false = await func();
                if (typeof result === 'boolean' ? result === true : result !== undefined && result !== null) {
                    clearInterval(ID);
                    clearTimeout(tID);
                    return returnPromise(result as Exclude<T | A, false | null | undefined>);
                }
            } catch (error) {
                clearInterval(ID);
                clearTimeout(tID);
                if (options.insteadOfError === undefined) {
                    throw error;
                } else {
                    return returnPromise(options.insteadOfError);
                }
            }
        }, _interval);
    });
}

export interface RequestOptions {
    type?: GM_httpMethod;
    url?: string;
    data?: NormalObject | string;
    contentType?: string;
    query?: string[][] | NormalObject;
    time?: boolean;
    parseBody?: boolean;
    timeout?: number;
    queryAsArray?: boolean;
    jdownloader?: boolean;
}

export type ErrorFunction = (e: Error, result: GM_HttpResult) => void;

export type SuccessFunction<N extends NormalObject = NormalObject> = (result: GM_HttpResult, resultOK: boolean, parsedBody: N | null) => void;

export const GLOB: GLOBAL_SETTINGS = { QUERY_APPEND_TIME: false, LOG_SWALLOW: true };

/**
 *
 * @param {Object with the Properties} options {
 * 		type: Request Type eg. POST GET etc  --> POST
 * 		url: Url to request  --> "ERROR"
 * 		data: string with data, can be an object that then gets stringified. Not needed when type= GET,HEAD  --> {}
 * 		contentType: The content Type header -->  'application/json'
 * 		query: Array with query strings, must be ["hello=e","that=4"], when GLOB settings is set to QUERY_APPEND_TIME it appends a time int --> []
 * }
 * @param {function wich gets (e) on Error} onerror
 * @param {function which gets the (xhr) on success} onsuccess(xhr,optional isOnline), the isOnline is optional and is true if we are online!!, only when we set GLOBAL_USE_OFFLINE_HOSTS to false!!
 * @returns
 */
export function makeRequest<N extends NormalObject = NormalObject>(options: RequestOptions, onerror?: ErrorFunction, onsuccess?: SuccessFunction<N>): void {
    options.type = options.type ?? 'GET';
    if (options.url === undefined) {
        throw new Error('Url not specified!');
    }
    if (options.url.startsWith('/')) {
        options.url = `${location.protocol}//${location.host}${options.url}`;
    }
    options.timeout = options.timeout !== undefined ? options.timeout : 60 * 1000;
    options.data = options.data !== undefined ? options.data : '';
    options.contentType = options.contentType !== undefined ? options.contentType : 'application/json; charset=UTF-8';
    options.queryAsArray = options.queryAsArray !== undefined ? options.queryAsArray : false;
    options.jdownloader = options.jdownloader !== undefined ? options.jdownloader : false;
    options.query = options.query !== undefined ? options.query : [];
    options.time = typeof options.time === 'undefined' ? GLOB.QUERY_APPEND_TIME : options.time; // time could be false (also falsy)!!!)
    // checking options and performing stuff on them

    // TODO better toString for arrays, they have to be correctly URL encoded, maybe JSON stringify is enough, is this still necessary?!?!
    if (!Array.isArray(options.query) && options.queryAsArray === true) {
        // atm it only works without the "" from JSON.stringify(value)
        options.query = Object.entries(options.query).map(([key, value]: [string, unknown]): string[] => [key, typeof value === 'string' ? value : JSON.stringify(value)]);
    }

    if (!Array.isArray(options.query) && options.jdownloader === true) {
        //  {%22links%22:%22https://voeunblk.com/e/0cehjoghx9vo%22,%22packageName%22:%22Navy%20CIS%20s18e4%20[Deutsch]-PACKAGE%22}
        //  i =  {links:["https://voeunblk.com/e/0cehjoghx9vo"], packageName: "Navy CIS s18e4 [Deutsch]-PACKAGE"};

        const entries = Object.entries(options.query);
        for (const entry of entries) {
            const [key, value] = entry;
            if (Array.isArray(value)) {
                options.query[key] = (value as unknown[]).join(';');
            }
        }
    }

    if (Array.isArray(options.query) && options.time === true) {
        options.query.push(['time', new Date().getTime().toString()]);
    }

    const queryString = Array.isArray(options.query)
        ? options.query.length > 0
            ? options.query
                  .map((array: string[] | string): string => {
                      if (typeof array === 'string') {
                          return array;
                      } else {
                          const [fst, sc] = array;
                          if (sc.length === 0) {
                              return fst;
                          }
                          return array.join('=');
                      }
                  })
                  .join('&')
            : ''
        : JSON.stringify(options.query);

    if (!onerror) {
        onerror = (e: Error, event: GM_HttpResult) => {
            console.error(e, event);
        };
    }
    if (typeof options.data !== 'string' && options.contentType.startsWith('application/json')) {
        options.data = JSON.stringify(options.data);
    } else if (typeof options.data !== 'string' && options.contentType.startsWith('application/x-www-form-urlencoded')) {
        options.data = Object.keys(options.data)
            .map((key: string) => [key, (options.data as NormalObject<string>)[key]])
            .map((x: string[]) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
            .join('&');
    } else {
        options.data = options.data.toString();
    }
    // const host = new URL(options.url).host;

    const url = `${options.url}${queryString.length > 0 ? `?${queryString}` : ''}`;

    // Doing all with the options etc
    GM.xmlHttpRequest({
        method: options.type,
        url,
        timeout: options.timeout,
        data: options.data,
        // this should only be used, if the response is really json, otherwise the parsing could fail and no data would be received
        // responseType: "json",
        onerror: (event: GM_HttpResult) => {
            onerror?.(new Error(`${options.type as GM_httpMethod} ${url} ${event.status} - ${event.statusText} - `), event);
        },
        onload(xhr: GM_HttpResult) {
            try {
                if (xhr.status >= 200 && xhr.status < 500) {
                    /*    const headers = new Headers(xhr.responseHeaders.split("\r\n").map(a=>{
                        const index = a.indexOf(":");
                        if(index < 0 ){
                            return [];
                        }
                        return [a.substring(0,index),a];
                        }).filter(a=>a.length!=0))
                    const parsedBody : NormalObject | null = options.parseBody && xhr.response !== null ? (
                    headers.get("Content-Type")?.split(":")[1].trim() === "application/json"
                    ? pJson( xhr.response.toString())
                    : null
                    ) : null */
                    const parsedBody: NormalObject | null = options.parseBody !== undefined && xhr.response !== null ? pJson(xhr.response.toString()) : null;
                    // true instead of xhr.status >= 200 && xhr.status < 500 :)
                    onsuccess?.(xhr, xhr.status >= 200 && xhr.status < 500, parsedBody as N);
                } else {
                    console.error(xhr);
                    //  onerror?.(new Error(`Server with host ${host} offline!`));
                    onerror?.(new Error(`Server error: ${xhr.statusText}!`), xhr);
                }
            } catch (e) {
                onerror?.(e as Error, xhr);
            }
        },
        ontimeout: (event: GM_HttpResult) => {
            onerror?.(new Error(`Timeout reached after ${options.timeout ?? '?'} milliseconds!`), event);
        },
        headers: {
            'Content-Type': options.contentType,
        },
    });
}

export async function makeRequestAsync<N extends NormalObject = NormalObject>(options: RequestOptions, logSilently = false): Promise<ExtendedHttpResult<N | null>> {
    return await new Promise((resolve: (value: ExtendedHttpResult<N | null>) => void, reject) => {
        makeRequest<N>(
            options,
            (e: Error, event: GM_HttpResult) => {
                if (logSilently) {
                    console.debug(event);
                }
                throw e;
            },
            (result, resultOk, parsedBody) => {
                resolve([result, resultOk, parsedBody]);
            }
        );
    });
}

export function pJson<T = NormalObject, A = T>(input: string, defaultValue: A = {} as A): T | A {
    try {
        return JSON.parse(input) as T;
    } catch (err) {
        return defaultValue;
    }
}

export function extension(arg: string): string {
    return arg.substring(arg.lastIndexOf('.') + 1);
}

export function removeSpecialChars(input: string): string {
    return input.replaceAll(/ {2}|[&/:=?]/g, '_');
}

export interface AVObject {
    Video: string;
    Audio: string;
    index?: number;
}

export function sortByQuality(a: AVObject, b: AVObject): number {
    const { Video: v1, Audio: a1 } = a;
    const { Video: v2, Audio: a2 } = b;
    const videoRank = ['1080p', '720p', 'bd', 'dvd', 'cam'];
    const audioRank = ['ac3', 'dts', 'line', 'mic']; // dts and ac3 ?? is this right
    const rating: number[] = [
        [v1, a1],
        [v2, a2],
    ].map(([c, d]: string[]): number => {
        let r1 = videoRank.indexOf(c.toLowerCase());
        let r2 = audioRank.indexOf(d.toLowerCase());
        r1 = r1 === -1 ? videoRank.length : r1;
        r2 = r2 === -1 ? audioRank.length : r2;
        return r1 * 20 + r2;
    });

    return rating[0] - rating[1];
}

export const SeriesLanguagesLookup: LanguageDefinition[] = [
    // key, Präferenz, Kürzel, ausgeschrieben, news name
    [1, 0, 'de', 'Deutsch', ['Deutsch', 'Deutsch-Untertitel']], // weird, but it is like that
    [3, 1, 'de_sub', 'Deutsche Untertitel', 'Englisch-Untertitel'],
    [2, 2, 'en', 'Englisch', 'Englisch'],
];

export interface LangObject {
    key: string | undefined;
    index: number;
}

export function sortByLanguageKeys(a: LangObject, b: LangObject): number {
    const { key: key1 } = a;
    const { key: key2 } = b;
    const rating = [0, 0];
    for (let i = 0; i < SeriesLanguagesLookup.length; i++) {
        const [key, pref] = SeriesLanguagesLookup[i];
        if (key1 === key.toString()) {
            rating[0] = pref;
        }
        if (key2 === key.toString()) {
            rating[1] = pref;
        }
    }

    return rating[0] - rating[1];
}

export function round(num: number, before?: number, after?: number): number {
    if (before === undefined && after === undefined) {
        return num;
    } else if (before !== undefined && after === undefined) {
        return Math.round(num / 10 ** before) * 10 ** before;
    } else if (before === undefined && after !== undefined) {
        const str = num.toString();
        let start = str.lastIndexOf('.');
        start = start === -1 ? (start = str.split('').length) : start;
        return parseFloat(`${str.substring(0, start)}.${str.substring(start + 1, start + 1 + after)}`);
    } else if (before !== undefined && after !== undefined) {
        const str = num.toString();
        let start = str.lastIndexOf('.');
        start = start === -1 ? (start = str.split('').length) : start;
        return parseFloat(`${(Math.round(parseInt(str.substring(0, start)) / 10 ** before) * 10 ** before).toString()}.${str.substring(start + 1, start + 1 + after)}`);
    } else {
        return 0;
    }
}

export function formatNumber(value: number, size: number, leading = '0'): string {
    const origSize = value.toString().length;
    if (origSize === size) {
        return value.toString();
    } else if (origSize < size) {
        return `${leading.repeat(size - origSize)}${value.toString()}`;
    } else {
        return value.toString().substring(origSize - size);
    }
}

export function setCookie(name: string, value: string, days: number): void {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

export function getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

export function eraseCookie(name: string): void {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export type FormatType = 'string' | 'number' | 'date';

export type FormatTypeMap = {
    string: string;
    number: number;
    date: Date;
};

export type AdditionalFormatOptions = {
    number: {
        dynamic?: boolean;
    };
    date: {
        format?: FormatCreateOption;
    };
    string: {
        //
    };
};

export type FormatDescriptorFunction<T extends FormatType> = (descriptor: string) => FormatTypeMap[T];

export type FormatOption<T extends FormatType> = {
    type: T;
    value: FormatTypeMap[T] | FormatDescriptorFunction<T>;
} & AdditionalFormatOptions[T];

export interface FormatOptions {
    [key: string]: FormatOption<'string'> | FormatOption<'number'> | FormatOption<'date'>;
}

export type DetailedFormatOptionMap<T> = T extends string ? FormatOption<'string'> : T extends number ? FormatOption<'number'> : T extends Date ? FormatOption<'date'> : never;

export type DetailedFormatOptions<C> = {
    [key: string]: DetailedFormatOptionMap<C[keyof C]>;
};

export interface FormatCreateOption {
    language?: 'browser' | string;
}

export function getFormatter(opt: FormatCreateOption): Intl.DateTimeFormat {
    const language = opt.language === undefined ? 'de-DE' : opt.language === 'browser' ? navigator.language : opt.language;

    return Intl.DateTimeFormat(language, {
        weekday: 'long',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
    });
}

export function formatString(input: string, options: FormatOptions): string {
    let output = input;

    const keys = Object.keys(options);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const opt = options[key];
        const { value, type } = opt;

        const isDynamic = type === 'number' ? opt.dynamic ?? false : false;

        if (key.length > 1 && isDynamic) {
            throw new Error(`Format Specifiers that are longer than one '${key} can't be dynamic!'`);
        }

        const regex = new RegExp(`(%${key.length === 1 ? `[${key}]${isDynamic ? '+' : '{1}'}` : key})`, 'g');
        output = output.replaceAll(regex, (match: string): string => {
            function resolve<T extends FormatType>(val: FormatTypeMap[T] | FormatDescriptorFunction<T>): FormatTypeMap[T] {
                if (typeof val === 'function') {
                    return val(match);
                }
                return val;
            }

            switch (type) {
                case 'string': {
                    return resolve(value);
                }
                case 'date': {
                    const { format } = opt;
                    const date = resolve(value);

                    const formatter = getFormatter(format ?? {});

                    return formatter.format(date);
                }
                case 'number': {
                    const { dynamic } = opt;
                    if (dynamic === undefined || dynamic === false) {
                        return resolve(value).toString();
                    }
                    const size = match.toString().length - 1; // % = -1
                    return formatNumber(resolve(value), size);
                }
                default:
                    throw new Error(`Unreachable in type switch: '${type as string}'!`);
            }
        });
    }

    return output;
}

// EXAMPLES:
/* "[\"time\":\"vor 2 Stunden\",\"title\":\"Superman & Lois S2 E6 ist auf Englisch-Untertitel online verfügbar.\"},
time\":\"vor 20 Stunden\",\"title\":\"Navy CIS S19 E13 ist auf Englisch-Untertitel online verfügbar.\"},
\"time\":\"vor 20 Stunden\",\"title\":\"NCIS: Hawaii S1 E14 ist auf Englisch-Untertitel online verfügbar.\"},
"time\":\"vor einem Tag\",\"title\":\"Die Simpsons S33 E9 ist auf Deutsch online verfügbar.\"},
{\"time\":\"vor 2 Tagen\",\"title\":\"Tatort S52 E8 ist auf Deutsch online verfügbar.\"}]" */
export function parseTime(input: string | number): ParsedTime {
    const regex = /^vor\s(einem|einer|\d{1,2})\s(stunde|stunden|tag|tagen|minute|minuten)$/i;
    const match = regex.exec(input.toString());
    if (!match) {
        console.error(`Couldn't parse time ${input}`);
        return 'error';
    }
    let amount: string | number = match[1];
    let type: string | number = match[2];

    const toCheck = isIntOrParsable(amount);
    if (toCheck === null) {
        const recognizedStringNumbers = [
            ['einem', 1],
            ['einer', 1],
        ];
        amount = recognizedStringNumbers.filter(([literal]: (string | number)[]): boolean => literal.toString() === amount.toString())[0][1];
        if (typeof amount !== 'number') {
            console.error(`Couldn't parse time: in number String: ${input}`);
            return 'error';
        }
    } else {
        amount = toCheck.toString();
    }

    const recognizedStringTypes = [
        ['Stunde', 60 * 60],
        ['Stunden', 60 * 60],
        ['Tag', 60 * 60 * 24],
        ['Tagen', 60 * 60 * 24],
        ['Minute', 60],
        ['Minuten', 60],
    ];
    type = recognizedStringTypes.filter(([literal]: (string | number)[]): boolean => literal.toString() === type.toString())[0][1];
    if (typeof type !== 'number') {
        console.error(`Couldn't parse time: in type String: ${input}`);
        return 'error';
    }

    return parseInt(amount.toString()) * parseInt(type.toString());
}

export type TitelType = 'home' | 'raw' | 'movie';

export function parseTitle(input: string, type: TitelType): ParsedTitle {
    if (type === 'home') {
        const regex = /^(.*)\ss(\d{1,4})\se(\d{1,4})\sist\sauf\s(deutsch|deutsch-untertitel|englisch-untertitel|englisch)\sonline\sverfügbar.$/i;
        const match = regex.exec(input);
        if (match === null) {
            console.error(`Couldn't parse title '${input}'`);
            return 'error';
        }
        const [, title, season, episode, languageData] = match;
        const language: ParsedLanguage = SeriesLanguagesLookup.filter(([, , , , name]) => {
            const searchName = Array.isArray(name) ? name : [name];
            return searchName.includes(languageData);
        }).map(([key, , short]) => ({ key, short }))[0];
        return { title, season, episode, language };
    } else if (type === 'raw') {
        const regex = /^staffel\s(\d{1,4})\sepisode\s(\d{1,4})$/i;
        const match = regex.exec(input);
        if (match === null) {
            console.error(`Couldn't parse title '${input}'`);
            return 'error';
        }
        const [, season, episode] = match;
        return { season, episode };
    } else {
        return 'error';
    } /*  else {
        return 'error';
    } */
}

/**
 *
 * @param {unknown} input
 * @returns number | null
 */
export function isIntOrParsable(input: string | number | undefined | null): number | null {
    if (typeof input === 'number') {
        return input;
    } else if (typeof input === 'string') {
        const number = parseInt(input);
        if (!isNaN(number)) {
            return number;
        }
    }
    return null;
}

export async function sleep(ms: number): Promise<void> {
    return await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @deprecated
 */
export function doAsyncAndHopeItSucceeds<T extends Array<unknown> = unknown[], A = unknown>(fn: (...args2: T) => Promise<A>, cb: ((res: A | null, error?: string | Error) => void) | undefined, ...args: T): void {
    fn(...args)
        .then(cb)
        .catch((err: ErrorOrString) => {
            if (cb !== undefined) {
                cb(null, err);
            }
        });
}

export enum TIME {
    sec = 1000,
    min = sec * 60,
    hour = min * 60,
    day = hour * 24,
    week = 7 * day,
    // approximations, not every month/year is fulfilled
    month = 30 * day,
    year = 365 * day,
}

export default {
    waitFor,
    addStyle,
    makeRequest,
    makeRequestAsync,
    pJson,
    extension,
    removeSpecialChars,
    sortByQuality,
    sortByLanguageKeys,
    formatString,
    formatNumber,
    round,
    sleep,
    SeriesLanguagesLookup,
    parseTime,
    parseTitle,
    isIntOrParsable,
};
export interface NormalObject<T = unknown> {
    [key: string]: T;
}

export type JSOnBaseTypes = number | string | null | undefined | boolean | Array<JSOnBaseTypes>;

export type JSONSerializable = JSOnBaseTypes | NormalObject<JSOnBaseTypes>;

export type ParsedTime = 'error' | number; // in Sekunden

export type ParsedTitle = 'error' | SeriesTitle | MovieTitle;

export interface SeriesTitle {
    title?: string;
    season: string;
    episode: string;
    language?: ParsedLanguage;
}

export interface MovieTitle {
    title: string;
    year: number;
}

export interface ParsedLanguage {
    key: number;
    short: string;
}

export type LanguageDefinition = [number, number, string, string, string | string[]];

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface GLOBAL_SETTINGS {
    QUERY_APPEND_TIME: boolean;
    LOG_SWALLOW: boolean;
}

export type ExtendedHttpResult<N extends NormalObject | null = NormalObject | null> = [result: GM_HttpResult, ok: boolean, body: N];


export interface IntervalOption {
    amount: number;
}

export type Or<T, A> = T | A;

export type PromiseOr<T> = Promise<T> | T;

export type OrNull<T> = null | T;

export type OrUndefined<T> = undefined | T;

export type ErrorOr<T> = Error | T;

export type ErrorOrString = ErrorOr<string>;

export type PromiseVoid = Promise<void>;

export type PossibleState = 'success' | 'error';

// don't use non Standard NodeJs.Timer etc. types, but here I have to!!!
// eslint-disable-next-line no-undef
export type Timer = NodeJS.Timer;

// eslint-disable-next-line no-undef
export type Timeout = NodeJS.Timeout;

// better Solution from here, after // my own Solution:
// https://stackoverflow.com/questions/51808160/keyof-inferring-string-number-when-key-is-only-a-string
export type StringKeyOf<T> = Extract<keyof T, string>; // keyof T extends string ? keyof T : never;
