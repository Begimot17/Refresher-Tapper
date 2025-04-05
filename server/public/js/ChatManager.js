class ChatManager {
  constructor(game) {
    this.game = game;
    this.messages = [];
    this.maxMessages = 50; // Maximum number of messages to keep
    this.loadMessages(); // Load messages when initialized
  }
  
  sendMessage(message) {
    // Check if message is empty or too long
    if (!message || message.trim() === '') {
      alert('Пожалуйста, введите текст сообщения!');
      return false;
    }
    
    if (message.length > 32) {
      alert('Сообщение слишком длинное! Максимальная длина - 32 символа.');
      return false;
    }
    
    // Check if user has enough diamonds
    if (this.game.diamonds < 10) {
      alert('Недостаточно алмазов! Нужно 10 алмазов для отправки сообщения.');
      return false;
    }

    // Create message object
    const messageObj = {
      username: this.game.username,
      text: message,
      timestamp: new Date().toISOString()
    };

    // Send to server first
    const success = this.sendToServer(messageObj);
    
    // Only deduct diamonds and update UI if server accepted the message
    if (success) {
      // Deduct diamonds
      this.game.diamonds -= 10;
      
      // Add message to local messages
      this.messages.push(messageObj);

      // Save to local storage
      this.saveMessages();

      // Update UI
      this.game.uiManager.updateUI();
    }

    // Update UI
    this.game.uiManager.updateUI();
    this.game.uiManager.updateSendButtonText();

    return success;
  }
  
  sendToServer(message) {
    const userId = Telegram.WebApp.initDataUnsafe.user?.id;
    const username = Telegram.WebApp.initDataUnsafe.user?.username || 'Гость';
    
    // Check if user has enough diamonds before sending
    console.log('Current diamonds before sending:', this.game.diamonds);
    if (this.game.diamonds < 10) {
      alert('Недостаточно алмазов! Нужно 10 алмазов для отправки сообщения.');
      return false;
    }
    
    $.ajax({
      url: '/api/chat/send',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        username,
        message: message.text
      }),
      success: (response) => {
        console.log('Сообщение успешно отправлено на сервер');
        console.log('Server response:', response);
        
        // Update diamonds count from server response
        if (response.diamonds !== undefined) {
          console.log('Updating diamonds from', this.game.diamonds, 'to', response.diamonds);
          this.game.diamonds = response.diamonds;
          this.game.uiManager.updateUI();
          
          // Save progress after updating diamonds
          this.game.progressManager.saveProgress();
        }
      },
      error: (error) => {
        console.error('Ошибка отправки сообщения на сервер:', error);
        console.error('Error details:', error.responseText);
        
        // If server returns 400, it means not enough diamonds
        if (error.status === 400) {
          alert('Недостаточно алмазов! Нужно 10 алмазов для отправки сообщения.');
        }
      }
    });
  };
  
  loadMessages() {
    $.ajax({
      url: '/api/chat/messages',
      method: 'GET',
      success: (messages) => {
        this.messages = messages.map(msg => ({
          text: msg.message || 'Пустое сообщение',
          timestamp: new Date(msg.timestamp),
          sender: msg.username || 'Гость'
        }));
        this.updateChatUI();
      },
      error: (error) => {
        console.error('Ошибка загрузки сообщений:', error);
      }
    });
  };
  
  updateChatUI() {
    const $chatMessages = $('#chat-messages');
    $chatMessages.empty();
    
    this.messages.forEach(message => {
      // Ensure message text is not undefined
      const messageText = message.text || 'Пустое сообщение';
      const messageHTML = `
        <div class="chat-message">
          <span class="chat-sender">${message.sender}:</span>
          <span class="chat-text">${messageText}</span>
        </div>
      `;
      $chatMessages.append(messageHTML);
    });
    
    // Scroll to the bottom
    $chatMessages.scrollTop($chatMessages[0].scrollHeight);
  };
} 