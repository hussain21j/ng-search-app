import { Injectable } from '@angular/core';
import { Observable } from 'rxjs-compat';
import { HttpClient } from '@angular/common/http';
import { ChatHistory } from '../models/ChatHistory';
import { Config } from '../models/Config';
import { SearchResult } from '../models/SearchResult';

/**
 * Angular service to interect with the API
 * @author Tayab Hussain
 */

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private _http: HttpClient) { };

  /**
   * call the search api 
   */
  getSearchResult(name: string): Observable<SearchResult[]> {
    return this._http.get<SearchResult[]>(Config.apiBaseURL + Config.searchApiURL+name);
  }
}
