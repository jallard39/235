// Set up the page by linking events to the buttons
window.addEventListener("load", (e) => {
    document.querySelector("#search").onclick = searchButtonClicked;
    document.querySelector("#prev").onclick = prevPageClicked;
    document.querySelector("#next").onclick = nextPageClicked;
    document.querySelector("#sortby").onchange = changeSort;
    document.querySelector("#addtags").onclick = addTag;
    document.querySelector("#loopable").onchange = updateLoop;
    getStoredValues();
})

// Global variables
let FREESOUND_KEY = "11U7tQoByGEiMT481lDuA6Qje6OefbD5gF5sNAVZ";
let displayTerm = "";
let current = undefined;
let next = undefined;
let prev = undefined;
let tagID = 0;
let page = 1;
let numPerPage = 15; // Default value from API
let maxTags = 5;

// Local storage variables
const prefix = "jma6465-";
const searchKey = prefix + "search";
const tagKey = prefix + "tags";
const loopKey = prefix + "loop";
const sortKey = prefix + "sort";

// Looks for variables stored in local storage and populates the page accordingly
// Called on page load
let getStoredValues = () => {
    let storedSearch = localStorage.getItem(searchKey);
    let storedLoop = localStorage.getItem(loopKey);
    let storedSort = localStorage.getItem(sortKey);

    if(storedSearch) {
        document.querySelector("#searchterm").value = storedSearch;
    }

    for( let i = 0; i < maxTags; i++) {
        let storedTag = localStorage.getItem(tagKey + i);
        if(storedTag && storedTag != "null"){
            addStoredTag(storedTag);
        }
    }

    if(storedLoop == "true") {
        document.querySelector("#loopable").checked = true;
    }
    else {
        document.querySelector("#loopable").checked = false;
    }

    if(storedSort) {
        document.querySelector("#sortby").value = storedSort;
    }
}

// When the search button is clicked, gets data from the document and prepares to send a request
let searchButtonClicked = () => {
    // console.log("Search button clicked!")
    page = 1;
    document.querySelector("#search").setAttribute("disabled", "");
    let term = document.querySelector("#searchterm").value;
    let tags = document.querySelectorAll(".tags input");
    let loop = document.querySelector("#loopable").checked;
    let sort = document.querySelector("#sortby").value;

    displayTerm = term;
    localStorage.setItem(searchKey, term);
    localStorage.setItem(loopKey, loop);
    getData(createURL(term, tags, loop, sort));
}

// Builds the query URL
let createURL = (term, tags, loop, sort) => {
    // Create base URL
    const FREESOUND_URL = "https://freesound.org/apiv2/search/text/?";
    let url = FREESOUND_URL + "token=" + FREESOUND_KEY;
    
    // Add search term
    term = encodeURIComponent(term.trim());
    url += "&query=" + term;

    // Add filters: loopable?
    let filters = `ac_loop:${loop}`;

    // Add filters: tags
    if(tags.length) {
        for(let i = 0; i < tags.length; i++){
            if(tags[i].value.length != 0) {
                filters += ` tag:${tags[i].value}`;
            }
        }
    }
    url += "&filter=" + encodeURIComponent(filters.trim());

    // Add fields
    url += "&fields=id,url,name,duration,previews,images,description,tags"

    // Store current url without the sort, so sort can be updated independently later
    current = url;

    // Add sort parameter
    url = updateSort(url);

    return url;
}

// Sends the request to the database
let getData = (url) => {
    // Update HTML (disable search buttons)
    document.querySelector("#prev").setAttribute("disabled", "");
    document.querySelector("#next").setAttribute("disabled", "");
    document.querySelector("#sortby").setAttribute("disabled", "");
    document.querySelector("#status").innerHTML = "Loading . . .";

    // console.log(url);
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

// Parses data received from the query and populates the page
let dataLoaded = (e) => {
    let xhr = e.target;
    // console.log(xhr.responseText);

    // Start parsing data
    let obj = JSON.parse(xhr.responseText);

    // If no results, print error message and return
    if(!obj.results || obj.count == 0){
        document.querySelector("#content p").innerHTML = "No results found for \'" + displayTerm + "\' with the current filters.";
        return;
    }

    // Set up paging
    prev = obj.previous;
    if(prev) { 
        prev += "&token=" + FREESOUND_KEY; 
        document.querySelector("#prev").removeAttribute("disabled");
    } else {
        document.querySelector("#prev").setAttribute("disabled", "");
    }

    next = obj.next;
    if(next) { 
        next += "&token=" + FREESOUND_KEY; 
        document.querySelector("#next").removeAttribute("disabled");
    } else {
        document.querySelector("#next").setAttribute("disabled", "");
    }

    // Start unpacking the data
    let results = obj.results;
    // console.log(obj.results);
    let contentString = "";

    for(let i = 0; i < results.length; i++) {
        let result = results[i];

        // If result is null, skip it (sometimes API returned some null results)
        if(!result) continue;

        // Build a div for each result
        let line = `<div class="result">`;
        line += `<div class="name"><h2>${result.name}</h2></div>`;
        line += `<div><img src=${result.images.waveform_l} alt="">`;
        line += `<audio controls>
                    <source src="${result.previews["preview-hq-ogg"]}" type="audio/ogg">
                    <source src="${result.previews["preview-hq-mp3"]}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio></div>`;
        line += `<div class="info">`;
        line += `<p><b>Tags: </b>${result.tags[0]}`;
        for(let i = 1; i < result.tags.length; i++) {
            line += `, ${result.tags[i]}`;
        }
        line += `</p>`;
        line += `<p id="description"><b>Description: </b>${result.description}</p>`;
        line += `</div>`;
        line += `<div class="fs-link"><a href=${result.url}>View on FreeSound</a></div></div>`;
        contentString += line;
    }

    // Update HTML
    document.querySelector("#status").innerHTML = obj.count + " results found.";
    document.querySelector("#content").innerHTML = contentString;
    let pageCount = obj.count / numPerPage;
    document.querySelector("#page-num").innerHTML = `Page ${page} of ${Math.ceil(pageCount)}`;
    document.querySelector("#search").removeAttribute("disabled");
    document.querySelector("#sortby").removeAttribute("disabled");
}

// Logs when an error occurs
let dataError = (e) => {
    console.log("An error occurred");
}

// Load the next page of results
let nextPageClicked = (e) => {
    page += 1;
    getData(next);
}

// Load the previous page of results
let prevPageClicked = (e) => {
    page -= 1;
    getData(prev);
}

// Re-display the current results based on the new sort order
let changeSort = (e) => {
    getData(updateSort(current));
}

// Create a new tag box
let addTag = (e) => {
    tagID++;

    // If already have max number of tags, abort
    let tags = document.querySelectorAll(".tags");
    if(tags.length >= maxTags) {
        return;
    }

    // Create container for the tag
    let newTag = document.createElement("div");
    newTag.setAttribute("id", "tag" + tagID);
    newTag.setAttribute("class", "tags");

    // Create search bar for text
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("size", 20);
    input.setAttribute("maxlength", 40);
    input.onchange = updateStoredTags;
    
    // Create X button
    let remove = document.createElement("button");
    remove.setAttribute("type", "button");
    remove.setAttribute("value", tagID);
    remove.innerHTML = "X";
    remove.onclick = removeTag;

    // Set up HTML
    newTag.appendChild(input);
    newTag.appendChild(remove);

    tags = document.querySelectorAll(".tags input");

    // If tag-wrapper is not empty, remove the "no tags added"
    if(!tags.length) {
        document.querySelector("#tag-wrapper").innerHTML = "";
    }
    document.querySelector("#tag-wrapper").appendChild(newTag);

    // Update local storage
    updateStoredTags();
}

// Very similar to the addTag() function, but sets the value from local storage and does NOT re-update local storage (this would break the functionality)
let addStoredTag = (tag) => {
    tagID++;

    // Create container for the tag
    let newTag = document.createElement("div");
    newTag.setAttribute("id", "tag" + tagID);
    newTag.setAttribute("class", "tags");

    // Create search bar for text
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("size", 20);
    input.setAttribute("maxlength", 40);
    input.onchange = updateStoredTags;
    input.value = tag;
    
    // Create X button
    let remove = document.createElement("button");
    remove.setAttribute("type", "button");
    remove.setAttribute("value", tagID);
    remove.innerHTML = "X";
    remove.onclick = removeTag;

    // Set up HTML
    newTag.appendChild(input);
    newTag.appendChild(remove);

    if(!document.querySelectorAll(".tags").length) {
        // If tag-wrapper is not empty, remove the "no tags added"
        document.querySelector("#tag-wrapper").innerHTML = "";
    }
    document.querySelector("#tag-wrapper").appendChild(newTag);
}

// Removes a tag, along with its input box
let removeTag = (e) => {
    // Remove the tag
    let tag = document.querySelector("#tag" + e.currentTarget.value);
    let wrapper = document.querySelector("#tag-wrapper");
    wrapper.removeChild(tag);
    let tags = document.querySelectorAll(".tags input");

    // If no tags left, add "no tags added" text
    if(!tags.length) {
        wrapper.innerHTML = "<p>No tags added</p>";
    }

    // Update local storage
    updateStoredTags();
}

// Updates the tag list in local storage
let updateStoredTags = () => {
    let tags = document.querySelectorAll(".tags input");
    for( let i = 0; i < maxTags; i++) {
        if(tags[i]) {
            localStorage.setItem(tagKey + i, tags[i].value);
        }
        else {
            localStorage.setItem(tagKey + i, null);
        }
    }
}

// Updates the loopable checkbox value in local storage
let updateLoop = () => {
    let loop = document.querySelector("#loopable");
    localStorage.setItem(loopKey, loop.checked);
}

// Creates a new url based on the new sort order
let updateSort = (url) => {
    let sortURL = url;
    sortURL += "&sort=" + document.querySelector("#sortby").value;
    localStorage.setItem(sortKey, document.querySelector("#sortby").value);
    return sortURL;
}