(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIME = exports.SeriesLanguagesLookup = exports.GLOB = void 0;
exports.addStyle = addStyle;
exports.default = void 0;
exports.defaultValue = defaultValue;
exports.doAsyncAndHopeItSucceeds = doAsyncAndHopeItSucceeds;
exports.eraseCookie = eraseCookie;
exports.extension = extension;
exports.formatNumber = formatNumber;
exports.formatString = formatString;
exports.getCookie = getCookie;
exports.getFormatter = getFormatter;
exports.ignore = ignore;
exports.isIntOrParsable = isIntOrParsable;
exports.makeRequest = makeRequest;
exports.makeRequestAsync = makeRequestAsync;
exports.pJson = pJson;
exports.parseTime = parseTime;
exports.parseTitle = parseTitle;
exports.removeSpecialChars = removeSpecialChars;
exports.round = round;
exports.setCookie = setCookie;
exports.setIntervalAsync = setIntervalAsync;
exports.sleep = sleep;
exports.sortByLanguageKeys = sortByLanguageKeys;
exports.sortByQuality = sortByQuality;
exports.stringifyError = stringifyError;
exports.waitFor = waitFor;
function addStyle(css) {
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
}
function ignore(...args) {
  // just ignore
}
function defaultValue(val, _defaultValue) {
  if (val === undefined) {
    return _defaultValue;
  }
  return val;
}
function stringifyError(input) {
  const error = typeof input === 'string' ? input : typeof input.message === 'string' ? input.message : 'No Error message available!';
  return error;
}
function setIntervalAsync(callback, ms) {
  let currentlyInInterval = false;
  const _finished = () => {
    currentlyInInterval = false;
  };
  const ID = setInterval(() => {
    if (currentlyInInterval === true) {
      console.warn('In SetIntervalAsync: The Task took to long for a single Interval!');
      return;
    }
    callback().then(_finished).catch(_finished);
  }, ms);
  return ID;
}
async function waitFor(func, interval = 500, timeout = 30 * TIME.sec, options = {}) {
  if (typeof interval === 'object' && typeof timeout === 'object') {
    throw new Error('Only Timeout or Interval can have a amount defined!');
  }
  const _interval = typeof interval === 'number' ? interval : timeout / interval.amount;
  const _timeout = typeof timeout === 'number' ? timeout : _interval * timeout.amount;
  return new Promise(resolve => {
    const startTime = new Date().getTime();
    const returnPromise = async arg => {
      const now = new Date().getTime();
      if (options.minimalWaitTime !== undefined && startTime - now < options.minimalWaitTime) {
        await sleep(options.minimalWaitTime - (startTime - now));
        return resolve(arg);
      }
      return resolve(arg);
    };
    const tID = setTimeout(() => {
      clearInterval(ID);
      clearTimeout(tID);
      if (options.insteadOfError === undefined) {
        throw new Error(`Took to long${options.additionalMessage !== undefined ? `: ${options.additionalMessage}` : '!'}`);
      } else {
        return returnPromise(options.insteadOfError);
      }
    }, _timeout);
    const ID = setIntervalAsync(async () => {
      try {
        const result = await func();
        if (typeof result === 'boolean' ? result === true : result !== undefined && result !== null) {
          clearInterval(ID);
          clearTimeout(tID);
          return returnPromise(result);
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
const GLOB = {
  QUERY_APPEND_TIME: false,
  LOG_SWALLOW: true
};
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
exports.GLOB = GLOB;
function makeRequest(options, onerror, onsuccess) {
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
    options.query = Object.entries(options.query).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]);
  }
  if (!Array.isArray(options.query) && options.jdownloader === true) {
    //  {%22links%22:%22https://voeunblk.com/e/0cehjoghx9vo%22,%22packageName%22:%22Navy%20CIS%20s18e4%20[Deutsch]-PACKAGE%22}
    //  i =  {links:["https://voeunblk.com/e/0cehjoghx9vo"], packageName: "Navy CIS s18e4 [Deutsch]-PACKAGE"};
    const entries = Object.entries(options.query);
    for (const entry of entries) {
      const [key, value] = entry;
      if (Array.isArray(value)) {
        options.query[key] = value.join(';');
      }
    }
  }
  if (Array.isArray(options.query) && options.time === true) {
    options.query.push(['time', new Date().getTime().toString()]);
  }
  const queryString = Array.isArray(options.query) ? options.query.length > 0 ? options.query.map(array => {
    if (typeof array === 'string') {
      return array;
    } else {
      const [fst, sc] = array;
      if (sc.length === 0) {
        return fst;
      }
      return array.join('=');
    }
  }).join('&') : '' : JSON.stringify(options.query);
  if (!onerror) {
    onerror = (e, event) => {
      console.error(e, event);
    };
  }
  if (typeof options.data !== 'string' && options.contentType.startsWith('application/json')) {
    options.data = JSON.stringify(options.data);
  } else if (typeof options.data !== 'string' && options.contentType.startsWith('application/x-www-form-urlencoded')) {
    options.data = Object.keys(options.data).map(key => [key, options.data[key]]).map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&');
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
    onerror: event => {
      onerror?.(new Error(`${options.type} ${url} ${event.status} - ${event.statusText} - `), event);
    },
    onload(xhr) {
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
          const parsedBody = options.parseBody !== undefined && xhr.response !== null ? pJson(xhr.response.toString()) : null;
          // true instead of xhr.status >= 200 && xhr.status < 500 :)
          onsuccess?.(xhr, xhr.status >= 200 && xhr.status < 500, parsedBody);
        } else {
          console.error(xhr);
          //  onerror?.(new Error(`Server with host ${host} offline!`));
          onerror?.(new Error(`Server error: ${xhr.statusText}!`), xhr);
        }
      } catch (e) {
        onerror?.(e, xhr);
      }
    },
    ontimeout: event => {
      onerror?.(new Error(`Timeout reached after ${options.timeout ?? '?'} milliseconds!`), event);
    },
    headers: {
      'Content-Type': options.contentType
    }
  });
}
async function makeRequestAsync(options, logSilently = false) {
  return await new Promise((resolve, reject) => {
    makeRequest(options, (e, event) => {
      if (logSilently) {
        console.debug(event);
      }
      throw e;
    }, (result, resultOk, parsedBody) => {
      resolve([result, resultOk, parsedBody]);
    });
  });
}
function pJson(input, defaultValue = {}) {
  try {
    return JSON.parse(input);
  } catch (err) {
    return defaultValue;
  }
}
function extension(arg) {
  return arg.substring(arg.lastIndexOf('.') + 1);
}
function removeSpecialChars(input) {
  return input.replaceAll(/ {2}|[&/:=?]/g, '_');
}
function sortByQuality(a, b) {
  const {
    Video: v1,
    Audio: a1
  } = a;
  const {
    Video: v2,
    Audio: a2
  } = b;
  const videoRank = ['1080p', '720p', 'bd', 'dvd', 'cam'];
  const audioRank = ['ac3', 'dts', 'line', 'mic']; // dts and ac3 ?? is this right
  const rating = [[v1, a1], [v2, a2]].map(([c, d]) => {
    let r1 = videoRank.indexOf(c.toLowerCase());
    let r2 = audioRank.indexOf(d.toLowerCase());
    r1 = r1 === -1 ? videoRank.length : r1;
    r2 = r2 === -1 ? audioRank.length : r2;
    return r1 * 20 + r2;
  });
  return rating[0] - rating[1];
}
const SeriesLanguagesLookup = [
// key, Präferenz, Kürzel, ausgeschrieben, news name
[1, 0, 'de', 'Deutsch', ['Deutsch', 'Deutsch-Untertitel']], [3, 1, 'de_sub', 'Deutsche Untertitel', 'Englisch-Untertitel'], [2, 2, 'en', 'Englisch', 'Englisch']];
exports.SeriesLanguagesLookup = SeriesLanguagesLookup;
function sortByLanguageKeys(a, b) {
  const {
    key: key1
  } = a;
  const {
    key: key2
  } = b;
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
function round(num, before, after) {
  if (before === undefined && after === undefined) {
    return num;
  } else if (before !== undefined && after === undefined) {
    return Math.round(num / 10 ** before) * 10 ** before;
  } else if (before === undefined && after !== undefined) {
    const str = num.toString();
    let start = str.lastIndexOf('.');
    start = start === -1 ? start = str.split('').length : start;
    return parseFloat(`${str.substring(0, start)}.${str.substring(start + 1, start + 1 + after)}`);
  } else if (before !== undefined && after !== undefined) {
    const str = num.toString();
    let start = str.lastIndexOf('.');
    start = start === -1 ? start = str.split('').length : start;
    return parseFloat(`${(Math.round(parseInt(str.substring(0, start)) / 10 ** before) * 10 ** before).toString()}.${str.substring(start + 1, start + 1 + after)}`);
  } else {
    return 0;
  }
}
function formatNumber(value, size, leading = '0') {
  const origSize = value.toString().length;
  if (origSize === size) {
    return value.toString();
  } else if (origSize < size) {
    return `${leading.repeat(size - origSize)}${value.toString()}`;
  } else {
    return value.toString().substring(origSize - size);
  }
}
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
function getCookie(name) {
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
function eraseCookie(name) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
function getFormatter(opt) {
  const language = opt.language === undefined ? 'de-DE' : opt.language === 'browser' ? navigator.language : opt.language;
  return Intl.DateTimeFormat(language, {
    weekday: 'long',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}
function formatString(input, options) {
  let output = input;
  const keys = Object.keys(options);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const opt = options[key];
    const {
      value,
      type
    } = opt;
    const isDynamic = type === 'number' ? opt.dynamic ?? false : false;
    if (key.length > 1 && isDynamic) {
      throw new Error(`Format Specifiers that are longer than one '${key} can't be dynamic!'`);
    }
    const regex = new RegExp(`(%${key.length === 1 ? `[${key}]${isDynamic ? '+' : '{1}'}` : key})`, 'g');
    output = output.replaceAll(regex, match => {
      function resolve(val) {
        if (typeof val === 'function') {
          return val(match);
        }
        return val;
      }
      switch (type) {
        case 'string':
          {
            return resolve(value);
          }
        case 'date':
          {
            const {
              format
            } = opt;
            const date = resolve(value);
            const formatter = getFormatter(format ?? {});
            return formatter.format(date);
          }
        case 'number':
          {
            const {
              dynamic
            } = opt;
            if (dynamic === undefined || dynamic === false) {
              return resolve(value).toString();
            }
            const size = match.toString().length - 1; // % = -1
            return formatNumber(resolve(value), size);
          }
        default:
          throw new Error(`Unreachable in type switch: '${type}'!`);
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
function parseTime(input) {
  const regex = /^vor\s(einem|einer|\d{1,2})\s(stunde|stunden|tag|tagen|minute|minuten)$/i;
  const match = regex.exec(input.toString());
  if (!match) {
    console.error(`Couldn't parse time ${input}`);
    return 'error';
  }
  let amount = match[1];
  let type = match[2];
  const toCheck = isIntOrParsable(amount);
  if (toCheck === null) {
    const recognizedStringNumbers = [['einem', 1], ['einer', 1]];
    amount = recognizedStringNumbers.filter(([literal]) => literal.toString() === amount.toString())[0][1];
    if (typeof amount !== 'number') {
      console.error(`Couldn't parse time: in number String: ${input}`);
      return 'error';
    }
  } else {
    amount = toCheck.toString();
  }
  const recognizedStringTypes = [['Stunde', 60 * 60], ['Stunden', 60 * 60], ['Tag', 60 * 60 * 24], ['Tagen', 60 * 60 * 24], ['Minute', 60], ['Minuten', 60]];
  type = recognizedStringTypes.filter(([literal]) => literal.toString() === type.toString())[0][1];
  if (typeof type !== 'number') {
    console.error(`Couldn't parse time: in type String: ${input}`);
    return 'error';
  }
  return parseInt(amount.toString()) * parseInt(type.toString());
}
function parseTitle(input, type) {
  if (type === 'home') {
    const regex = /^(.*)\ss(\d{1,4})\se(\d{1,4})\sist\sauf\s(deutsch|deutsch-untertitel|englisch-untertitel|englisch)\sonline\sverfügbar.$/i;
    const match = regex.exec(input);
    if (match === null) {
      console.error(`Couldn't parse title '${input}'`);
      return 'error';
    }
    const [, title, season, episode, languageData] = match;
    const language = SeriesLanguagesLookup.filter(([,,,, name]) => {
      const searchName = Array.isArray(name) ? name : [name];
      return searchName.includes(languageData);
    }).map(([key,, short]) => ({
      key,
      short
    }))[0];
    return {
      title,
      season,
      episode,
      language
    };
  } else if (type === 'raw') {
    const regex = /^staffel\s(\d{1,4})\sepisode\s(\d{1,4})$/i;
    const match = regex.exec(input);
    if (match === null) {
      console.error(`Couldn't parse title '${input}'`);
      return 'error';
    }
    const [, season, episode] = match;
    return {
      season,
      episode
    };
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
function isIntOrParsable(input) {
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
async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * @deprecated
 */
function doAsyncAndHopeItSucceeds(fn, cb, ...args) {
  fn(...args).then(cb).catch(err => {
    if (cb !== undefined) {
      cb(null, err);
    }
  });
}
var TIME;
exports.TIME = TIME;
(function (TIME) {
  TIME[TIME["sec"] = 1000] = "sec";
  TIME[TIME["min"] = 60000] = "min";
  TIME[TIME["hour"] = 3600000] = "hour";
  TIME[TIME["day"] = 86400000] = "day";
  TIME[TIME["week"] = 604800000] = "week";
  // approximations, not every month/year is fulfilled
  TIME[TIME["month"] = 2592000000] = "month";
  TIME[TIME["year"] = 31536000000] = "year";
})(TIME || (exports.TIME = TIME = {}));
var _default = {
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
  isIntOrParsable
};
exports.default = _default;

},{}],2:[function(require,module,exports){
"use strict";

var _common = require("./common");
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

async function ready(callback, fully = false) {
  // in case the document is already rendered
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (fully === true) {
      if (document.readyState === 'interactive') {
        (0, _common.waitFor)(() => document.readyState === 'complete').then(callback).catch(_common.ignore);
        return;
      }
    }
    await callback();
  }
  // modern browsers
  else if (document.addEventListener !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.addEventListener('DOMContentLoaded', async () => {
      await callback();
    });
  } else {
    // IE <= 8
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.attachEvent('onreadystatechange', async function () {
      if (document.readyState === 'complete') {
        await callback();
      }
    });
  }
}
function parsePGCSite(alreadyPlayedTournaments) {
  const tables = document.querySelectorAll('.wikitable');
  if (tables.length !== 2) {
    throw new Error('table amount not correct, did the site change?');
  }
  const [teamTable, tournamentTable] = Array.from(tables);
  const tournamentRows = Array.from(tournamentTable.querySelectorAll('tr'));
  const tempTournaments = Array.from(tournamentRows[0].querySelectorAll('th'));
  tempTournaments.splice(0, 1);
  const partialTournaments = tempTournaments.map(element => ({
    name: element.textContent?.trim() ?? '',
    points: {}
  }));
  tournamentRows.splice(0, 1);
  for (let i = 0; i < tournamentRows.length; ++i) {
    const row = tournamentRows[i];
    const columns = row.querySelectorAll('td');
    const [_, ..._points] = Array.from(columns);
    for (let j = 0; j < _points.length; ++j) {
      const points = parseInt(_points[j]?.textContent?.trim() ?? '-1');
      const place = i + 1;
      partialTournaments[j].points[place] = points;
    }
  }
  const tournaments = partialTournaments;
  const teamRows = Array.from(teamTable.querySelectorAll('tr'));
  teamRows.splice(0, 1);
  const teams = [];
  for (const row of teamRows) {
    const columns = row.querySelectorAll('td');
    const [_place, _name, ..._tournaments] = Array.from(columns);
    const place = parseInt(_place.textContent?.trim() ?? '-1');
    const name = _name.textContent?.trim() ?? '';
    const _totalPoints = parseInt(_tournaments.at(-1)?.textContent?.trim() ?? '-1');
    let realTotalPoints = 0;
    for (let i = 0; i < alreadyPlayedTournaments; ++i) {
      const points = parseInt(_tournaments[i].textContent?.trim() ?? '-1');
      realTotalPoints += points;
    }
    const places = [];
    function getPlace(pointObject, points) {
      if (points === 0) {
        return -1;
      }
      for (const [key, value] of Object.entries(pointObject)) {
        if (value === points) {
          return parseInt(key);
        }
      }
      throw new Error(`Couldn't map placement points to place: ${points} Points`);
    }
    for (let i = 0; i < _tournaments.length - 1; ++i) {
      const pointsText = _tournaments[i].textContent?.trim() ?? 'DNQ';
      const teamPlace = pointsText === 'DNQ' ? 'DNQ' : getPlace(tournaments[i].points, parseInt(pointsText));
      places.push(teamPlace);
    }
    const localTeam = {
      name,
      places,
      points: realTotalPoints,
      place
    };
    teams.push(localTeam);
  }
  return {
    teams,
    tournaments
  };
}
function getPGCTeamByName(teams, name) {
  for (const team of teams) {
    if (team.name === name) {
      return team;
    }
  }
  throw new Error(`No team with name: ${name}`);
}
// keep in mind, that 16! = 20.922.789.888.000
function possibleArrangements(teams, points) {
  const result = [];
  function allPermutations(temp, limits, index) {
    if (index === temp.length) {
      //stop condition for the recursion [base clause]
      result.push(temp);
      return;
    }
    for (let i = 0; i <= limits[index]; ++i) {
      temp[index] = i;
      allPermutations(temp, limits, index + 1); //recursive invokation, for next elements
    }
  }

  const temp = new Array(teams.length).fill(undefined).map(_ => -1);
  const limits = new Array(teams.length).fill(undefined).map(_ => 16);
  allPermutations(temp, limits, 0);
  console.log(result);
  return result;
}
function generateCPP(tournament, teams) {
  const autogen = '// AUTO GENERATED BY TS (JS)';
  let insertIntoMap = '';
  for (const [key, value] of Object.entries(tournament.points)) {
    insertIntoMap += `\t\tpoints.insert_or_assign(${key}, ${value});\n`;
  }
  return `Tournament get_current_tournament(){

        ${autogen}
        
        
        PointsObject points = PointsObject{};

        ${insertIntoMap}

        std::string name = "${tournament.name}"; 

        Tournament tournament = {
            name,
            points
        };
        
        return tournament;
    
        ${autogen}
        
        }`;
}
function calculatePGCPoints(alreadyPlayedTournaments) {
  try {
    const siteInfo = parsePGCSite(alreadyPlayedTournaments);
    console.log(siteInfo);
    const qualifiedTeams = siteInfo.teams.filter(team => team.places[alreadyPlayedTournaments] !== 'DNQ');
    const activeTournament = siteInfo.tournaments[alreadyPlayedTournaments];
    // just to tests
    console.log(generateCPP(activeTournament, siteInfo.teams));
  } catch (exception) {
    console.error(exception);
    console.log('Error in parsing PGC site');
  }
}
function detectPage() {
  switch (location.pathname) {
    case '/pubg/PUBG_Global_Championship/2023/EMEA/Points':
      calculatePGCPoints(2);
      break;
    default:
      return;
  }
}
ready(async () => {
  detectPage();
});

},{"./common":1}]},{},[2]);
