run();
function run(){
    if(document.getElementById("YouGrid").style.display != "none"){
        runcode();
    } else {
    setTimeout(run, 10);
    }
}

function runcode(){
    const start = Number(document.getElementById("YouGridSlots").firstChild.firstChild.id.slice(7)) ;
        for (var i = 0; i<9;i++){
            clicker(start + 900*i);
        }
        
}

function clicker(number){
    document.getElementById("YouTime" + number).dispatchEvent(new Event('mousedown'));;
    document.getElementById("YouTime" + number).dispatchEvent(new Event('mouseup'));
}   
