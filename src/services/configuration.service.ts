import { Observable, Subject, of } from 'rxjs'
import { AMAGModule } from '../models'

interface IDMConfiguration {
  AddressTypes: {Name: string, Value: string, IsLeftToRight: boolean}[]
  AllowImpersonation: boolean
  CdnUrl: string
  CustomThemeConfiguration: { ThemeFolderUri: string, FirstColor: string, SecondaryColor: string, ThirdColor: string }
  DefaultLanguage: string
  GroupId: string
  UseEmailAddressAsUserName: boolean
  UserLanguage: string
}

export default class ConfigurationService {
  idmConfiguration: IDMConfiguration | undefined
  idmConfiguration$: Subject<IDMConfiguration> | undefined

  getIDMConfiguration(idmApiRoot: string) {
    if (this.idmConfiguration) return of(this.idmConfiguration)
    if (!this.idmConfiguration$) {
      this.idmConfiguration$ = new Subject<IDMConfiguration>()
      fetch(idmApiRoot + "configuration").then(resp => {
        if (!resp.ok) this.idmConfiguration$?.error("error getting configuration")
        else {
          resp.json().then(v => {
            this.idmConfiguration = v
            this.idmConfiguration$?.next(v)
            this.idmConfiguration$?.complete()
          })
        }
      })
    }
    return this.idmConfiguration$
  }
}