document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
  
    const formData = new FormData(this);
    const data = {
      Email_admin: formData.get('Email_admin'),
      Password_admin: formData.get('Password_admin')
    };
  
    fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        console.log(response);
        console.log(data);
        throw new Error('Network response was not ok');
      }
      response.status = 200;
      return response.json();
    })
    .then(data => {
      console.log("Ответ сервера:", data);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.id); 
      console.log('Tokens сохранены:', data.accessToken, data.refreshToken);
      window.location.href = '/views/allthemes.html';
    })
    .catch(error => {
      console.error('Проблема с извлечением данных:', error); 
    });  
});
  