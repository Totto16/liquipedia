// ==UserScript==
// @name         liquipedia scripts
// @namespace    Totto
// @version      1.0.0_
// @description  General Downloader manager for some sites (including s.to, streamkiste.tv, OpenOLAT) and JDownloader. Release Time:
// @author       Totto
// @compatible   firefox
// @run-at       document-end
// @grant        GM.addStyle
// @grant        GM.xmlHttpRequest
// @grant        window.close
// @grant        window.focus
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.openInTab
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_setClipboard
// @grant        GM.registerMenuCommand
// @grant        GM.unregisterMenuCommand
// @grant        GM.notification
// @match        *://liquipedia.net/*
// @inject-into  page
// @downloadURL  http://127.0.0.1:3345/addons/downloader.user.js
// @updateURL    http://127.0.0.1:3345/addons/downloader.user.js
// ==/UserScript==

import { ignore, waitFor } from './common';

async function ready(callback: () => void | Promise<void>, fully = false) {
    // in case the document is already rendered
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        if (fully === true) {
            if (document.readyState === 'interactive') {
                waitFor(() => document.readyState === 'complete')
                    .then(callback)
                    .catch(ignore);
                return;
            }
        }
        await callback();
    }
    // modern browsers
    else if ((document as { addEventListener?: unknown }).addEventListener !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        document.addEventListener('DOMContentLoaded', async () => {
            await callback();
        });
    } else {
        // IE <= 8
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        (document as unknown as { attachEvent: (type: string, listener: () => void) => void }).attachEvent('onreadystatechange', async function () {
            if (document.readyState === 'complete') {
                await callback();
            }
        });
    }
}

type Places = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

type TeamPlace = Places | 'DNQ';

type PointsObject = {
    [key in Places]: number;
};

interface Tournament {
    name: string;
    points: PointsObject;
}

interface Team {
    name: string;
    places: TeamPlace[];
}

interface PGCSite {
    tournaments: Tournament[];
    teams: Team[];
}

function parsePGCSite(): PGCSite {
    const teamTable,
        tournamentTable = document.querySelectorAll('.wikitable');


        
}

function calculatePGCPoints(): void {
    try {
        const siteInfo = parsePGCSite();
    } catch (excecption) {
        console.error(excecption);
        console.log('Erro in parsing PGC site');
    }
}

function detectPage(): void {
    switch (location.pathname) {
        case '/pubg/PUBG_Global_Championship/2023/EMEA/Points':
            calculatePGCPoints();
            break;
        default:
            return;
    }
}

ready(async () => {
    detectPage();
});
