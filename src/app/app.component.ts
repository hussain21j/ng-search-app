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
  name: string = "";
  message: string = "";
  applicationName: string = "Search Application";
  isUserNameScreen: boolean = true;
  isChatScreen: boolean = false;
  isValidationOk: boolean = true;
  isConnected: boolean = false;
  isHistoryScreen: boolean = false;
  isSearchResultScreen: boolean = false;
  chatHistoryList: ChatHistory[] = [];
  searchResultList: SearchResult[] = [] //declare this model
  errorMessage: string;
  searchService: SearchService;
  private stompClient;

  title = 'ng-chat-app';

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  initializeWebSocketConnection() {
    let ws = new SockJS(Config.serverWebSocketURL);
    this.stompClient = Stomp.over(ws);
    let that = this;
    this.stompClient.connect({}, function (frame) {
      that.isConnected = true;
      that.stompClient.subscribe('/topic/public', (payload) => {
        that.onMessageReceived(payload);
      });
      that.sendJoinMessage();
    });
  }

  public sendJoinMessage() {
    console.log("sending join message");
    let chatMessage = new ChatMessage;
    chatMessage.sender = this.name;
    chatMessage.content = '';
    chatMessage.type = 'JOIN';

    this.isUserNameScreen = false;
    this.isChatScreen = true;
    this.isHistoryScreen = false;
    this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
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
   * Send message to socket
   */
  sendMessage(event) {
    console.log("sending message :" + this.message);

    var messageContent = this.message.trim();
    if (messageContent && this.stompClient) {
      var chatMessage = new ChatMessage;
      chatMessage.sender = this.name;
      chatMessage.content = this.message;
      chatMessage.type = 'CHAT';
    }

    this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    //clear the message input
    this.message = "";
  }

  /**
   * get chat history
   */
  publishHistory(event) {
    console.log("fetching history");
    this.isChatScreen = false;
    this.isUserNameScreen = false;
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
    console.log("starting search");
    console.log("search text:"+this.name);
    this.isChatScreen = false;
    this.isUserNameScreen = false;
    this.isHistoryScreen = false;
    this.isSearchResultScreen = true;

    this.searchService.getSearchResult(this.name).subscribe(resp => {
      this.searchResultList = []; //clean the list
      this.searchResultList = resp;
    }, error => {
      this.errorMessage = "Error in fetching the history";
    });

  }



  /**
   * Login and initialize web socket
   */
  search(event) {
    console.log("text search: " + this.name);
    if (this.name.trim().length != 0) {
      this.initializeWebSocketConnection();
      this.isValidationOk = true;
    } else {
      this.isValidationOk = false;
    }
    this.isHistoryScreen=true;
  }

  /**
   * function called when back button on the chat history is triggered
   */
  backToChat() {
    this.isChatScreen = true;
    this.isHistoryScreen = false;
    this.isUserNameScreen = false;
  }

   /**
   * function called when back button on the chat history is triggered
   */
  backToSearch() {
    this.isChatScreen = false;
    this.isHistoryScreen = false;
    this.isUserNameScreen = true;
    this.isSearchResultScreen = false;
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
