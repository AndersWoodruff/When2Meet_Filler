# When2Meet Filler
This is a simple brower-based extension that automatically fills in when2meet.com using an ical file.

## Features
- Works with recurring events
- Automatically converts the timezone of events to the local timezone
- Works with both dates and days of the week in when2meet

## Limitations (to Fix)
- Only works with contiguous dates (i.e. the dates in when2meet must all follow eachother)


## Files
- edit.js is the relevant code for editing the when2meet webpage
- editor.js is the output of browserify to prevent require-related errors
- module.js is the script for index.html, which is the pop-up extension window
