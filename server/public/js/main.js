// Initialize the game when the document is ready
$(document).ready(function() {
  console.log('Document ready, initializing game...');
  
  try {
    // Create game instance
    const game = new Game();
    
    // Initialize the game
    game.init();
    
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Error initializing game:', error);
    // Показываем сообщение об ошибке пользователю
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = 'Произошла ошибка при инициализации игры. Пожалуйста, обновите страницу.';
      errorMessage.style.display = 'block';
    } else {
      alert('Произошла ошибка при инициализации игры. Пожалуйста, обновите страницу.');
    }
  }
}); 