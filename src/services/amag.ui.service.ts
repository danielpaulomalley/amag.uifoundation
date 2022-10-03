let instance: AmagUIService | undefined
const apiBase = `//${window.location.host}`

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

class AmagUIService {
  private data = {
    cacApiRoot: `${apiBase}/AMAG.CAC.WebApi/api/`,
    vmsApiRoot: `${apiBase}/G4S.VMS.WebApi/api/`,
    idmApiRoot: `${apiBase}/G4S.IdentityManagement.WebApi/api/`,
    coreApiRoot: `${apiBase}/G4S.Core.WebApi/api/`,
    symmetryApiRoot: `${apiBase}/AMAG.Symmetry.WebApi/api/`,
    activeLocale: getUrlParamValue("language") ?? "en-US",
    cdnUrl: getUrlParamValue("cdnUrl"),
    globalizationCacheKey: getUrlParamValue("globalizationCacheKey"),
    themePath: getUrlParamValue("themePath")
  }


  constructor() {
    if (instance) throw new Error("AmagUIService Already Created")
    instance = this
    // automatically add style element to document body,
    // that way every root tsx element doesnt have to worry about it
    this.loadThemeStyles()
  }



  private loadThemeStyles() {
    if (!this.data.themePath) return
    const ts = new Date().getTime() / 1000 | 1
    const l = document.createElement("link")
    l.type = "text/css"
    l.rel = "stylesheet"
    l.href = `${this.data.themePath}?${ts}`
    document.body.appendChild(l)
  }



}

const configService = Object.freeze(new AmagUIService())
export default configService