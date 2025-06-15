import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ConfigService } from "../../shared/config.service";

@Injectable({
  providedIn: "root",
})
export class StageService {
  baseUrl = "";
  constructor(private http: HttpClient, private apiConfig: ConfigService) {
    this.baseUrl = apiConfig.getBaseUrl() + "/stage";
  }

  getItems(): Observable<any> {
    return this.http.get(this.baseUrl + "/items");
  }

  getAll(page: number, filter: any): Observable<any> {
    let params = new HttpParams();
    params = params.append("page", page.toString());
    return this.http.post(this.baseUrl + "/all", filter, { params: params });
  }

  createItemParameter(data: any): Observable<any> {
    return this.http.post(this.baseUrl + "/create", data);
  }

  //   updateItem(data: any): Observable<any> {
  //     return this.http.post(this.baseUrl + "/update", data);
  //   }
}
