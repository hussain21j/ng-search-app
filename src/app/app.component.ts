import { Component } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { SearchService } from './services/search.service';
import { SearchResult } from './models/SearchResult';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SearchService]
})

/**
 * Application component
 * @author Tayab Hussain
 */

export class AppComponent {
  searchText: string = "";
  message: string = "";
  applicationName: string = "Search Application";
  isSearchInputScreen: boolean = true;
  isValidationOk: boolean = true;
  isConnected: boolean = false;
  isHistoryScreen: boolean = false;
  isSearchResultScreen: boolean = false;
  searchResultList: SearchResult[] = [] //declare this model
  errorMessage: string;
  searchService: SearchService;


  title = 'ng-search-app';

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

 
  
  /**
   * searches the book and media service
   * todo: validate it 
   */
  searchBookAndMedia(event) {
    console.log("search text:"+this.searchText);
    //claean the list of result 
    this.searchResultList = []; //clean the list
    if(this.validateInput()) {
      this.isSearchInputScreen = false;
      this.isSearchResultScreen = true;
      this.searchService.getSearchResult(this.searchText).subscribe(resp => {
        this.searchResultList = resp;
        
        //if list is empty 
        if(this.searchResultList.length==0) {
          this.errorMessage = "No Matching records found, Please go back and search again";
          this.isValidationOk = false;
        }
      }, error => {
        console.log("error in searchig reocrds")
        this.errorMessage = ":( Oops , something severe happened at the service layer.";
        this.isValidationOk = false;
      });
    }
  }

  /**
   * validates the search input screen
   */
  validateInput() {
    var validateStatus = true;
    if(this.searchText.trim().trim().length !=0) {
      validateStatus = true;
      this.isValidationOk = true;
    } else {
      validateStatus = false;
      this.isValidationOk = false;
      this.errorMessage = "Please fill the valid text to search";
    }
    return validateStatus;
  }


   /**
   * function called when back to search button is triggered
   */
  backToSearch() {
    this.isSearchInputScreen = true;
    this.isSearchResultScreen = false;
    this.isValidationOk = true;
    this.errorMessage="";
  }

}
