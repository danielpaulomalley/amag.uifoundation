import { AMAGModule } from "../models"
import ApiService from "./api.service"
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
  if (!configData.themePath) return
  const ts = new Date().getTime() / 1000 | 1
  const l = document.createElement("link")
  l.type = "text/css"
  l.rel = "stylesheet"
  l.href = `${configData.themePath}?${ts}`
  document.body.appendChild(l)
}

const configData = {
  activeLocale: getUrlParamValue("language"),
  cdnUrl: getUrlParamValue("cdnUrl"),
  globalizationCacheKey: getUrlParamValue("globalizationCacheKey"),
  themePath: getUrlParamValue("themePath")
}

const apiRoots: {[key in AMAGModule]: string} = {
  [AMAGModule.CAC]: `${apiBase}/AMAG.CAC.WebApi/api/`,
  [AMAGModule.CORE]: `${apiBase}/G4S.Core.WebApi/api/`,
  [AMAGModule.IDM]: `${apiBase}/G4S.IdentityManagement.WebApi/api/`,
  [AMAGModule.SAMA]: `${apiBase}/Amag.SAMA.WebApi/api/`,
  [AMAGModule.SYMMETRY]: `${apiBase}/AMAG.Symmetry.WebApi/api/`,
  [AMAGModule.VMS]: `${apiBase}/G4S.VMS.WebApi/api/`
}

const globalizationService = new GlobalizationService()

const apiService = new ApiService(apiRoots)
let idmConfiguration: IDMConfiguration

const Service = {
  init: (module: AMAGModule) => {
    const url = apiRoots[AMAGModule.IDM] + "configuration"
    return fetch(url)
    .then(resp => resp.json())
    .then((c: IDMConfiguration) => {
      idmConfiguration = c
      if (!configData.activeLocale) configData.activeLocale = c.UserLanguage ?? "en-US"
      if (!configData.cdnUrl) configData.cdnUrl = c.CdnUrl
      return globalizationService.init(configData.cdnUrl, module, configData.activeLocale)
    })
    .then(() => true)
  },

  getIdmConfiguration: () => idmConfiguration,

  getMessage: (key: string, params?: string[] | Object | string, formatter?: (str: string) => string) => {
    return globalizationService.getMessage(key, params, formatter)
  },
  getMessageOnly: (key: string, params?: string[] | Object | string, formatter?: (str: string) => string) => {
    return globalizationService.getMessage(key, params, formatter).message
  },
  cldr: (key: string) => {
    return globalizationService.cldr(key).message
  },
  get: <T>(module: AMAGModule, path: string) => apiService.get<T>(module, path),
  post: <T>(module: AMAGModule, path: string, body = {}) => apiService.post<T>(module, path, body),
  put: <T>(module: AMAGModule, path: string, body = {}) => apiService.put<T>(module, path, body),
  delete: (module: AMAGModule, path: string) => apiService.delete(module, path)
}

// load theme styles as soon as UIService is used
loadThemeStyles()


export default Service


interface IDMConfiguration {
  AddressTypes: {Name: string, Value: string, IsLeftToRight: boolean}[]
  AllowImpersonation: boolean
  PhoneTypes: {Name: string, Value: string, IsLeftToRight: boolean}[]
  CdnUrl: string
  CustomThemeConfiguration: { ThemeFolderUri: string, FirstColor: string, SecondaryColor: string, ThirdColor: string }
  DefaultLanguage: string
  GroupId: string
  UseEmailAddressAsUserName: boolean
  UserLanguage: string
  UdfDefinitions: { Id: string, Name: string, Active: boolean, Type: string }[]
  EmployeeConfiguration: {
    UserDefinedFields?: {[key: string]: string}
  }
  EmployeeSecurityRoles: {Role: string, AllSecurables: boolean}[]
}