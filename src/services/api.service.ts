import { AMAGModule } from "../models";

export default class ApiService {
  _rootUrls: {[key in AMAGModule]: string}
  constructor(
    rootUrls: {[key in AMAGModule]: string}
  ) {
    this._rootUrls = rootUrls
  }

  get<T>(module: AMAGModule, path: string): Promise<T> {
    const p = this._rootUrls[module] + path
    return fetch(p).then(resp => {
      if (!resp.ok) throw "error"
      return resp.json()
    })
  }

  post<T>(module: AMAGModule, path: string, body: object = {}): Promise<T> {
    const p = this._rootUrls[module] + path
    return fetch(p, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(resp => {
      if (!resp.ok) {
        throw resp
      }
      return resp.json()
    }).catch((e: any) => {
      return e.json()
    })
  }

  put<T>(module: AMAGModule, path: string, body: object = {}): Promise<T> {
    const p = this._rootUrls[module] + path
    return fetch(p, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(resp => {
      if (!resp.ok) {
        return resp.json().then(r => {
          throw r.ResponseStatus.Message
        })
      }
      return resp.json()
    }).catch(() => null)
  }

  delete(module: AMAGModule, path: string): Promise<boolean> {
    const p = this._rootUrls[module] + path
    return fetch(p, {
      method: 'DELETE'
    }).then(resp => {
      if (!resp.ok) throw resp
      return true
    }).catch(() => false)
  }

}