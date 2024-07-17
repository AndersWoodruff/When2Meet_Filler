const ical = require('ical');
var moment = require('moment');

const monthDays = {
    // Mapping month numbers to the number of days
    1: 31,
    2: 28, // Assuming it's not a leap year
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,

      // Method to get the number of days in a specific month
    getLength: function(monthNumber, yearNumber) {
        if (monthNumber === 2 && yearNumber%4 === 0){
            return 29;
        }
        return this[monthNumber] || "Invalid Month";
    }
};

function getFloor(num){
    if (num < 15) {
        return 0;
    }
    else if (num < 30) {
        return 15;
    }
    else if (num < 45) {
        return 30;
    }
    if (num < 60) {
        return 45;
    }
}

function getCeiling(num){
    if (num > 45) {
        return 60;
    }
    else if (num > 30) {
        return 45;
    }
    else if (num > 15) {
        return 30;
    }
    else if (num > 0) {
        return 15;
    }
}

function daysAway(startDate, endDate){
    let daytotal = 0;

    if (endDate.getFullYear() < startDate.year || (endDate.getFullYear() === startDate.year && endDate.getMonth() < startDate.month) || (endDate.getFullYear() === startDate.year && endDate.getMonth() == startDate.month && endDate.getDate() < startDate.day)){
        return -1;
    }

    while (startDate.year < endDate.getFullYear()){
        daytotal += startDate.year%4 != 0 ? 365: 366;
        startDate.year += 1;
    }
    while (startDate.month < endDate.getMonth()){
        daytotal += monthDays.getLength(startDate.month, startDate.year);
        startDate.month += 1;
    }
    daytotal += endDate.getDate() - startDate.day;
    return daytotal;
}

function slotsAway(startDate, endDate){
    if (endDate.getHours()<startDate.time){
        return -1;
    }
    return (endDate.getHours()-startDate.time)*4 + endDate.getMinutes()/15;
}

function findRecurrence(calendar, event, initDate, width, tz){

    // When dealing with calendar recurrences, you need a range of dates to query against,
    // because otherwise you can get an infinite number of calendar events.
    var rangeStart = moment(""+(initDate.year)+"-"+(initDate.month+1)+"-"+initDate.day);
    var rangeEnd = rangeStart.clone().add(width-1, 'days');

    if (event.type === 'VEVENT') {

        var title = event.summary;
        var startDate = moment(event.start);
        var endDate = moment(event.end);

        // Calculate the duration of the event for use with recurring events.
        var duration = parseInt(endDate.format("x")) - parseInt(startDate.format("x"));

        // Simple case - no recurrences, just print out the calendar event.
        if (typeof event.rrule === 'undefined')
        {
            return;
        }

        // Complicated case - if an RRULE exists, handle multiple recurrences of the event.
        else if (typeof event.rrule !== 'undefined')
        {
            // For recurring events, get the set of event start dates that fall within the range
            // of dates we're looking for.
            var dates = event.rrule.between(
                rangeStart.toDate(),
                rangeEnd.toDate(),
                true,
                function(date, i) {return true;}
            )

            // The "dates" array contains the set of dates within our desired date range range that are valid
            // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
            // had its date changed from outside the range to inside the range.  One way to handle this is
            // to add *all* recurrence override entries into the set of dates that we check, and then later
            // filter out any recurrences that don't actually belong within our range.
            if (event.recurrences != undefined)
            {
                for (var r in event.recurrences)
                {
                    // Only add dates that weren't already in the range we added from the rrule so that 
                    // we don't double-add those events.
                    if (moment(new Date(r)).isBetween(rangeStart, rangeEnd) != true)
                    {
                        dates.push(new Date(r));
                    }
                }
            }

            // Loop through the set of date entries to see which recurrences should be printed.
            for(var i in dates) {

                var date = dates[i];
                var curEvent = event;
                var showRecurrence = true;
                var curDuration = duration;

                startDate = moment(date);

                // Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
                var dateLookupKey = date.toISOString().substring(0, 10);

                // For each date that we're checking, it's possible that there is a recurrence override for that one day.
                if ((curEvent.recurrences != undefined) && (curEvent.recurrences[dateLookupKey] != undefined))
                {
                    // We found an override, so for this recurrence, use a potentially different title, start date, and duration.
                    curEvent = curEvent.recurrences[dateLookupKey];
                    startDate = moment(curEvent.start);
                    curDuration = parseInt(moment(curEvent.start).format("x")) - parseInt(startDate.format("x"));
                }
                // If there's no recurrence override, check for an exception date.  Exception dates represent exceptions to the rule.
                else if ((curEvent.exdate != undefined) && (curEvent.exdate[dateLookupKey] != undefined))
                {
                    // This date is an exception date, which means we should skip it in the recurrence pattern.
                    showRecurrence = false;
                }

                // Set the the title and the end date from either the regular event or the recurrence override.
                var recurrenceTitle = curEvent.summary;
                endDate = moment(parseInt(startDate.format("x")) + curDuration, 'x');

                // If this recurrence ends before the start of the date range, or starts after the end of the date range, 
                // don't process it.
                if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
                    showRecurrence = false;
                }

                if (showRecurrence === true) {
                    let i = 0;
                    while (typeof calendar[i] !== "undefined"){
                        i+=1;
                    }
                    
                    calendar[i] = {
                        start: startDate.toDate(),
                        end: endDate.toDate(),
                        type: "VEVENT",
                        transparency: event.transparency,
                        summary: event.summary
                    }
                    if (tz){
                        calendar[i].start.tz = tz;
                        calendar[i].end.tz = tz;
                    }
                }

            }
        } 
    }
}

function clickRange(start, end, width, height){
    const initNum = Number(document.getElementById("YouGridSlots").firstChild.firstChild.id.slice(7));

    for (let j = start.day; j < Math.min(width, end.day+1); j++){
        let endTime = j === end.day ? end.time: 1000;
        for (let i = start.time; i < Math.min(height, endTime); i++){
            clicker(initNum + j*86400 + 900*i, false);
        }
    }
}

function clicker(number, unfillOk){
    let unfullString = "vertical-align: top; display: inline-block; zoom: 1; width: 44px; height: 9px; font-size: 0px; border-left: 1px solid black; background: rgb(255, 222, 222); border-top: 1px solid black; border-right-color: black; border-bottom-color: black;";
    try{
    if (document.getElementById("YouTime" + number).style === unfullString && !unfillOk){
    }
    else{
    document.getElementById("YouTime" + number).dispatchEvent(new Event('mousedown'));
    }
    }
    catch(err){
        if (err instanceof TypeError) {
           } else {
             throw err;
           }
         }
    document.dispatchEvent(new Event('mouseup'));
}

function getGridRange(){
    return [document.getElementById("YouGridSlots").firstChild.children.length, document.getElementById("YouGridSlots").children.length];
}

function awaitLoad(){
    if(document.getElementById("YouGrid").style.display != "none"){
        setFree();
    } else {
    setTimeout(run, 10);
    }
}

function setFree(){
    const [wide, high] = getGridRange();
    const start = Number(document.getElementById("YouGridSlots").firstChild.firstChild.id.slice(7));
    for (let j = 0; j < wide; j++){
        for (let i = 0; i < high; i++){
            clicker(start + j*86400 + 900*i, true);
        }
    }
}

function correctZone(time){
    if (typeof time.tz !== "undefined"){
        let tempzone = new Date(time.toLocaleString('en-US', { timeZone: time.tz}));
        let offset = moment(tempzone).diff(moment(time), "m")
        
        return moment(time).add(-offset, 'm').toDate();
    } else {
        return time;
    }
}

function CorrectTime(calendar, buffer, wide, startDate){
    for (let [key, i] of Object.entries(calendar)){
        if (i.type != "VEVENT" || i.end === undefined || i.start === undefined){
            continue;
        }
        findRecurrence(calendar, i, startDate, wide, i.start.tz);
    }
    for (let [key, i] of Object.entries(calendar)){
        if (i.type != "VEVENT" || i.end === undefined || i.start === undefined){
            continue;
        }

        i.start.setMinutes(i.start.getMinutes()-buffer);
        i.end.setMinutes(i.end.getMinutes()+buffer);

        i.start.setMinutes(getFloor(i.start.getMinutes()));
        i.end.setMinutes(getCeiling(i.end.getMinutes()));
        
        i.start = correctZone(i.start);
        i.end = correctZone(i.end);
    }
    return calendar;
}

function SetGrid(calendar, buffer){
    const [wide, high] = getGridRange();
    let date;
    for (let x = 0; x<wide; x++){
        let text = document.getElementById("YouGridSlots").parentElement.children[x].innerText
        if(text !== "" && typeof text !== "undefined"){
            date = text;
            break;
        }
    }
    let startDate = {
        time: 0,
        month: 0,
        day: 0,
        year: (new Date).getFullYear(),
        zone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    if (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(date.slice(1))){
        startDate.month = Number(prompt("What is the month you would like the first day to be in (1-12)?")) - 1
        startDate.day = Number(prompt("What is the day you would like the first day to be?"))
    }
    else{
        switch (date.slice(0,3)){
            case "Jan":
                startDate.month = 0;
                break;
            case "Feb":
                startDate.month = 1;
                break;
            case "Mar":
                startDate.month = 2;
                break;
            case "Apr":
                startDate.month = 3;
                break;
            case "May":
                startDate.month = 4;
                break;
            case "Jun":
                startDate.month = 5;
                break;
            case "Jul":
                startDate.month = 6;
                break;
            case "Aug":
                startDate.month = 7;
                break;
            case "Sep":
                startDate.month = 8;
                break;
            case "Oct":
                startDate.month = 9;
                break;
            case "Nov":
                startDate.month = 10;
                break;
            case "Dec":
                startDate.month = 11;
                break;
            }
        startDate.day = Number(date.split("\n")[0].slice(4))
    }

    let time = document.getElementById("YouGrid").children[2].innerText.split("\n")[0].slice(0,7);
    switch (time){
        case "12:00 A":
            startDate.time = 0;
            break;
        case "1:00 AM":
            startDate.time = 1;
            break;
        case "2:00 AM":
            startDate.time = 2;
            break;
        case "3:00 AM":
            startDate.time = 3;
            break;
        case "4:00 AM":
            startDate.time = 4;
            break;
        case "5:00 AM":
            startDate.time = 5;
            break;
        case "6:00 AM":
            startDate.time = 6;
            break;
        case "7:00 AM":
            startDate.time = 7;
            break;
        case "8:00 AM":
            startDate.time = 8;
            break;
        case "9:00 AM":
            startDate.time = 9;
            break;
        case "10:00 A":
            startDate.time = 10;
            break;
        case "11:00 A":
            startDate.time = 11;
            break;
        case "12:00 P":
            startDate.time = 12;
            break;
        case "1:00 PM":
            startDate.time = 13;
            break;
        case "2:00 PM":
            startDate.time = 14;
            break;
        case "3:00 PM":
            startDate.time = 15;
            break;
        case "4:00 PM":
            startDate.time = 16;
            break;
        case "5:00 PM":
            startDate.time = 17;
            break;
        case "6:00 PM":
            startDate.time = 18;
            break;
        case "7:00 PM":
            startDate.time = 19;
            break;
        case "8:00 PM":
            startDate.time = 20;
            break;
        case "9:00 PM":
            startDate.time = 21;
            break;
        case "10:00 P":
            startDate.time = 22;
            break;
        case "11:00 P":
            startDate.time = 23;
            break;
        case "12:00 P":
            startDate.time = 24;
            break;
    }

    calendar = CorrectTime(calendar, buffer, wide, startDate)
    
    for (let [key, eve] of Object.entries(calendar)){
        if (eve.type != "VEVENT" || typeof eve.end === "undefined" || typeof eve.start === "undefined"){
            continue;
        }
        if (eve.transparency == "TRANSPARENT"){
            continue;
        }

        let startdayaway = daysAway(startDate, eve.start);
        let enddayaway = daysAway(startDate, eve.end);

        if ((startdayaway < 0 && enddayaway < 0) || (startdayaway > wide && enddayaway > wide) || isNaN(startdayaway) || isNaN(enddayaway)){
        }
        else if (startdayaway < 0){
            let startTime = {
                day: 0,
                time: 0,
            };
            let endTime = {
                day: enddayaway,
                time: slotsAway(startDate, eve.end),
            };
            clickRange(startTime, endTime, wide, high);
        }
        else if (enddayaway >= wide){
            let startTime = {
                day: startdayaway,
                time: slotsAway(startDate, eve.start),
            };
            let endTime = {
                day: wide,
                time: high,
            };
            clickRange(startTime, endTime, wide, high);
        }
        else{
            let startTime = {
                day: startdayaway,
                time: slotsAway(startDate, eve.start),
            };
            let endTime = {
                day: enddayaway,
                time: slotsAway(startDate, eve.end),
            };
            clickRange(startTime, endTime, wide, high);
        }   
    }

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        awaitLoad();
        let iCalString = request.iCalString;
        let calendar = ical.parseICS(iCalString);
        SetGrid(calendar, Number(request.buffer));
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        sendResponse({resp: "Success"});
    }
  );
