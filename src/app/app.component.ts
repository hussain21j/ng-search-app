import { Component } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { SearchService } from './services/search.service';
import { ChatHistory } from './models/ChatHistory';
import { SearchResult } from './models/SearchResult';
import { Config, ChatMessage } from './models/Config';

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
  isChatScreen: boolean = false;
  isValidationOk: boolean = true;
  isConnected: boolean = false;
  isHistoryScreen: boolean = false;
  isSearchResultScreen: boolean = false;
  chatHistoryList: ChatHistory[] = [];
  searchResultList: SearchResult[] = [] //declare this model
  errorMessage: string;
  searchService: SearchService;


  title = 'nng-search-app';

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

 
  /**
   * Extract details from the payload
   */
  public onMessageReceived(payload: any) {
    console.log("message received");
    let message = JSON.parse(payload.body);
    let messageElement = window.document.createElement('li');
    messageElement.style.lineHeight = '1.5rem';
    messageElement.style.padding = '5px 5px';
    messageElement.style.margin = '0';
    messageElement.style.borderBottom = '1px solid #f4f4f4';

    if (message.type === 'JOIN') {
      //style join message
      messageElement.style.width = '100%';
      messageElement.style.textAlign = 'center';
      messageElement.style.clear = 'both';
      messageElement.style.color = '#777';
      messageElement.style.fontSize = '14px';
      messageElement.style.wordWrap = 'break-word';
      message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
      message.content = message.sender + ' left!';
    } else {
      //style message element
      messageElement.style.paddingLeft = '68px';
      messageElement.style.position = 'relative';

      let avatarElement = window.document.createElement('i');
      //style avtar
      avatarElement = this.styeElementAvtar(avatarElement);

      let avatarText = window.document.createTextNode(message.sender[0]);
      avatarElement.appendChild(avatarText);
      avatarElement.style.backgroundColor = this.getAvatarColor(message.sender);
      messageElement.appendChild(avatarElement);

      let usernameElement = window.document.createElement('span');
      usernameElement.style.color = '#333';
      usernameElement.style.fontWeight = '600';

      let usernameText = window.document.createTextNode(message.sender);
      usernameElement.appendChild(usernameText);
      messageElement.appendChild(usernameElement);

    }

    let textElement = window.document.createElement('p');
    let messageText = window.document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    let messageArea: HTMLElement = window.document.getElementById("messageArea");
    messageArea.appendChild(messageElement);

  }

  getAvatarColor(messageSender) {
    let hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % Config.colors.length);
    return Config.colors[index];
  }


  /**
   * get chat history
   */
  publishHistory(event) {
    console.log("fetching history");
    this.isChatScreen = false;
    this.isSearchInputScreen = false;
    this.isHistoryScreen = true;

    this.searchService.getChatHistory().subscribe(resp => {
      this.chatHistoryList = []; //clean the list
      this.chatHistoryList = resp;
    }, error => {
      this.errorMessage = "Error in fetching the history";
    });

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
   * function called when back button on the chat history is triggered
   */
  backToSearch() {
    this.isSearchInputScreen = true;
    this.isSearchResultScreen = false;
    this.isValidationOk = true;
    this.errorMessage="";
  }

/**
 * Styling for avtar element
 */
  styeElementAvtar(avatarElement) {
    avatarElement.style.position = 'absolute';
    avatarElement.style.width = '42px';
    avatarElement.style.height = '42px';
    avatarElement.style.overflow = 'hidden';
    avatarElement.style.left = '10px';
    avatarElement.style.display = 'inline-block';
    avatarElement.style.verticalAlign = 'middle';
    avatarElement.style.fontSize = '18px';
    avatarElement.style.lineHeight = '42px';
    avatarElement.style.color = '#fff';
    avatarElement.style.textAlign = 'center';
    avatarElement.style.borderRadius = '50%';
    avatarElement.style.fontStyle = 'normal';
    avatarElement.style.textTransform = 'uppercase';

    return avatarElement;
  }



}
