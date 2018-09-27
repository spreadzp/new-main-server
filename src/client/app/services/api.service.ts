import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { catchError, retry } from 'rxjs/operators';
import { OrderBook } from '../shared/models/orderBook.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';
@Injectable()
export class ApiService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: Http, private authService: AuthService) { }

  get<T>(url: string): Observable<T> {
    return this.request(url, RequestMethod.Get);
  }

  getOrderBook() {

  }

  getT(url: string): Observable<any> {
    console.log('url :', this.baseUrl + url);
    return this.request(url, RequestMethod.Get);
  }

  post(url: string, body: Object): Observable<any> {
    console.log('url post:', url, body);
    return this.request(url, RequestMethod.Post, body);
  }

  put(url: string, body: Object): Observable<any> {
    return this.request(url, RequestMethod.Put, body);
  }

  delete(url: string, body: Object): Observable<any> {
    return this.request(url, RequestMethod.Delete, body);
  }

  requestPost(url: string, method: RequestMethod, body?: Object) {
    const uri = `${this.baseUrl}/${url}`;
    const headers = new Headers();
    headers.append('Content-type', 'application/json');
    // headers.append('Authorization', `Bearer ${this.authService.getToken()}`);
    const requestOptions = new RequestOptions({
      url: uri,
      headers: headers,
      method: method,
      body: body
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'my-auth-token'
      })
    };
    /* let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    let options = new RequestOptions({ headers: headers }); */

    /*  const headers: new HttpHeaders(
       'Authorization': 'Bearer mytoken',
         'Accept': 'application/json'
     ); */

    const reqPost = new Request(requestOptions);
    console.log('reqPost :', reqPost);
    return this.http.post(uri, body, requestOptions)
    .map((res: Response) => {
      if (method === 1) {
        console.log('res :', res);
      }
      return res.json();
    })
    .catch((error: Response) => this.onRequestError(error));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  request(url: string, method: RequestMethod, body?: Object): Observable<any> {
    const headers = new Headers();
    headers.append('Content-type', 'application/json');
    //headers.append('Authorization', `Bearer ${this.authService.getToken()}`);
    const requestOptions = new RequestOptions({
      url: `${this.baseUrl}/${url}`,
      headers: headers,
      method: method,
    });
    if (body) {
      requestOptions.body = body;
    }
    const reqGet = new Request(requestOptions);
    if (requestOptions.body) {
      console.log('requestOptions.body :', requestOptions.body);
      console.log('reqGet :', reqGet);
    }
    return this.http.request(reqGet)
      .map((res: Response) => {
        if (method === 1) {
          console.log('res :', res);
        }
        return res.json();
      })
      .catch((error: Response) => this.onRequestError(error));
  }

  onRequestError(err: Response): any {
    const statusCode = err.status;
    //const body = err.json();
    const error = {
      statusCode,
      err
    };

    return Observable.of(error);
  }
}
