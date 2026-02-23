// Get all needed DOM elements ------------------------------
const form = document.getElementById("checkInForm");
const nameIn = document.getElementById("attendeeName");
const teamSel = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const checkInBtn = document.getElementById("checkInBtn");
const resetBtn = document.getElementById("resetBtn");
const addRandomBtn = document.getElementById("addRandomBtn");
const attendeeListEl = document.getElementById("attendeeList");

// App state ------------------------------------------------
let count = 0;
let attendees = [];

// App config -----------------------------------------------
const maxCheckIns = 50;
const isAddRandomButtonEnabled = true;
const randomNames = ["Alex","Jordan","Taylor","Morgan","Casey","Riley","Sam","Avery","Jamie","Parker",];
const teamKeys = ["water", "zero", "power"];
const storageKeys = {
  totalCount: "totalAttendanceCount",
  attendeeList: "attendeeListData",
  teamCounts: {
    water: "waterTeamCount",
    zero: "zeroTeamCount",
    power: "powerTeamCount",
  },
};

// Team metadata --------------------------------------------
const teamInfo = {
  water: {
    name: "Team Water Wise",
    emoji: "🌊",
    countEl: document.getElementById("waterCount"),
  },
  zero: {
    name: "Team Net Zero",
    emoji: "🌿",
    countEl: document.getElementById("zeroCount"),
  },
  power: {
    name: "Team Renewables",
    emoji: "⚡",
    countEl: document.getElementById("powerCount"),
  },
};

const teamNameToKey = {
  "Team Water Wise": "water",
  "Team Net Zero": "zero",
  "Team Renewables": "power",
};

// Team helpers ---------------------------------------------
function getTeamDetails(teamKey) {
  return teamInfo[teamKey];
}

function getTeamKey(attendee) {
  if (teamInfo[attendee.teamKey]) {
    return attendee.teamKey;
  }

  return teamNameToKey[attendee.team];
}

// Storage helpers ------------------------------------------
function getStoredNumber(keyName) {
  try {
    const storedValue = localStorage.getItem(keyName);

    if (storedValue === null) {
      return 0;
    }

    const parsedValue = parseInt(storedValue, 10);

    if (Number.isNaN(parsedValue)) {
      return 0;
    }

    return parsedValue;
  } catch (error) {
    return 0;
  }
}

function saveCountsToStorage() {
  try {
    localStorage.setItem(storageKeys.totalCount, count);
    localStorage.setItem(storageKeys.attendeeList, JSON.stringify(attendees));

    let i = 0;
    while (i < teamKeys.length) {
      const teamKey = teamKeys[i];
      const teamCountEl = getTeamDetails(teamKey).countEl;

      if (teamCountEl) {
        localStorage.setItem(
          storageKeys.teamCounts[teamKey],
          teamCountEl.textContent,
        );
      }

      i++;
    }
  } catch (error) {}
}

function loadAttendeesFromStorage() {
  attendees = [];

  try {
    const storedAttendees = localStorage.getItem(storageKeys.attendeeList);

    if (storedAttendees !== null) {
      const parsedAttendees = JSON.parse(storedAttendees);

      if (Array.isArray(parsedAttendees)) {
        attendees = parsedAttendees;
      }
    }
  } catch (error) {
    attendees = [];
  }
}

function loadCountsFromStorage() {
  count = getStoredNumber(storageKeys.totalCount);

  if (count > maxCheckIns) {
    count = maxCheckIns;
  }

  let i = 0;
  while (i < teamKeys.length) {
    const teamKey = teamKeys[i];
    const teamCountEl = getTeamDetails(teamKey).countEl;

    if (teamCountEl) {
      teamCountEl.textContent = getStoredNumber(
        storageKeys.teamCounts[teamKey],
      );
    }

    i++;
  }
}

// UI helpers -----------------------------------------------
function showMessage(messageText) {
  greeting.textContent = messageText;
  greeting.style.display = "block";
  greeting.classList.add("success-message");
}

function updateScreen() {
  attendeeCount.textContent = count;
  const percentage = Math.round((count / maxCheckIns) * 100) + "%";
  progressBar.style.width = percentage;

  const isFull = count >= maxCheckIns;
  checkInBtn.disabled = isFull;
  nameIn.disabled = isFull;
  teamSel.disabled = isFull;

  if (!isAddRandomButtonEnabled) {
    addRandomBtn.disabled = true;
    addRandomBtn.style.display = "none";
  } else {
    addRandomBtn.style.display = "flex";
    addRandomBtn.disabled = isFull;
  }

  attendeeListEl.innerHTML = "";

  if (attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "attendee-empty";
    emptyItem.textContent = "No attendees checked in yet.";
    attendeeListEl.appendChild(emptyItem);
    return;
  }

  let i = 0;
  while (i < attendees.length) {
    const attendee = attendees[i];
    const teamKey = getTeamKey(attendee);
    const details = getTeamDetails(teamKey);

    const listItem = document.createElement("li");
    listItem.className = `attendee-item ${teamKey}`;

    const nameSpan = document.createElement("span");
    nameSpan.className = "attendee-name";
    nameSpan.textContent = attendee.name;

    const teamSpan = document.createElement("span");
    teamSpan.className = "attendee-team";
    teamSpan.textContent = `${details.emoji} ${details.name}`;

    listItem.appendChild(nameSpan);
    listItem.appendChild(teamSpan);
    attendeeListEl.appendChild(listItem);

    i++;
  }
}

// Check-in actions -----------------------------------------
function runCheckIn(name, team) {
  const selectedTeam = getTeamDetails(team);

  count++;
  updateScreen();

  const teamCounter = getTeamDetails(team).countEl;
  if (teamCounter) {
    teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;
  }

  attendees.push({
    name: name,
    team: selectedTeam.name,
    teamKey: team,
  });

  updateScreen();
  saveCountsToStorage();
  showMessage(`Welcome, ${name} from ${selectedTeam.name}!`);

  if (count === maxCheckIns) {
    let highestCount = 0;
    let winningTeams = [];

    let i = 0;
    while (i < teamKeys.length) {
      const currentTeamKey = teamKeys[i];
      const currentTeam = getTeamDetails(currentTeamKey);
      const teamCountEl = getTeamDetails(currentTeamKey).countEl;
      const currentCount = parseInt(teamCountEl.textContent, 10);

      if (currentCount > highestCount) {
        highestCount = currentCount;
        winningTeams = [`${currentTeam.emoji} ${currentTeam.name}`];
      } else if (currentCount === highestCount) {
        winningTeams.push(`${currentTeam.emoji} ${currentTeam.name}`);
      }

      i++;
    }

    if (winningTeams.length === 1) {
      showMessage(
        `🎉 Attendance goal completed! ${winningTeams[0]} wins with ${highestCount} members!`,
      );
    } else {
      showMessage(
        `🎉 Attendance goal completed! It's a tie between ${winningTeams.join(" and ")} with ${highestCount} members each!`,
      );
    }
  }
}

// Init -----------------------------------------------------
loadCountsFromStorage();
loadAttendeesFromStorage();
updateScreen();

// Event listeners ------------------------------------------
resetBtn.addEventListener("click", function () {
  const shouldReset = window.confirm(
    "Are you sure you want to reset all attendance counts?",
  );

  if (shouldReset) {
    count = 0;

    let i = 0;
    while (i < teamKeys.length) {
      const teamCountEl = getTeamDetails(teamKeys[i]).countEl;

      if (teamCountEl) {
        teamCountEl.textContent = 0;
      }

      i++;
    }

    attendees = [];

    try {
      localStorage.removeItem(storageKeys.totalCount);
      localStorage.removeItem(storageKeys.attendeeList);

      let i = 0;
      while (i < teamKeys.length) {
        localStorage.removeItem(storageKeys.teamCounts[teamKeys[i]]);
        i++;
      }
    } catch (error) {
      return;
    }

    updateScreen();
    form.reset();
    showMessage("All attendance counts have been reset.");
  }
});

addRandomBtn.addEventListener("click", function () {
  if (!isAddRandomButtonEnabled) {
    return;
  }

  runCheckIn(
    randomNames[Math.floor(Math.random() * randomNames.length)],
    teamKeys[Math.floor(Math.random() * teamKeys.length)],
  );
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameIn.value;
  const team = teamSel.value;
  runCheckIn(name, team);

  form.reset();
});
