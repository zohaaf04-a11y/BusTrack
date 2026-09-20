let aiModel;
let cameraRunning = false;

const busRoutes = {
    1: [
        "Hyderabad",
        "BHEL",
        "Patancheru",
        "Rudraram",
        "Sangareddy"
    ],

    2: [
        "Patancheru",
        "BHEL",
        "Miyapur",
        "Kukatpally",
        "Hyderabad"
    ],

    3: [
        "Sangareddy",
        "Rudraram",
        "Patancheru",
        "BHEL",
        "Hyderabad"
    ]
};

let currentRoute = busRoutes[1];
let currentLocationIndex = 0;

function selectBus(bus) {

    currentRoute = busRoutes[bus];
    currentLocationIndex = 0;

    document.getElementById("bus1").classList.remove("selected");
    document.getElementById("bus2").classList.remove("selected");
    document.getElementById("bus3").classList.remove("selected");

    document.getElementById("bus" + bus).classList.add("selected");

    if (bus === 1) {
        capacity = 50;
        passengers = 32;


        document.getElementById("busNumber").textContent = "218";
        document.getElementById("from").textContent = "Hyderabad";
        document.getElementById("to").textContent = "Sangareddy";
        document.getElementById("nextStop").textContent = "Patancheru";
    }

    else if (bus === 2) {
        capacity = 40;
        passengers = 20;


        document.getElementById("busNumber").textContent = "219";
        document.getElementById("from").textContent = "Patancheru";
        document.getElementById("to").textContent = "Hyderabad";
        document.getElementById("nextStop").textContent = "BHEL";
    }

    else if (bus === 3) {
        capacity = 60;
        passengers = 48;


        document.getElementById("busNumber").textContent = "220";
        document.getElementById("from").textContent = "Sangareddy";
        document.getElementById("to").textContent = "BHEL";
        document.getElementById("nextStop").textContent = "Hyderabad";
    }

    updateBus();
    simulateGPS();
}
let capacity = 50;
let passengers = 32;


function updateBus() {

    let availableSeats = capacity - passengers;
    let occupancy = (passengers / capacity) * 100;

    document.getElementById("capacity").textContent = capacity;
    document.getElementById("passengers").textContent = passengers;
    document.getElementById("availableSeats").textContent = availableSeats;
    document.getElementById("occupancy").textContent =
        Math.round(occupancy) + "%";

    document.querySelector(".progress-bar").style.width = occupancy + "%";

    let status = document.getElementById("status");

if (occupancy < 70) {
    status.textContent =
        "🟢 Seats Available • " + availableSeats + " seats remaining";
}
else if (occupancy < 90) {
    status.textContent =
        "🟡 Getting Crowded • " + availableSeats + " seats remaining";
}
else {
    status.textContent =
        "🔴 Bus Full • No seats available";
}
updateLastUpdated();
}

function increasePassengers() {
    if (passengers < capacity) {
        passengers++;
        updateBus();
    }
}

function decreasePassengers() {
    if (passengers > 0) {
        passengers--;
        updateBus();
    }
}

updateBus();


async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        document.getElementById("camera").srcObject = stream;

        cameraRunning = true;

        // Update camera indicator
        const indicator = document.querySelector(".camera-indicator");

indicator.className = "camera-indicator live";

indicator.innerHTML = `
    <span></span>
    Camera Live
`;

    } catch (error) {

        console.log("Camera access denied or unavailable.");

        // Update camera indicator
        const indicator = document.querySelector(".camera-indicator");

indicator.className = "camera-indicator error";

indicator.innerHTML = `
    <span></span>
    Camera Unavailable
`;

    }
}


async function captureImage() {

    const video = document.getElementById("camera");
    const canvas = document.getElementById("snapshot");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    console.log("Image captured!");

    if (!aiModel) {
        console.log("AI model is still loading...");
        return;
    }

    const predictions = await aiModel.detect(canvas);

    let personCount = 0;

    predictions.forEach(function(prediction) {

        if (prediction.class === "person") {
            personCount++;
        }

    });

    console.log("People detected:", personCount);

    updateAICount(personCount);
}
function updateAICount(count) {

    document.getElementById("aiCount").textContent = count;

    document.getElementById("ticketComparison").textContent = passengers;
    document.getElementById("countDifference").textContent =
    Math.abs(count - passengers);

    updateBus();
}
async function loadAIModel() {

    aiModel = await cocoSsd.load();

    console.log("AI model loaded!");
}

loadAIModel();
async function detectPassengers() {

    if (!aiModel || !cameraRunning) {
    return;
}

    const video = document.getElementById("camera");

    const predictions = await aiModel.detect(video);

    let personCount = 0;

    predictions.forEach(function(prediction) {

        if (prediction.class === "person") {
            personCount++;
        }

    });

    updateAICount(personCount);
}
setInterval(detectPassengers, 1000);

function updateLastUpdated() {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    document.getElementById("lastUpdated").textContent = time;
}

updateLastUpdated();

setInterval(updateLastUpdated, 60000);

function simulateGPS() {

    updateMap(); 

    const location = currentRoute[currentLocationIndex];

    let routeHTML = "";

currentRoute.forEach(function(stop, index) {

    if (index < currentLocationIndex) {
        routeHTML += "🔵 " + stop;
    } 
    else if (index === currentLocationIndex) {
        routeHTML += "🟢 " + stop;
    } 
    else {
        routeHTML += "⚪ " + stop;
    }

    if (index < currentRoute.length - 1) {
        routeHTML += " → ";
    }

});

    document.getElementById("currentLocation").textContent =
        location;

    document.getElementById("routeProgress").textContent =
    "Route progress: Stop " +
    (currentLocationIndex + 1) +
    " of " +
    currentRoute.length;

    // Set the next stop
    const nextIndex =
        (currentLocationIndex + 1) % currentRoute.length;

    document.getElementById("nextStop").textContent =
        currentRoute[nextIndex];

    // Move to the next location
    currentLocationIndex =
        (currentLocationIndex + 1) % currentRoute.length;
}

simulateGPS();

setInterval(simulateGPS, 10000);
function updateMap() {
    const mapContainer = document.getElementById("mapContainer");

    mapContainer.innerHTML =
    '<div class="map-line"></div>';

    currentRoute.forEach(function(stop, index) {

        let marker = "⚪";

        if (index < currentLocationIndex) {
            marker = "🔵";
        } else if (index === currentLocationIndex) {
            marker = "🟢";
        }

        const stopElement = document.createElement("div");
        stopElement.className = "map-stop";

        let busIcon = "";

if (index === currentLocationIndex) {
    busIcon = " 🚍";
stopElement.classList.add("current-stop");
}

stopElement.innerHTML =
    "<span>" + marker + "</span>" +
    "<strong>" + stop + busIcon + "</strong>";
    
        mapContainer.appendChild(stopElement);
    });
}