const username = "admin";
let apiKey = getApiKey();
const apiEndpoint = "https://treadmill.nessdan.net/api";
let speedAndInclineIntervalId;
let requestOptions = {
  method: "POST",
  headers: {
    Authorization: "Basic " + btoa(username + ":" + apiKey),
    "Content-Type": "text/html; charset=utf-8",
  },
};

// HTML Elements
const notAuthedSection = document.querySelector("#not-authed");
const authedSection = document.querySelector("#authed");
const apiKeyInput = document.querySelector("#api-key-input");
const checkAndSaveApiKeySubmit = document.querySelector("#api-form-submit");
const currentSpeedLabel = document.querySelector("#current-speed");
const currentInclineLabel = document.querySelector("#current-incline");
const speedInput = document.querySelector("#speed");
const inclineInput = document.querySelector("#incline");
const changeSpeedAndInclineButton = document.querySelector(
  "#direct-settings-submit"
);
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
    clearInterval(speedAndInclineIntervalId);
    showOnlyNotAuthedSection();
  }
}

function setSpeedAndIncline(
  newSpeed = speedInput.value,
  newGrade = inclineInput.value
) {
  fetch(`${apiEndpoint}/setSpeed?mph=${newSpeed}`, requestOptions).then(
    (res) => {
      handleBadResponses(res);

      res.text().then((speed) => {
        currentSpeedLabel.innerHTML = Number(speed);
      });
    }
  );

  fetch(`${apiEndpoint}/setIncline?grade=${newGrade}`, requestOptions).then(
    (res) => {
      handleBadResponses(res);

      res.text().then((speed) => {
        currentSpeedLabel.innerHTML = Number(speed);
      });
    }
  );
}

const requestSpeedAndIncline = () => {
  fetch(`${apiEndpoint}/getSpeed`, requestOptions).then((res) => {
    handleBadResponses(res);

    res.text().then((speed) => {
      currentSpeedLabel.innerHTML = Number(speed);
    });
  });

  fetch(`${apiEndpoint}/getIncline`, requestOptions).then((res) => {
    handleBadResponses(res);

    res.text().then((grade) => {
      currentInclineLabel.innerHTML = Number(grade);
    });
  });
};

function loopSpeedAndInclineCalls(intervalSpeed = 6000) {
  //Clear any existing intervals
  clearInterval(speedAndInclineIntervalId);

  // Call this initially on load.
  requestSpeedAndIncline();

  // Continuously request speed & incline information
  speedAndInclineIntervalId = setInterval(
    requestSpeedAndIncline,
    intervalSpeed
  );
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

  setSpeedAndIncline(0, 0);
});

changeSpeedAndInclineButton.addEventListener("click", (e) => {
  e.preventDefault();

  setSpeedAndIncline();
});

window.addEventListener("blur", (e) => {
  // Slow down poll rate when unfocused
  if (speedAndInclineIntervalId) {
    loopSpeedAndInclineCalls(60000);
  }
});

window.addEventListener("focus", (e) => {
  // Bring poll rate back up to speed
  if (speedAndInclineIntervalId) {
    loopSpeedAndInclineCalls();
  }
});

stop - submit;

initialKickstart();
