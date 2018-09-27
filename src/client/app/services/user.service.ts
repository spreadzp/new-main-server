import { Response } from 'request';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class UserService {
  dataUser: any;
  constructor(private apiService: ApiService) { }

  getData<T>(url: string) {
    return this.apiService.get<T>(url);
  }

  private extractUserData(response: Response) {
    console.log('response :', response);
  }
  private handleError(error: any, caught: Observable<any>): any {
    let message = '';

    if (error instanceof Response) {
      const errorData = error.json() || JSON.stringify(error.json());
      message = `${error.status} - ${error.statusText || ''} ${errorData}`;
    } else {
      message = error.message ? error.message : error.toString();
    }
    console.error(message);
    return Observable.throw(message);
  }
  getStrigResponse(url: string) {
    return this.apiService.getT(url);
  }
  startTcp() {
    return this.apiService.getT('sever-tcp/start-server');
  }
  stopNewArbitrage() {
    return this.apiService.getT('sever-tcp/stop-arbitrage');
  }
  startArbitrage() {
    return this.apiService.getT('sever-tcp/start-arbitrage');
  }
  stopTcp() {
    return this.apiService.getT('sever-tcp/stop-server');
  }
  closeSecondCircle(url: string, body: any) {
    return this.apiService.post(url, body);
  }
}
