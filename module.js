var buffer;
var file;
const textbox = document.getElementById("body");
const input = document.getElementById("input");
const leftside = document.getElementById("YouGrid")

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
        (async () => {
            const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
            const response = await chrome.tabs.sendMessage(tab.id,  {iCalString: iCalString, buffer: buffer});
            // do something with response here, not outside the function
            console.log(response);
          })();
    };
    console.log(file.name);
}