// window.addEventListener('DOMContentLoaded', async () => {
// function uploadFile(event){
//     // const fileInput = document.getElementById('myImage'); // получаем элемент input для загрузки файла
//     // const file = fileInput.files[0]; // получаем выбранный файл

//     // const xhr = new XMLHttpRequest(); // создаем объект XMLHttpRequest
//     // const formData = new FormData(); // создаем объект FormData для передачи файла

//     // formData.append('file', file); // добавляем файл в объект FormData

//     // xhr.open('POST', '/uploads'); // указываем метод и URL сервера, куда будет отправлен файл
//     // xhr.send(formData); // отправляем запрос на сервер с помощью метода send()


//     console.log('загрузка файла началась');
//     let target = event.target || event.srcElement || event.currentTarget;
//     let file = target.files[0];
//     let xhr = new XMLHttpRequest();
//     const formData = new FormData();
//     formData.append('file', file);
//     xhr.open('POST', '/uploads/' + file.name, true);
//     xhr.setRequestHeader('Content-Type', 'application/octate-stream');
//     xhr.onreadystatechange = function(){
//         event = null;
//         if (xhr.readyState === 4){
//             if (xhr.status === 200){
//                 callBackFunction(this.responseText);
//             }
//             else {
//                 console.log('ошибка');
//             }
//         }
//     }
//     xhr.send(formData);
//     event.target.value = '';
// };

// function callBackFunction(data){
//     console.log(data);
//     document.querySelector('#myImage').src = "uploads/" + data;
//     document.querySelector('input[name="myText"]').value = data;
// };

// document.querySelector('#submit').addEventListener('change', uploadFile);
// });

this.uploadFile =  function(index) {
    //baseClass это this
    var file = baseClass.allFiles[index];

    //Создаем объек FormData
    var data = new FormData();
    //Добавлем туда файл
    data.append('uploadFile', file.file);

    //отсылаем с попощью Ajax
    $.ajax({
        url: '/',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(response) {
            var message = file.element.find('td.message');
            if(response.status == 'ok') {
                message.html(response.text);
                file.element.find('button.submit').remove();
            }
            else {
                message.html(response.errors);
            }
        },
        xhr: function() {
            var xhr = $.ajaxSettings.xhr();

            if ( xhr.upload ) {
                console.log('xhr upload');

                xhr.upload.onprogress = function(e) {
                    file.progressDone = e.position || e.loaded;
                    file.progressTotal = e.totalSize || e.total;
                    //обновляем прогресс для файла
                    baseClass.updateFileProgress(index, file.progressDone, file.progressTotal, file.element);
                    //обновляем общий прогресс
                    baseClass.totalProgressUpdated();
                };
            }

            return xhr;
        }
    });
};