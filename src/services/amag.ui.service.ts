import { AMAGModule } from "../models"
import ApiService from "./api.service"
import ConfigurationService from "./configuration.service"
import GlobalizationService from "./globalization.service"

const apiBase = `//${window.location.host}`

//development
const getUrlParamValue = (key: string) => {
  const search = window.location.search.slice(1)
  const hash = window.location.hash
  const qIdx = hash.indexOf("?")
  const hashSearch = qIdx != -1 ? hash.slice(qIdx + 1) : ""
  const paramMap = `${search}&${hashSearch}`.split("&").reduce((pMap, st) => {
    const parts = st.split("=")
    pMap[decodeURIComponent(parts[0])] = parts[1]
    return pMap
  }, {} as {[key: string]: string})
  return (paramMap[key]) ? decodeURIComponent(paramMap[key]) : null
}

const loadThemeStyles = () => {
  if (!data.themePath) return
  const ts = new Date().getTime() / 1000 | 1
  const l = document.createElement("link")
  l.type = "text/css"
  l.rel = "stylesheet"
  l.href = `${data.themePath}?${ts}`
  document.body.appendChild(l)
}

const configurationService = new ConfigurationService()
const globalizationService = new GlobalizationService()

const data = {
  cacApiRoot: `${apiBase}/AMAG.CAC.WebApi/api/`,
  vmsApiRoot: `${apiBase}/G4S.VMS.WebApi/api/`,
  idmApiRoot: `${apiBase}/G4S.IdentityManagement.WebApi/api/`,
  coreApiRoot: `${apiBase}/G4S.Core.WebApi/api/`,
  symmetryApiRoot: `${apiBase}/AMAG.Symmetry.WebApi/api/`,
  samaApiRoot: `${apiBase}/AMAG.SAMA.WebApi/api/`,
  activeLocale: getUrlParamValue("language"),
  cdnUrl: getUrlParamValue("cdnUrl"),
  globalizationCacheKey: getUrlParamValue("globalizationCacheKey"),
  themePath: getUrlParamValue("themePath")
}

const apiService = new ApiService(data.idmApiRoot, data.cacApiRoot, data.vmsApiRoot, data.coreApiRoot, data.samaApiRoot)

const Service = {
  init: (module: AMAGModule) => {
    return new Promise<void>((resolve) => {
      configurationService.getIDMConfiguration(data.idmApiRoot).subscribe(config => {
        if (!data.activeLocale) data.activeLocale = config.UserLanguage ?? "en-US"
        if (!data.cdnUrl) data.cdnUrl = config.CdnUrl
        globalizationService.init(data.cdnUrl, module, data.activeLocale).then(() => resolve())
      })
    })
  },

  getMessage: (key: string, params?: string[] | Object | string, formatter?: (str: string) => string) => {
    return globalizationService.getMessage(key, params, formatter)
  },

  getMessageOnly: (key: string, params?: string[] | Object | string, formatter?: (str: string) => string) => {
    return globalizationService.getMessage(key, params, formatter).message
  },


  get: (module: AMAGModule, path: string) => apiService.get(module, path),
  post: (module: AMAGModule, path: string) => apiService.post(module, path)

}

// load theme styles as soon as UIService is used
loadThemeStyles()

export default Service