const ical = require('ical');
var buffer;
var file;
const textbox = document.getElementById("body");
const input = document.getElementById("input");
var results;

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

function setbuffer(){
    buffer = prompt("How many minutes of buffer do you want around each calendar event?");
}


function setcalendar(){    
    let iCalString
    let readfile = new FileReader();
    let result;
    readfile.readAsText(file);
    readfile.onload = () => {
        iCalString = readfile.result;
        result = ical.parseICS(iCalString);
        settimes(result);
    };
    console.log(file.name);
}

function settimes(result){
    for (i in result){
        
        if (i.start.getMinutes()<buffer){
            if (i.start.getHours()<1){
                if (i.start.getDays()<1){
                    if (i.start.getMonth()<1){
                        i.start.setYear(i.start.getYear() - 1);
                    }
                    i.start.setMonth((i.start.getMonth()-1)%12);

                }
                i.start.setDays((i.start.getDays()-1));
            }
            i.start.setHours((i.start.getHours()-1)%24);
        }
        i.start.setMinutes((i.start.getMinutes()-buffer)%60);

        if (i.end.getMinutes()>(60-buffer)){
            if (i.end.getHours()>23){
                if (i.end.getDays()>29){
                    if (i.end.getMonth()>11){
                        i.end.setYear(i.end.getYear() + 1);
                    }
                    i.end.setMonth((i.end.getMonth() + 1)%12);

                }
                i.end.setDays((i.end.getDays() + 1));
            }
            i.end.setHours((i.end.getHours() + 1)%24);
        }
        i.end.setMinutes((i.end.getMinutes()+buffer)%60);
    }
    results = result;
}

export default results;