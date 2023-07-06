/* eslint-disable @typescript-eslint/naming-convention */
// Modified and updated from https://github.com/s-tomo/violentmonkey-types

// for VM 2.13.0 - taken from docs: https://violentmonkey.github.io/api/gm/

// GM.* Greasemonkey v4-compatible aliases, note that here the "h" from xmlHttpRequest is BIG

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm)
 */

declare const GM: {
    info: typeof GM_info;
    getValue: typeof GM_getValue;
    setValue: typeof GM_setValue;
    deleteValue: typeof GM_deleteValue;
    listValues: typeof GM_listValues;
    /** GM.getResourceUrl has the camelCase "Url" not the All Uppercase "URL" */
    getResourceUrl: typeof GM_getResourceURL;
    addElement: typeof GM_addElement;
    addStyle: typeof GM_addStyle;
    openInTab: typeof GM_openInTab;
    registerMenuCommand: typeof GM_registerMenuCommand;
    unregisterMenuCommand: typeof GM_unregisterMenuCommand;
    notification: typeof GM_notification;
    setClipboard: typeof GM_setClipboard;
    xmlHttpRequest: typeof GM_xmlhttpRequest;
};

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_info)
 */

declare const GM_info: {
    uuid: string;
    script: {
        name: string;
        namespace: string;
        description: string;
        version: string;
        excludes: string[];
        includes: string[];
        matches: string[];
        resources: string[];
        runAt: 'document-end' | 'document-start' | 'document-idle';
        unwrap: boolean;
    };
    scriptHandler: 'Violentmonkey';
    version: string;
    scriptMetaStr: string;
    scriptWillUpdate: boolean;
    injectInto: 'page' | 'content' | 'auto';
    platform: {
        arch: 'arm' | 'mips' | 'mips64' | 'x86-32' | 'x86-64';
        browserName: string;
        browserVersion: string;
        os: 'android' | 'cros' | 'linux' | 'mac' | 'openbsd' | 'win';
    };
};

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_getvalue)
 */

declare function GM_getValue<T>(key: string, defaultValue: T): Promise<T>;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_setvalue)
 */

declare function GM_setValue<T = unknown>(key: string, value: T): Promise<void>;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_deletevalue)
 */

declare function GM_deleteValue(key: string): Promise<void>;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_listvalues)
 */

declare function GM_listValues(): Promise<string[]>;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_addvaluechangelistener)
 */

declare function GM_addValueChangeListener<T = unknown>(name: string, callback: GM_ValueChangeCallback<T>): string;

declare type GM_ValueChangeCallback<T> = (name: string, oldValue: T, newValue: T, remote: boolean) => void;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_removevaluechangelistener)
 */

declare function GM_removeValueChangeListener(listenerID: string): void;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_getresourcetext)
 */

declare function GM_getResourceText(name: string): string | undefined;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_getresourceurl)
 */

declare function GM_getResourceURL(name: string, isBlobUrl?: boolean): string;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_addelement)
 */

declare function GM_addElement<K extends keyof HTMLElementTagNameMap>(tagName: K, attributes?: GM_addElementAttributes<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];
// eslint-disable-next-line no-redeclare
declare function GM_addElement<K extends keyof HTMLElementTagNameMap>(parentNode: Node | Element | ShadowRoot, tagName: K, attributes?: GM_addElementAttributes<HTMLElementTagNameMap[K]>): HTMLElementTagNameMap[K];

// TODO better agnostic for all attributes and textContent, see docs for more information
declare type GM_addElementAttributes<E extends HTMLElement> = {
    [key in keyof E]: string | number;
};

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_addstyle)
 */

declare function GM_addStyle(css: string): { then(style: HTMLStyleElement): void } | Promise<HTMLStyleElement>;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_openintab)
 */

declare function GM_openInTab(url: string, options?: GM_openInTabOptions): GM_tab;
// eslint-disable-next-line no-redeclare
declare function GM_openInTab(url: string, openInBackground?: boolean): GM_tab;

interface GM_tab {
    close: () => void;
    closed: boolean;
    onclose: null | GM_callback;
}

declare interface GM_openInTabOptions {
    active?: boolean;
    /** firefox only */
    container?: number;
    insert?: boolean;
    pinned?: boolean;
}

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_registermenucommand)
 */

declare function GM_registerMenuCommand(caption: string, onClick: GM_registerMenuCommandCallback): void;

declare type GM_registerMenuCommandCallback = (event: MouseEvent | KeyboardEvent) => void;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_unregistermenucommand)
 */

declare function GM_unregisterMenuCommand(caption: string): void;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_notification)
 */

declare function GM_notification(options: { text: string; title?: string; image?: string; onclick?: GM_callback; ondone?: GM_callback }): void | GM_notification_response;
// eslint-disable-next-line no-redeclare
declare function GM_notification(text: string, title?: string, image?: string, onclick?: GM_callback): void | GM_notification_response;

declare interface GM_notification_response {
    remove: () => Promise<void>;
}

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_setclipboard)
 */

declare function GM_setClipboard(data: unknown, type?: GM_clipboardDataType): void;

declare type GM_clipboardDataType =
    | 'text/plain'
    | 'text/uri-list'
    | 'text/csv'
    | 'text/css'
    | 'text/html'
    | 'application/xhtml+xml'
    | 'image/png'
    | 'image/jpg, image/jpeg'
    | 'image/gif'
    | 'image/svg+xml'
    | 'application/xml, text/xml'
    | 'application/javascript'
    | 'application/json'
    | 'application/octet-stream';
/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_xmlhttprequest)
 */

declare function GM_xmlhttpRequest<K extends keyof GM_httpResponseType, C = unknown>(
    details: {
        url: string;
        method?: GM_httpMethod;
        user?: string;
        password?: string;
        overrideMimetype?: string;
        responseType?: K;
        data?: string | FormData | Blob;
        context?: C;
        anonymous?: boolean;
        binary?: boolean;
        //* * not supported, accoding to docs */
        // synchronous?: boolean;
        onabort?: (this: Window, event: GM_progressEvent<K, C>) => void;
        onload?: (this: Window, event: GM_progressEvent<K, C>) => void;
        onloadend?: (this: Window, event: GM_progressEvent<K, C>) => void;
        onreadystatechange?: (this: Window, event: GM_progressEvent<K, C>) => void;
        onloadstart?: (this: Window, event: GM_progressEvent<K, C>) => void;
    } & GM_httpRequestOptions<K, C>
): GM_httpResponse;

declare type GM_httpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTION' | 'HEAD';
declare interface GM_httpResponseType {
    text: string;
    json: object;
    blob: Blob;
    arraybuffer: ArrayBuffer;
    document: Document;
}
declare interface GM_progressEvent<K extends keyof GM_httpResponseType, C = unknown> {
    context?: C;
    finalUrl: string;
    readyState: 0 | 1 | 2 | 3 | 4;
    response: GM_httpResponseType[K] | null;
    responseHeaders: string;
    status: number;
    statusText: string;
}
declare interface GM_httpRequestOptions<K extends keyof GM_httpResponseType, C = unknown> {
    headers?: { [key: string]: string };
    timeout?: number;
    onerror?: (this: Window, event: GM_progressEvent<K, C>) => void;
    onprogress?: (
        this: Window,
        event: {
            lengthComputable: boolean;
            loaded: number;
            total: number;
        } & GM_progressEvent<K>
    ) => void;
    ontimeout?: (this: Window, event: GM_progressEvent<K, C>) => void;
}
declare interface GM_httpResponse {
    abort: () => void;
}

declare type GM_HttpResult = GM_progressEvent<keyof GM_httpResponseType, unknown>;

/**
 * [Documentation](https://violentmonkey.github.io/api/gm/#gm_download)
 */

declare function GM_download(
    options: {
        url: string;
        name?: string;
        onload?: GM_callback;
    } & GM_httpRequestOptions<'arraybuffer'>
): GM_httpResponse;
// eslint-disable-next-line no-redeclare
declare function GM_download(url: string, name?: string): GM_httpResponse;

/**
 * General Helper Types, used in multiple definitions
 */

declare type GM_callback = (this: Window) => void;
