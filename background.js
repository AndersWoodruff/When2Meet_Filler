import ICALParser from 'ical-js-parser';


const textbox = document.getElementById("body");
const input = document.getElementById("input");

textbox.addEventListener("mouseover", mouseover);
textbox.addEventListener("mouseleave", mouseleave);
textbox.addEventListener("click", clickinput);


function clickinput(){
    input.click();
    setcalendar();
}

function mouseover(){
    textbox.style.backgroundColor = "lightGrey";
}
function mouseleave(){
    textbox.style.backgroundColor = "white";
}

var buffer;
let i;
function setcalendar(){
    buffer = prompt("How many minutes of buffer do you want around each calendar event?");
    input.HTMLInputElement.files[0]

}
