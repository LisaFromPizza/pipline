window.addEventListener('DOMContentLoaded', async () => {
    const notDataLabel = document.createElement('label');
    notDataLabel.textContent = 'Данные не найдены.';
    notDataLabel.style.color = 'black';
    notDataLabel.style.fontSize = '20px';
    notDataLabel.style.display = 'none';
    notDataLabel.id = 'notData';

    
  
    const themeInput = document.querySelector('input[placeholder="Поиск"]');
    if (themeInput) {
      themeInput.addEventListener('input', filterByThemeTitle);
    } else {
      console.error('Элемент не найден');
    }
    
    const cardsContainer = document.querySelector('.cards-container');
    const sortAscButton = document.getElementById('sortAscButton');
    const sortDescButton = document.getElementById('sortDescButton');
    const allCards = [];
    let visibleCards = [];

    function getType(type) {
      let typeInt;
      if(type == 'Дисциплина'){
        typeInt = 1;
      }
      else if(type == 'Вопрос'){
        typeInt = 2;
      }
      else if(type == 'Тема для обсуждения'){
        typeInt = 3;
      }
      return typeInt;
    }
    function filterByTheme() {
      const searchText = themeInput.value.toLowerCase().trim();
    }


    function filterByThemeTitle() {
      const searchText = themeInput.value.toLowerCase().trim();      
    
      let anyCardShown = false;
    
      allCards.forEach(card => {
        const themeName = card.querySelector('.theme-info h1').textContent.toLowerCase();
        const names = themeName.split(' ');
        const shouldShowCard = names.some(name => name.includes(searchText));

        card.style.display = shouldShowCard ? 'block' : 'none';

    
        if (shouldShowCard) {
          anyCardShown = true;
        }
      });
    
      visibleCards = allCards.filter(card => card.style.display !== 'none');
      showPage(1);
    
      toggleNoDataLabel(!anyCardShown);
    }

    function filterByThemeDesc() {
      const searchText = themeInput.value.toLowerCase().trim();      
    
      let anyCardShown = false;
    
      allCards.forEach(card => {
        const themeDesc = card.querySelector('.theme-info h3').textContent.toLowerCase();
        const descs = themeDesc.split(' ');
        const shouldShowCard = descs.some(desc => desc.includes(searchText));


        card.style.display = shouldShowCard ? 'block' : 'none';
    
        if (shouldShowCard) {
          anyCardShown = true;
        }
      });
    
      visibleCards = allCards.filter(card => card.style.display !== 'none');
      showPage(1);
    
      toggleNoDataLabel(!anyCardShown);
    }
    
    // Отображение/скрытие метки в зависимости от наличия карточек
    function toggleNoDataLabel(cardsFound) {
      notDataLabel.style.display = cardsFound ? 'none' : 'block';
    }
    
    function check_lng() {
      var regexp = /^[а-яё]+$/i;
      var text1 = document.querySelector('input').value;
          if(text1.match(regexp)) {
              alert("RUS");
          }
      }
  
    function sortThemesAsc() {
      visibleCards.sort((a, b) =>
      a.querySelector('.theme-info h2').textContent.localeCompare(b.querySelector('.theme-info h2').textContent)
      );
      showPage(1); // Показать отсортированные карточки на первой странице
    }
  
    function sortThemesDesc() {
      visibleCards.sort((a, b) =>
        b.querySelector('.theme-info h1').textContent.split(': ')[1] > a.querySelector('.theme-info h1').textContent.split(': '[1]) ? 1 : -1
      );
      showPage(1); //  отсортированные карточки на первой странице
    }
  
    function renderCards() {
      cardsContainer.innerHTML = '';
      visibleCards.forEach(card => {
        cardsContainer.appendChild(card);
      });
      toggleNoDataLabel();
    }
  
    function toggleNoDataLabel() {
      notDataLabel.style.display = visibleCards.length === 0 ? 'block' : 'none';
    }
  
    // Скрываем метку "Данные не найдены" при загрузке
    toggleNoDataLabel();
  
    // themeInput.addEventListener('input', filterByThemeTitle);
    themeInput.addEventListener('input', filterByThemeDesc);

  
    function handleDetailsClick(themeID, titleTheme) {
      window.location.href = `themedetails.html?id=${themeID}&titleTheme=${titleTheme}`;
    }

    // const addButton = document.getElementById('addButton');
    // addButton.addEventListener('click', upload);
    // function upload(){
    //   const response = fetch('http://localhost:3002');
    //   return response;
    // }
  
    try {
      const response = await fetch('http://localhost:3000/allthemes');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных о темах');
      }
  
      const themes = await response.json();
      themes.forEach(theme => {
        const card = document.createElement('div');
        card.classList.add('card');
      
        const themeInfo = document.createElement('div');
        themeInfo.classList.add('theme-info');
      
        const themeTitle = document.createElement('h1');
        themeTitle.textContent = `Тема: ${theme.Title_Theme}`;
      
        const themeDescription = document.createElement('h3');
        themeDescription.textContent = `Описание: ${theme.Description_Theme}`;
      
        const themeType = document.createElement('h4');
        if(theme.TypeTheme_ID == 1){
          themeType.textContent = `Тип: Дисциплина`;
        }
        else if(theme.TypeTheme_ID == 2){
          themeType.textContent = `Тип: Вопрос`;
        }
        else if(theme.TypeTheme_ID == 3){
          themeType.textContent = `Тип: Тема для обсуждения`;
        }
        
      
        themeInfo.appendChild(themeTitle);
        themeInfo.appendChild(themeDescription);
        themeInfo.appendChild(themeType);
      
        const detailsButton = document.createElement('button');
        detailsButton.classList.add('details-button');
        detailsButton.textContent = 'Подробнее';
        detailsButton.addEventListener('click', () => {
          const themeTitle = `${theme.Title_Theme}`;
          handleDetailsClick(theme.ID_Theme, themeTitle);
        });


      
        card.appendChild(themeInfo);
        card.appendChild(detailsButton);
      
        allCards.push(card);
      });
  
      visibleCards = [...allCards];
      renderCards();
      addPagination(1);
  
      if (visibleCards.length === 0) {
        cardsContainer.appendChild(notDataLabel);
        notDataLabel.style.display = 'block';
      }
    
      sortAscButton.addEventListener('click', sortThemesAsc);
      sortDescButton.addEventListener('click', sortThemesDesc);
    
      showPage(1); //  для отображения всех карточек после загрузки
    } catch (error) {
      console.error('Ошибка при получении данных о темах:', error);
      notDataLabel.style.display = 'block';
    }
  
    function showPage(pageNumber) {
      cardsContainer.innerHTML = '';
      const itemsPerPage = 3; // Устанавливаем максимальное количество карточек на одной странице
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageCards = visibleCards.slice(startIndex, endIndex);
  
      pageCards.forEach(card => {
        cardsContainer.appendChild(card);
      });
  
      addPagination(pageNumber);
    }
  
    function addPagination(currentPage) {
      const itemsPerPage = 3; // Устанавливаем максимальное количество карточек на одной странице
      const totalPages = Math.ceil(visibleCards.length / itemsPerPage);
      const pagination = document.querySelector('.pagination');
      pagination.innerHTML = '';
  
      for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
          showPage(i);
        });
  
        if (i === currentPage) {
          pageButton.classList.add('active');
        }
  
        pagination.appendChild(pageButton);
      }
    }
  
    document.getElementById('rating').addEventListener('change', filterByThemeTypeCategory);
  
    async function filterByThemeTypeCategory() {
      const selectedCategory = document.getElementById('rating').value;
      const cards = Array.from(allCards); //  копию всех карточек
    
      cards.forEach(card => {
        const themeTypeElement = card.querySelector('.theme-info h4');   //:nth-child(2)
        if (themeTypeElement) {
          const type = themeTypeElement.textContent.split(': ')[1];
          const typeGet = getType(type);
    
          if (selectedCategory == 1) { // Все
            card.style.display = 'block';
          } else if (selectedCategory == '2') { // Дисциплина
            if (typeGet == '1') {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          } else if (selectedCategory == '3') { // Вопрос
            if (typeGet == 2) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          } else if (selectedCategory == '4') { // Тема для обсуждения
            if (typeGet == 3) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          }
        }
      });
    
      // Обновляем visibleCards
      visibleCards = cards.filter(card => card.style.display !== 'none');
      showPage(1);
    }
    
  });
  
