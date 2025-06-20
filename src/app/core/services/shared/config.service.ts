import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: "root",
})
export class ConfigService {
  private baseUrl: string = environment.apiUrl;
  constructor() {}
  getBaseUrl(): any {
    return this.baseUrl;
  }
}
