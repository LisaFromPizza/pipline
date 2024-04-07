function togglePasswordVisibility() {
    const passwordField = document.getElementById("password");
    const showPasswordButton = document.getElementById("showPasswordButton");
    
    if (passwordField.type === "password") {
      passwordField.type = "text";
      showPasswordButton.textContent = "Скрыть пароль";
    } else {
      passwordField.type = "password";
      showPasswordButton.textContent = "Показать пароль";
    }
  }
  
  
  async function submitForm(event) {
    event.preventDefault();
  
    const form = document.getElementById('userForm');
    const formData = new FormData(form);
    const userData = {};
  
    for (let [key, value] of formData.entries()) {
      userData[key] = value;
    }
  
    // Проверка адреса электронной почты
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData['Email_admin'])) {
      alert('Некорректный адрес электронной почты');
      return;
    }
  
    // Проверка пароля по заданным ограничениям
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/;
    if (!passwordRegex.test(userData['Password_admin'])) {
      alert('Пароль должен содержать минимум одну заглавную и строчную букву, цифру, специальный символ и быть длиной от 8 до 20 символов');
      return;
    }
  

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        alert('Пользователь успешно добавлен');
  
      } else {
        throw new Error('Ошибка при добавлении пользователя');
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      alert('Произошла ошибка при добавлении пользователя');
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('userPostsTableBody');
    const userNameInput = document.getElementById('userName');
  
    let userData = []; // Сюда будем сохранять исходные данные
  
    // Получение и заполнение таблицы данными
    function fetchAndPopulateTable() {
      fetch('http://localhost:3000/userPosts')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          userData = data; // Сохраняем исходные данные
          populateTable(userData); // Заполняем таблицу исходными данными
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
    }
  
    fetchAndPopulateTable();
  
    // Функция для заполнения таблицы данными
    function populateTable(data) {
      tableBody.innerHTML = ''; // Очищаем таблицу перед добавлением данных
  
      if (data.length === 0) {
        const noDataMessage = document.createElement('tr');
        noDataMessage.innerHTML = `<td colspan="7">Нет данных</td>`;
        tableBody.appendChild(noDataMessage);
        return;
      }
  
      data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.Surname_admin}</td>
          <td>${user.Name_admin}</td>
          <td>${user.Middle_admin || '-'}</td>
          <td>${user.Email_admin}</td>
          <td style="word-break: break-word;">${user.Password_admin}</td>
          <td>${user.Post_name}</td>
          <td><button class="delete-btn" data-id="${user.ID_Administrator}">Удалить</button></td>
        `;
        tableBody.appendChild(row);
      });
  
      // Назначаем обработчик события клика для кнопок удаления
      tableBody.addEventListener('click', (event) => {
        const clickedElement = event.target;
        if (clickedElement.classList.contains('delete-btn')) {
          const userId = clickedElement.getAttribute('data-id');
          deleteUser(userId);
        }
      });
    }
  
    // Функция для удаления пользователя
    function deleteUser(userId) {
      const confirmDelete = confirm('Вы уверены, что хотите удалить этого пользователя?');
  
      if (confirmDelete) {
        fetch(`http://localhost:3000/userPosts/${userId}`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(() => {
            fetchAndPopulateTable(); // Обновляем данные после удаления пользователя
            alert('Пользователь успешно удален');
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      }
    }
  
    // Функция для фильтрации таблицы по ФИО пользователя
    userNameInput.addEventListener('input', () => {
      const searchValue = userNameInput.value.toLowerCase().trim();
  
      const filteredData = userData.filter(user => {
        const fullName = `${user.Surname_admin} ${user.Name_admin} ${user.Middle_admin || ''}`.toLowerCase();
        return fullName.includes(searchValue);
      });
  
      populateTable(filteredData); // Заполняем таблицу отфильтрованными данными
  
      if (filteredData.length === 0) {
        tableBody.innerHTML = ''; // Очищаем таблицу перед добавлением сообщения
        const noResultsMessage = document.createElement('tr');
        noResultsMessage.innerHTML = `<td colspan="6">Не найдено</td>`;
        tableBody.appendChild(noResultsMessage);
      }
    });
  });
  