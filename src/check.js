function getMessage(a, b){
  if(typeof a === "boolean"){
    if(a){
      return "Переданное GIF-изображение анимировано и содержит " + b + " кадров";
    } else{
      return "Переданное GIF-изображение не анимировано";
    }
  }

  if(typeof a === "number"){
    var attrs = b * 4;
    return "Переданное SVG-изображение содержит "+ a + " объектов и " + attrs + " атрибутов"
  }

  if((a instanceof Array) && (b instanceof Array)){
    var square = 0;
    if(a.length != b.length){
      return "Ошибка данных!";
    } else{
      for(var i = 0; i < a.length; i++){
        square += a[i] * b[i];
      }
      return "Общая площадь артефактов сжатия: " + square + " пикселей";
    }
  }

  if(a instanceof Array){
    var sum = 0;
    for (var i = 0; i < a.length; i++){
      sum += a[i];
    }
    return "Количество красных точек во всех строчках изображения: " + sum;
  }
}

/*
* Write a program that prints the numbers from 1 to 100.
* But for multiples of three print “Fizz” instead of the number and for the multiples of five print “Buzz”.
* For numbers which are multiples of both three and five print “FizzBuzz”
*/

function append(value, tag){
  var element = document.createElement('div');
  element.innerHTML = value;
  tag.appendChild(element);
}

function fizzBuzz(){
  var div = document.createElement('div');
  document.body.appendChild(div);
  for (var i = 1; i <= 100; i++){
    if((i % 3 == 0) && (i % 5 == 0)){
      append("FizzBuzz", div);
    }
    if(i % 3 == 0){
      append("Fizz", div);
    }
    if(i % 5 == 0){
      append("Buzz", div);
    } else{
      append(i, div);
    }
  }
}
