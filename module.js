var file;
const textbox = document.getElementById("body");
const input = document.getElementById("input");

textbox.addEventListener("mouseover", mouseover);
textbox.addEventListener("mouseleave", mouseleave);
textbox.addEventListener("click", clickinput);
textbox.addEventListener("drop", (event) => {handledrop(event)});
textbox.addEventListener("dragover", (event) => {handledragover(event)});

function mouseover(){
    textbox.style.backgroundColor = "lightGrey";
}

function mouseleave(){
    textbox.style.backgroundColor = "white";
}

function clickinput(){
    input.click();
    setbuffer();
    setcalendar();
}

function handledrop(event){
    event.preventDefault();
    setbuffer();
    if (textbox.dataTransfer.items) {
        textbox.dataTransfer.items.forEach((item) => {
            if (item.kind === 'file') {
                file = item;
            }
        });
    }
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
    file = input.value[0];
    // let ical = node_modules.ical-js-parser.ICalParser.toJSON(file);
    console.log(file.name);
}
