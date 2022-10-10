import { AMAGModule } from "../models";

export default class ApiService {
  rootUrls: {[key in AMAGModule]: string}
  constructor(
    idmApiRoot: string,
    cacApiRoot: string,
    vmsApiRoot: string,
    coreApiRoot: string,
    samaApiRoot: string
  ) {
    this.rootUrls = {
      [AMAGModule.CORE]: coreApiRoot,
      [AMAGModule.IDM]: idmApiRoot,
      [AMAGModule.CAC]: cacApiRoot,
      [AMAGModule.VMS]: vmsApiRoot,
      [AMAGModule.SAMA]: samaApiRoot
    }
  }

  get(module: AMAGModule, path: string) {
    const p = this.rootUrls[module] + path
    return fetch(p).then(resp => {
      if (!resp.ok) throw "error"
      return resp.json()
    })
  }

  post(module: AMAGModule, path: string) {
    const p = this.rootUrls[module] + path
    return fetch(p, {
      method: 'POST'
    }).then(resp => {
      if (!resp.ok) throw "error"
      return resp.json()
    })
  }
}