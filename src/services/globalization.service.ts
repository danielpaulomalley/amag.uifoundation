import Globalize from 'globalize'
import capitalize from "lodash.capitalize";
import { AMAGModule } from '../models';

const REQUIRED_SUPPLEMENTAL = ["likelySubtags", "plurals", "timeData", "weekData"];
const REQUIRED_MAIN = ["ca-gregorian", "dateFields", "numbers", "units"];

const GLOBALIZATION_URI = "/globalization/";
const CLDRDATA_URI = GLOBALIZATION_URI + "cldr-data/";

const MAIN_JSON = CLDRDATA_URI + "main.json";
const MAIN_PATH = CLDRDATA_URI + "main/";

const SUPPLEMENTAL_JSON = CLDRDATA_URI + "supplemental.json";
const SUPPLEMENTAL_PATH = CLDRDATA_URI + "supplemental/";

const TIMEZONE_JSON = CLDRDATA_URI + "iana-tz-data.json";
const LOCALES_JSON = CLDRDATA_URI + "locales.json";

const DEFAULT_MAIN_LOCALE = "en";
const DEFAULT_MESSAGES_LOCALE = "en-US";

const UICORE_GLOBALIZATION = "/globalization/lib/uicore/"
const JSON_URLS: {[key in AMAGModule]: string} = {
  [AMAGModule.CORE]: "", // no ui
  [AMAGModule.IDM]: "/globalization/idm/ui/",
  [AMAGModule.CAC]: "/globalization/cac/ui/",
  [AMAGModule.VMS]: "/globalization/vms/ui/",
  [AMAGModule.SAMA]: "/globalization/sama/ui/",
  [AMAGModule.SYMMETRY]: ""
}


interface AMAGGlobalizer {
  getMessage: (key: string, params?: string | Object | string[], formatter?: (str: string) => string | string) => { message: string, error: string | null},
  getMessageOnly: (key: string, params?: string | Object | string[], formatter?: (str: string) => string | string) => string
  cldr: (key: string) => string
  getMessageOrDefault: (key: string, defaultValue: string, params?: string | Object | string[], formatter?: (str: string) => string | string) => string
  getRawMessage: (key: string) => any // 3rd party globalizer returns any, no way around this one
  hasParameters: (key: string) => boolean
}

const Formatters: {[key: string]: (v: string) => string} = {
  capitalize: (value: string) => capitalize(value),
  capitalizeAll: (value: string) => value.split(/\s/g).map(str => capitalize(str)).join(" ")
}

export default class GlobalizationService {
  globalizer: Globalize | undefined
  amagGlobalizer: AMAGGlobalizer | undefined

  constructor(
  ) { }

  init(cdnUrl: string, module: AMAGModule, locale: string) {
    let mainLocale = DEFAULT_MAIN_LOCALE
    return this._getAvailableMainLocales(cdnUrl)
      .then(mainLocales => {
        // try the full locale (ex: en-US)
        // if not avail, try to fallback to language code (ex: en)
        // otherwise fallback to DEFAULT_MAIN_LOCALE
        if (mainLocales.indexOf(locale) != -1) mainLocale = locale
        else if (locale.indexOf("-") != -1) {
          const chk = locale.split("-")[0]
          if (mainLocales.indexOf(chk) != -1) mainLocale = chk
        }
        return Promise.all([this._fetchSupplemental(cdnUrl), this._fetchMain(cdnUrl, mainLocale)])
      })
      .then(([suppJsons, mainJsons]) => {
        Globalize.load([...suppJsons, ...mainJsons])
        Globalize.locale(mainLocale)
        const url = `${cdnUrl}${JSON_URLS[module]}${locale}.json`
        const coreUi = `${cdnUrl}${UICORE_GLOBALIZATION}${locale}.json`
        return Promise.all([this._fetchJSON(url), this._fetchJSON(coreUi)])
      })
      .then(resp => {
        const messages = {} as {[locale: string]: Object}
        messages[mainLocale] = {...resp[0], ...resp[1]}
        Globalize.loadMessages(messages)
        this.globalizer = Globalize(mainLocale)
        return true
      })
  }

  getMessage(key: string, params?: string[] | Object | string, formatter?: (str: string) => string) {
    if (!this.globalizer) return { message: key, error: "globalizer has not been initialized" }
    const val = key.toLowerCase();
    let retVal = key;
    try {
      retVal = this.globalizer.messageFormatter(val)((params = params ? params : {}))
    } catch(err: unknown) {
      console.log(err)
    }
    return {
      message: retVal,
      error: null
    }
  }

  cldr(key: string) {
    if (!this.globalizer) return {message: key, error: "globalizer has not been initialized"}
    let retVal = key
    try {
      retVal = this.globalizer.cldr.main(key)
    } catch (err: unknown) {
      console.log(err)
    }
    return {
      message: retVal,
      error: null
    }
  }


  private _fetchSupplemental(cdnUrl: string): Promise<Object[]> {
    const url = cdnUrl + SUPPLEMENTAL_JSON
    return this._fetchJSON(url)
      .then(resp => {
        let sups = JSON.parse(resp) as string[] // [aliases.json, calendarData.json, ...]
        sups = this._pluckValues(sups, REQUIRED_SUPPLEMENTAL)
        return Promise.all(sups.map(s => this._fetchJSON(cdnUrl + SUPPLEMENTAL_PATH + s)))
      })
  }

  private _fetchMain(cdnUrl: string, locale: string): Promise<Object[]> {
    const url = cdnUrl + MAIN_JSON
    return this._fetchJSON(url)
      .then(resp => {
        let mains = JSON.parse(resp) as string[] // ["ca-buddhist.json", "ca-chinese.json", ...]
        mains = this._pluckValues(mains, REQUIRED_MAIN)
        return Promise.all(mains.map(m => this._fetchJSON(`${cdnUrl}${MAIN_PATH}${locale}/${m}`)))
      })
  }

  /** intersects from all */
  private _pluckValues(all: string[], take: string[]) {
    return take.length > 0
      ? all.reduce((acc, crtValue) => {
          //crtValue has this format: filename.json
          if (take.includes(crtValue.split(".")[0]))
            acc.push(crtValue);
          return acc;
        }, [] as string[])
      : [...all];
  }

  /** Returns available locales for cldr-data/main */
  private _getAvailableMainLocales(cdnUrl: string) {
    const url = cdnUrl + LOCALES_JSON
    return this._fetchJSON(url)
      .then((resp: string) => JSON.parse(resp) as string[])
  }

  private _fetchJSON(url: string) {
    const ts = Date.now()
    return fetch(`${url}?${ts}`, { method: "GET", mode: "cors"})
      .then(resp => {
        if (!resp.ok) throw new Error("error fetching globalization data")
        return resp.json()
      })
  }
}