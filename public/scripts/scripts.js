/*
scripts.js
Sira Nassoko
January 24, 2020
1. I know that I technically hard coded the villain descriptions, but I was really having a lot of trouble with accessing the right description given the villain chosen from the drop down. I think this is because I was trying to edit the innerHTML of the <p> tag, but unlike the <img> tag it is not predicated on just one variable, because it is a string of text. I tried to add the description to the end of the respective villains line in the villains.csv file, but ultimately I was having trouble accessing this from the scripts file.
*/

var villainDesc = [
  "Bones has risen from the dead to reclaim his title as PRS champion.","Comic Hans is ready to show off some serious handywork.","Gato's strategy is unparalleled.","Harry Potter's lesser known alter ego is a PRS fanatic.","Manny has come to defeat you in style.","Mickey sports gloves so his hands don't get soiled by your tears. When you lose.","Simple but effective, Mr. Modern doesn't hold back when it comes to PRS.","Pixie will paint your road to failure.","Regal has got nothing to lose, for he has already won.","Spock has come to rep the Enterprise.","The Boss wishes you luck, because you'll need it.","You won't even see The Magician win, he'll already be gone."
]
console.log("test");

///////////////////Event Listions//////////////////
document.getElementById("player_weapon").addEventListener("change", function(){
  console.log("player weapon working");

});

document.getElementById("player_weapon").addEventListener("change", function(){
  var image = document.getElementById("user_image");
  var select = document.getElementsByTagName('select')[0];

  image.src = "/images/user_" + select.value + ".png";
  console.log('set src to ' + select.value);
});


document.getElementById("villain_dropdown").addEventListener("change", function(){
  console.log("villain image working");
  var image = document.getElementById("villain_image");
  var select = document.getElementsByTagName('select')[1];
  var villainText = document.getElementById("villain_description").innerHTML.toString();

  console.log("Villain Description is" + villainText);
  console.log(select.value);

  if (select.value == "Mr. Modern") {
    image.src = "/images/mr_modern_waiting.svg";
      document.getElementById("villain_description").innerHTML = villainDesc[6];

  }

  else if (select.value == "Comic Hans") {
    image.src = "/images/comic_hans_waiting.svg";
      document.getElementById("villain_description").innerHTML = villainDesc[1];


  }

  else if (select.value == "The Boss") {
    image.src = "/images/the_boss_waiting.svg";
      document.getElementById("villain_description").innerHTML = villainDesc[10];

  }

  else if (select.value == "The Magician") {
    image.src = "/images/the_magician_waiting.svg";
      document.getElementById("villain_description").innerHTML = villainDesc[11];


  }

  else {
  image.src = "/images/" + select.value + "_waiting.svg";
  console.log('set src to ' + select.value);
  for (i=0;i < villainDesc.length; i++) {
    if (villainDesc[i].includes(select.value)) {
      document.getElementById("villain_description").innerHTML = villainDesc[i];
    }
  }
}

});


///////////////////Helper function//////////////////
function updateNames(name){
  var name_spots=document.getElementsByClassName("player_name_span");
  for(var i=0; i<name_spots.length;i++){
    console.log(name_spots[i]);
    name_spots[i].innerHTML = name;
  }
}
