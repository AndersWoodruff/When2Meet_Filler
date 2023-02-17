import {ICalParser} from './node_modules/ical-js-parser';

var file;
const textbox = document.getElementById("body");
const input = document.getElementById("input");

textbox.addEventListener("mouseover", mouseover);
textbox.addEventListener("mouseleave", mouseleave);
textbox.addEventListener("click", () => {input.click()});
input.addEventListener('change', (event) => {inputhandle(event)});
textbox.addEventListener("drop", (event) => {handledrop(event)});
textbox.addEventListener("dragover", (event) => {handledragover(event)});

function mouseover(){
    textbox.style.backgroundColor = "lightGrey";
}

function mouseleave(){
    textbox.style.backgroundColor = "white";
}

function inputhandle(eve){
    if (eve.target.files.length){
    setbuffer();
    file = eve.target.files[0];
    setcalendar();
} else {
    setTimeout((eve)=>{inputhandle(eve)}, 1);
}
}

function handledrop(event){
    event.preventDefault();
    setbuffer();
    if (event.dataTransfer) {
            file = event.dataTransfer.files[0];}
    setcalendar();
}

function handledragover(event){
  event.preventDefault();
}

var buffer;

function setbuffer(){
    buffer = prompt("How many minutes of buffer do you want around each calendar event?");
}


function setcalendar(){    
    let readfile = new FileReader();
    readfile.readAsText(file);
    readfile.onload = function(){
        let iCalString = readfile.result;
    };
    const resultJSON = ICalParser.toJSON(iCalString);
    console.log(file.name);
}
