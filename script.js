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
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
let tasks = JSON.parse(localStorage.getItem("astroTasks")) || [];
function displayTasks() {
    taskList.innerHTML = "";
    tasks.forEach(function(task, index) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", function() {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });
        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.classList.add("completed");
        }
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });
        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
}
function saveTasks() {
    localStorage.setItem("astroTasks", JSON.stringify(tasks));
}
displayTasks();
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText === "") {
        return;
    }
    const newTask = {
        text: taskText,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    displayTasks();
    taskInput.value = "";
});
const quickNotes = document.getElementById("quickNotes");
const notesStatus = document.getElementById("notesStatus");
quickNotes.value = localStorage.getItem("astroNotes") || "";
quickNotes.addEventListener("input", function() {
    localStorage.setItem("astroNotes", quickNotes.value);
    notesStatus.textContent = "Saved automatically";
});
const timerDisplay = document.getElementById("timerDisplay");
const timerStart = document.getElementById("timerStart");
const timerReset = document.getElementById("timerReset");
const timerStatus = document.getElementById("timerStatus");
let timerSeconds = 25 * 60;
let timerInterval = null;
function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}
updateTimerDisplay();
timerStart.addEventListener("click", function() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerStart.textContent = "Resume";
        timerStatus.textContent = "Paused";
        return;
    }
    if (timerSeconds <= 0) {
        return;
    }
    timerInterval = setInterval(function() {
        timerSeconds--;
        updateTimerDisplay();
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerStart.textContent = "Start";
            timerStatus.textContent = "Focus session complete!";
        }
    }, 1000);
    timerStart.textContent = "Pause";
    timerStatus.textContent = "Stay focused!";
});
timerReset.addEventListener("click", function() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 25 * 60;
    updateTimerDisplay();
    timerStart.textContent = "Start";
    timerStatus.textContent = "Ready to focus?";
});