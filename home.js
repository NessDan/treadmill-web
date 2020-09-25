const username = "admin";
let apiKey = getApiKey();
const apiEndpoint = "https://treadmill.nessdan.net/api";
let requestOptions = {
  method: "POST",
  headers: {
    Authorization: "Basic " + btoa(username + ":" + apiKey),
    "Content-Type": "text/html; charset=utf-8",
  },
};
let currentSpeed = 0;
let currentIncline = 0;
let fetchSpeedAndInclineIntervalId;
let updateCycleIntervalId;

// HTML Elements
const notAuthedSection = document.querySelector("#not-authed");
const authedSection = document.querySelector("#authed");
const apiKeyInput = document.querySelector("#api-key-input");
const checkAndSaveApiKeySubmit = document.querySelector("#api-form-submit");
const currentSpeedLabel = document.querySelector("#current-speed");
const currentInclineLabel = document.querySelector("#current-incline");
// Direct Settings Inputs
const speedInput = document.querySelector("#speed");
const inclineInput = document.querySelector("#incline");
const changeSpeedAndInclineButton = document.querySelector(
  "#direct-settings-submit"
);

// Interval Inputs
const intervalStartSpeedInput = document.querySelector("#interval-start-speed");
const intervalStartInclineInput = document.querySelector(
  "#interval-start-incline"
);
const intervalEndSpeedInput = document.querySelector("#interval-end-speed");
const intervalEndInclineInput = document.querySelector("#interval-end-incline");
const intervalCycleInput = document.querySelector("#interval-cycle-time");
const startIntervalButton = document.querySelector("#interval-start-submit");

// Stop button
const stopButton = document.querySelector("#stop-submit");

function getApiKey() {
  if (localStorage) {
    return localStorage.getItem("api-key");
  }
}

function setApiKey(newApiKey) {
  if (localStorage) {
    apiKey = newApiKey;
    requestOptions = {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(username + ":" + apiKey),
        "Content-Type": "text/html; charset=utf-8",
      },
    };
    return localStorage.setItem("api-key", newApiKey);
  }
}

function handleBadResponses(res) {
  if (res.status === 401) {
    setApiKey("");
    clearInterval(fetchSpeedAndInclineIntervalId);
    showOnlyNotAuthedSection();
  }
}

function setSpeedAndIncline(
  newSpeed = speedInput.value,
  newGrade = inclineInput.value
) {
  if (newSpeed !== "") {
    fetch(`${apiEndpoint}/setSpeed?mph=${newSpeed}`, requestOptions).then(
      (res) => {
        handleBadResponses(res);

        speedInput.value = "";

        res.text().then((speed) => {
          currentSpeed = Number(speed);
          currentSpeedLabel.innerHTML = Number(speed);
        });
      }
    );
  }

  if (newGrade !== "") {
    fetch(`${apiEndpoint}/setIncline?grade=${newGrade}`, requestOptions).then(
      (res) => {
        handleBadResponses(res);

        inclineInput.value = "";

        res.text().then((grade) => {
          currentIncline = Number(grade);
          currentInclineLabel.innerHTML = Number(grade);
        });
      }
    );
  }
}

const requestSpeedAndIncline = () => {
  fetch(`${apiEndpoint}/getSpeed`, requestOptions).then((res) => {
    handleBadResponses(res);

    res.text().then((speed) => {
      currentSpeed = Number(speed);
      currentSpeedLabel.innerHTML = Number(speed);
    });
  });

  fetch(`${apiEndpoint}/getIncline`, requestOptions).then((res) => {
    handleBadResponses(res);

    res.text().then((grade) => {
      currentIncline = Number(grade);
      currentInclineLabel.innerHTML = Number(grade);
    });
  });
};

function loopSpeedAndInclineCalls(intervalSpeed = 6000) {
  //Clear any existing intervals
  clearInterval(fetchSpeedAndInclineIntervalId);

  // Call this initially on load.
  requestSpeedAndIncline();

  // Continuously request speed & incline information
  fetchSpeedAndInclineIntervalId = setInterval(
    requestSpeedAndIncline,
    intervalSpeed
  );
}

function intervalTrainingStart() {
  const startSpeed = Number(intervalStartSpeedInput.value);
  const startIncline = Number(intervalStartInclineInput.value);
  const endSpeed = Number(intervalEndSpeedInput.value);
  const endIncline = Number(intervalEndInclineInput.value);
  const deltaSpeed = endSpeed - startSpeed;
  const deltaIncline = endIncline - startIncline;
  const cycleTime = Number(intervalCycleInput.value);
  const cycleTimeInMs = cycleTime * 1000;
  const peakCycleTime = Math.trunc(cycleTime / 2);
  const speedUpdateEveryMinute = deltaSpeed / peakCycleTime;
  const inclineUpdateEveryMinute = deltaIncline / peakCycleTime;
  let targetSpeed = startSpeed;
  let targetIncline = startIncline;
  let goingUp = null;
  let minuteCounter = 0;

  if (updateCycleIntervalId) {
    clearInterval(updateCycleIntervalId);
  }

  const intervalLoop = () => {
    if (goingUp === null) {
      // First run, set to start speed & incline
      goingUp = true;
    } else {
      if (goingUp === true) {
        targetSpeed = targetSpeed + speedUpdateEveryMinute;
        targetIncline = targetIncline + inclineUpdateEveryMinute;
      } else if (goingUp === false) {
        targetSpeed = targetSpeed - speedUpdateEveryMinute;
        targetIncline = targetIncline - inclineUpdateEveryMinute;
      }

      minuteCounter = minuteCounter + 1;

      if (peakCycleTime - minuteCounter <= 0) {
        goingUp = !goingUp;
        minuteCounter = 0;
      }
    }
    setSpeedAndIncline(targetSpeed, targetIncline);
  };

  updateCycleIntervalId = setInterval(intervalLoop, 60000);
  intervalLoop();
}

function showOnlyAuthedSection() {
  notAuthedSection.classList.add("hidden");
  authedSection.classList.remove("hidden");
}

function showOnlyNotAuthedSection() {
  notAuthedSection.classList.remove("hidden");
  authedSection.classList.add("hidden");
}

function initialKickstart() {
  if (apiKey) {
    showOnlyAuthedSection();
    loopSpeedAndInclineCalls();
  } else {
    showOnlyNotAuthedSection();
  }
}

// ENTRYCODE!!!!!!!!!!!!!!!!!! LETS DO SOME LOGIC! WOOHOO!!!
// ENTRYCODE!!!!!!!!!!!!!!!!!! LETS DO SOME LOGIC! WOOHOO!!!
// ENTRYCODE!!!!!!!!!!!!!!!!!! LETS DO SOME LOGIC! WOOHOO!!!
checkAndSaveApiKeySubmit.addEventListener("click", (e) => {
  e.preventDefault();

  setApiKey(apiKeyInput.value);
  initialKickstart();
});

stopButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (updateCycleIntervalId) {
    clearInterval(updateCycleIntervalId);
  }

  setSpeedAndIncline(0);
});

// #region <direct-settings-listeners>
changeSpeedAndInclineButton.addEventListener("click", (e) => {
  e.preventDefault();

  setSpeedAndIncline();
});

speedInput.addEventListener("focus", (e) => {
  if (e.target.value === "") {
    e.target.value = currentSpeed;
  }
});

inclineInput.addEventListener("focus", (e) => {
  if (e.target.value === "") {
    e.target.value = currentIncline;
  }
});
// #endregion <direct-settings-listeners>

// #region <treadmill-background-polling>
window.addEventListener("blur", (e) => {
  // Slow down poll rate when unfocused
  if (fetchSpeedAndInclineIntervalId) {
    loopSpeedAndInclineCalls(30000);
  }
});

window.addEventListener("focus", (e) => {
  // Bring poll rate back up to speed
  if (fetchSpeedAndInclineIntervalId) {
    loopSpeedAndInclineCalls();
  }
});
// #endregion <treadmill-background-polling>

// #region <interval-listeners>
intervalStartSpeedInput.addEventListener("focus", (e) => {
  if (e.target.value === "") {
    e.target.value = currentSpeed;
  }
});

intervalStartInclineInput.addEventListener("focus", (e) => {
  if (e.target.value === "") {
    e.target.value = currentIncline;
  }
});

intervalEndSpeedInput.addEventListener("focus", (e) => {
  if (e.target.value === "") {
    e.target.value = currentSpeed;
  }
});

intervalEndInclineInput.addEventListener("focus", (e) => {
  if (e.target.value === "") {
    e.target.value = currentIncline;
  }
});

startIntervalButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (updateCycleIntervalId) {
    clearInterval(updateCycleIntervalId);
  }

  intervalTrainingStart();
});
// #endregion </interval-listeners>

initialKickstart();
