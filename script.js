const dateElement = document.getElementById("date");
const greetingElement = document.getElementById("greeting");

function updateGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        greetingElement.textContent = "Good morning";
    } else if (currentHour < 17) {
        greetingElement.textContent = "Good afternoon";
    } else {
        greetingElement.textContent = "Good evening";
    }
}

updateGreeting();
setInterval(updateGreeting, 60000);

function updateDate() {
    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    dateElement.textContent = formattedDate;
}

updateDate();
setInterval(updateDate, 60000);

const clockElement = document.getElementById("clock");

function updateClock() {
    const currentTime = new Date();

    const timeString = currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    clockElement.textContent = timeString;
}

updateClock();
setInterval(updateClock, 1000);

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchEngine = document.getElementById("searchEngine");

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (query === "") {
        return;
    }

    const engine = searchEngine.value;

    let searchURL;

    if (engine === "google") {
        searchURL = "https://www.google.com/search?q=";
    } else if (engine === "bing") {
        searchURL = "https://www.bing.com/search?q=";
    } else if (engine === "duckduckgo") {
        searchURL = "https://duckduckgo.com/?q=";
    }

    window.location.href = searchURL + encodeURIComponent(query);
});

searchInput.focus();

const audioElement = document.getElementById("ambientAudio");
const audioToggle = document.getElementById("audioToggle");
const audioSelect = document.getElementById("audioSelect");
const volumeControl = document.getElementById("volumeControl");

audioElement.volume = volumeControl.value / 100;

volumeControl.addEventListener("input", function() {
    audioElement.volume = volumeControl.value / 100;
});