/* global pictures */
var filters = document.querySelector('.filters');
if(filters){
	filters.classList.add('hidden');
}

var picturesContainer = document.querySelector('.pictures');
var templateElement = document.querySelector('template');
var elementToClone;

if('content' in templateElement){
	elementToClone = templateElement.content.querySelector('.picture');
} else{
	elementToClone = templateElement.querySelector('.picture');
}

/**
* @param {Object} data
* @param {HTMLElement} container
* return {HTMLElement}
*/
var getPictureElemet = function(data, container){
	var element = elementToClone.cloneNode(true);
	element.querySelector('.picture-comments').textContent = data.comments;
	element.querySelector('.picture-likes').textContent = data.likes;

	var picture = new Image();
	var pictureLoadTimeout;

	picture.onload = function(evt){
		clearTimeout(pictureLoadTimeout);
		element.querySelector('img').src = evt.target.src;
	};

	picture.onerror = function(){
		element.classList.add('picture-load-failure');
	}

	picture.src = data.url;

	var PICTURE_TIMEOUT = 10000;

	pictureLoadTimeout = setTimeout(function(){
		picture.src = '';
		element.classList.add('picture-load-failure');
	}, PICTURE_TIMEOUT);
	container.appendChild(element);
};

pictures.forEach(function(picture){
	getPictureElemet(picture, picturesContainer);
});

if(filters){
	filters.classList.remove('hidden');
}