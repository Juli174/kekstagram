/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  var cookies = require('browser-cookies');
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  var resizeX = document.querySelector('#resize-x');
  var resizeY = document.querySelector('#resize-y');
  var resizeSide = document.querySelector('#resize-size');
  var resizeFwd = document.querySelector('#resize-fwd');

  resizeX.value = 105;
  resizeY.value = 40;
  resizeSide.value = 240;

  /**
  * Проверяет валидность введенного значения, значение - длина
  * @param {HTMLInputElement} element
  * @return {boolean}
  */
  function validValue(element){
    var value = element.value;
    if(!value || value < 0){
      return false;
    } 
    return true;
  }


  /**
  * Добавляет resizeFwd атрибут disabled
  */

  function setDisabled(){
    var current = resizeFwd.hasAttribute('disabled');
    if(!current){
      resizeFwd.setAttribute('disabled', 'disabled');
      for(var i = 0; i < resizeFwd.classList.length; i++){
        if(resizeFwd.classList[i] == 'disabled'){
          return;
        }
      }
      resizeFwd.classList.add('disabled');
    }
  }

  /**
  * Удаляет у resizeFwd атрибут disabled
  */

  function removeDisabled(){
    var current = resizeFwd.hasAttribute('disabled');
    if(current){
      resizeFwd.removeAttribute('disabled');
      resizeFwd.classList.remove('disabled');
    }
  }

  resizeX.onchange = function(){
    resizeFormIsValid();
  };

  resizeY.onchange = function(){
    resizeFormIsValid();
  };

  resizeSide.onchange = function(){
    resizeFormIsValid();
  };

  /**
  * Проверяет валидность первых двух условий
  * @param {HTMLInputElement} element
  * @param {Ыекштп} size
  * @return {boolean}
  */

  function validResize(element, size){
    if(parseInt(element.value) + parseInt(resizeSide.value) <= size){
      return true;
    } 
    return false;
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   */
  function resizeFormIsValid() {
    if(!validValue(resizeSide)){
      setDisabled();
    } else if(validResize(resizeX, currentResizer._image.naturalWidth) && validResize(resizeY, currentResizer._image.naturalHeight) && validValue(resizeX) && validValue(resizeY)){
      removeDisabled();
      return true;
    } else{
      setDisabled();
    }
  }

  /**
  * cookies
  */
  var filterNone = document.querySelector('#upload-filter-none');
  var filterChrome = document.querySelector('#upload-filter-chrome');
  var filterSepia = document.querySelector('#upload-filter-sepia');

  filterNone.onclick = function(){
    setCookie('none');
  };

  filterChrome.onclick = function(){
    setCookie('chrome');
  };

  filterSepia.onclick = function(){
    setCookie('sepia');
  };

  function getExpirationDate(){
    var today = new Date();
    var day = '-08-09';
    var thisYear = new Date(today.getFullYear() + day);
    var current;
    if(thisYear.valueOf() - today.valueOf() <= 0){
      var lastYear = new Date((today.getFullYear() - 1) + day).valueOf();
      current = new Date(lastYear).toUTCString();
    } else{
      current = new Date(thisYear).toUTCString();
    }
    return current;
  }

  function setCookie(name){
    cookies.set('filter', name, {expires: getExpirationDate()});
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  };

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      var filters = ['none', 'chrome', 'sepia'];

      resizeForm.classList.add('invisible');
      var filterValue = cookies.get('filter');
      var exist = filters.some(function(element){
        return element == filterValue;
      });
      var id;
      if(!exist) {
        id = document.querySelector('.upload-filter-controls > input:checked').id;
      } else{
        id = 'upload-filter-' + filterValue
      }
      document.getElementById(id).checked = true;
      filterImage.className = 'filter-image-preview filter-' + filterValue;
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  };

  cleanupResizer();
  updateBackground();
})();
