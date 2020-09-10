
/**
 * Class contains the common proerties
 * @author Tayab Hussain
 */
export class Config {
    /**
     * color codes for avtar
     */
    static colors: string[] = [
        '#2196F3', '#32c787', '#00BCD4', '#ff5652',
        '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
      ];
    
    /**
     * Web socket server URL
     */
    static serverWebSocketURL: string = "http://localhost:8080/ws";
    static apiBaseURL: string = "http://localhost:8080/searchservice/"
    static endPointChatHistory: string = "chat/history";
    static searchApiURL: string = "search?text=";

}

/**
 * Chat message class 
 */
export class ChatMessage {
    sender: string;
    content: string;
    type: string;
}