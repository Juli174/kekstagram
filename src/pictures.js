/* global pictures */

var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';
var DEFAULT_FILTER = 'filter-popular';

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

var getPictures = function(callback){
	var xhr = new XMLHttpRequest();

	if(xhr.readyState == 0){
		picturesContainer.classList.add('pictures-loading');
	}

	xhr.onload = function(evt){
		if(xhr.readyState == 4){
			picturesContainer.classList.remove('pictures-loading');
		}
		var loadedPictures = JSON.parse(evt.target.response);
		callback(loadedPictures);
	};

	xhr.onerror = function(){
		picturesContainer.classList.add('pictures-failure');
		picturesContainer.classList.remove('pictures-loading');
	};

	xhr.timeout = 10000;
	xhr.ontimeout = function(){
		picturesContainer.classList.add('pictures-failure');
		picturesContainer.classList.remove('pictures-loading');
	};

	xhr.open('GET', PICTURES_LOAD_URL);
	xhr.send();
};

var renderPictures = function(pictures){
	picturesContainer.innerHTML = '';

	pictures.forEach(function(picture){
		getPictureElemet(picture, picturesContainer);
	});
};

function compareDates(date1, date2){
	var dateArr1 = date1.split('-');
	var dateArr2 = date2.split('-');
	if(dateArr1[0] - dateArr2[0] == 0){
		if(dateArr1[1] - dateArr2[1] == 0){
			if(dateArr1[2] - dateArr2[2] == 0){
				return 0;
			} else if(dateArr1[2] - dateArr2[2] > 0){
				return 1;
			} else{
				return -1;
			}
		} else if(dateArr1[1] - dateArr2[1] > 0){
			return 1;
		} else {
			return -1;
		}
	} else if(dateArr1[0] - dateArr2[0] > 0){
		return 1;
	} else{
		return -1;
	}
}

var getFilteredPictures = function(pictures, filter){
	var picturesToFilter = pictures.slice(0);

	switch(filter){
		case 'filter-popular':
			break;
		case 'filter-new':
			picturesToFilter.sort(function(a, b){
				return compareDates(a, b);
			});
			break;
		case 'filter-discussed':
			picturesToFilter.sort(function(a, b){
				return a.comments - b.comments;
			});
			break;
	}

	return picturesToFilter;
};

var setFilterEnabled = function(filter){
	var filteredPictures = getFilteredPictures(pictures, filter);
	renderPictures(filteredPictures);
};

var setFiltrationEnabled = function(enabled){
	var filters = picturesContainer.querySelectorAll('.filters-radio');
	for(var i = 0; i < filters.length; i++){
		filters[i].onclick = enabled ? function(evt){
			setFilterEnabled(this.id);
		} : null;
	}
};

getPictures(function(loadedPictures){
	pictures = loadedPictures;
	setFiltrationEnabled(true);
	renderPictures(pictures);
});

if(filters){
	filters.classList.remove('hidden');
}