// Canvas and Contexts
const tideCanvas = document.getElementById("tideCanvas");
const tideCtx = tideCanvas.getContext("2d");
const tideSlider = document.getElementById("tideSlider");
const tideLabel = document.getElementById("tideLabel");
const tideExplanation = document.getElementById("tideExplanation");
const gravityCanvas = document.getElementById("gravityCanvas");
const gravityCtx = gravityCanvas.getContext("2d");
const moonSlider = document.getElementById("moonPosition");
const sunSlider = document.getElementById("sunPosition");
const explanationBox = document.getElementById("explanationBox");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const currentSpeedDisplay = document.getElementById("currentSpeedDisplay"); // New element for current speed

// Improved Tidal Constants
const TIDAL_CONSTANTS = {
  MIN_TIDE_HEIGHT: 0,
  MAX_TIDE_HEIGHT: 100,
  WAVE_AMPLITUDE: 20,
  WAVE_FREQUENCY: 50,
  WAVE_SPEED: 2,
  MAX_CURRENT_SPEED: 2.5 // knots
};
// Resize Canvases
// Resize Canvases
function resizeCanvas(canvas) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas(tideCanvas);
resizeCanvas(gravityCanvas);


// Animation Variables
let waveOffset = 0;
let currentDirection = 0; // 1 for Flood, -1 for Ebb, 0 for Slack
let currentIntensity = 0;
let moonAngle = parseInt(moonSlider.value);
let sunAngle = parseInt(sunSlider.value);
let animationInterval = null;
let currentAnimationInterval = null;
// Current Speed Calculation Function
function calculateCurrentSpeed(tideLevel) {
  // Simplified current speed model
  // Speed is highest at mid-tide (slack water)
  // Approaches 0 at high and low tides
  const midTidePoint = 50; // Percentage of canvas height
  const normalizeTideLevel = (tideLevel / tideCanvas.height) * 100;
  
  // Calculate distance from mid-tide point
  const distanceFromMidTide = Math.abs(normalizeTideLevel - midTidePoint);
  
  // Calculate current speed based on distance from mid-tide
  // Uses a parabolic curve to simulate current speed
  const maxSpeed = TIDAL_CONSTANTS.MAX_CURRENT_SPEED;
  const currentSpeed = maxSpeed * (1 - Math.pow(distanceFromMidTide / 50, 2));
  
  return Math.max(0, currentSpeed);
}
function drawWaves(level) {
  tideCtx.clearRect(0, 0, tideCanvas.width, tideCanvas.height);

  // Calculate Current Speed
  const currentSpeed = calculateCurrentSpeed(level);
  
  // Update Current Speed Display
  currentSpeedDisplay.textContent = `Current Speed: ${currentSpeed.toFixed(2)} knots`;

  // Enhanced Background Gradient
  const gradient = tideCtx.createLinearGradient(0, 0, 0, tideCanvas.height);
  gradient.addColorStop(0, "#5CA4BF");
  gradient.addColorStop(0.5, "#3E7C9B");
  gradient.addColorStop(1, "#1F5A77");
  tideCtx.fillStyle = gradient;
  tideCtx.fillRect(0, 0, tideCanvas.width, tideCanvas.height);

  // Wave Drawing with Speed Visualization
  tideCtx.beginPath();
  const waveHeight = TIDAL_CONSTANTS.WAVE_AMPLITUDE;
  const waveFrequency = TIDAL_CONSTANTS.WAVE_FREQUENCY;
  
  // Adjust wave animation based on current speed
  const speedMultiplier = 1 + (currentSpeed / TIDAL_CONSTANTS.MAX_CURRENT_SPEED);
  
  for (let x = 0; x < tideCanvas.width; x++) {
    const primaryWave = Math.sin((x + waveOffset * speedMultiplier) / waveFrequency) * waveHeight;
    const secondaryWave = Math.sin((x + waveOffset * speedMultiplier * 1.5) / (waveFrequency * 0.7)) * (waveHeight * 0.5);
    
    const y = tideCanvas.height - level + primaryWave + secondaryWave;
    
    if (x === 0) {
      tideCtx.moveTo(x, y);
    } else {
      tideCtx.lineTo(x, y);
    }
  }
  
  tideCtx.lineTo(tideCanvas.width, tideCanvas.height);
  tideCtx.lineTo(0, tideCanvas.height);
  tideCtx.closePath();
  
  // Gradient fill for waves with speed-based opacity
  const waveGradient = tideCtx.createLinearGradient(0, tideCanvas.height - level, 0, tideCanvas.height);
  const opacity = 0.6 + (currentSpeed / TIDAL_CONSTANTS.MAX_CURRENT_SPEED) * 0.4;
  waveGradient.addColorStop(0, `rgba(70, 130, 180, ${opacity})`);
  waveGradient.addColorStop(1, `rgba(70, 130, 180, ${opacity + 0.2})`);
  tideCtx.fillStyle = waveGradient;
  tideCtx.fill();

  // Increment Wave Offset with speed-dependent modification
  waveOffset += TIDAL_CONSTANTS.WAVE_SPEED * speedMultiplier;
}


// Function to Draw Gravitational Influence
function drawGravitationalInfluence(moonAngle, sunAngle) {
  gravityCtx.clearRect(0, 0, gravityCanvas.width, gravityCanvas.height);

  const centerX = gravityCanvas.width / 2;
  const centerY = gravityCanvas.height / 2;
  const earthRadius = 50;

  // Improved Earth Visualization
  const earthGradient = gravityCtx.createRadialGradient(
    centerX, centerY, 10, 
    centerX, centerY, earthRadius
  );
  earthGradient.addColorStop(0, "#1E90FF");  // Dodger Blue
  earthGradient.addColorStop(1, "#4682B4");  // Steel Blue

  gravityCtx.beginPath();
  gravityCtx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
  gravityCtx.fillStyle = earthGradient;
  gravityCtx.fill();
  
  gravityCtx.fillStyle = "#fff";
  gravityCtx.font = "12px Arial";
  gravityCtx.fillText("Earth", centerX - 20, centerY + 5);

  // More Accurate Celestial Body Positioning
  function drawCelestialBody(x, y, radius, color, name) {
    gravityCtx.beginPath();
    gravityCtx.arc(x, y, radius, 0, Math.PI * 2);
    
    const bodyGradient = gravityCtx.createRadialGradient(
      x, y, radius/4, 
      x, y, radius
    );
    bodyGradient.addColorStop(0, color);
    bodyGradient.addColorStop(1, `${color}CC`);  // With alpha
    
    gravityCtx.fillStyle = bodyGradient;
    gravityCtx.fill();
    gravityCtx.fillStyle = "#000";
    gravityCtx.fillText(name, x - 15, y + radius + 10);
  }

  // Moon Position
  const moonX = centerX + Math.cos((moonAngle * Math.PI) / 180) * 150;
  const moonY = centerY + Math.sin((moonAngle * Math.PI) / 180) * 150;
  drawCelestialBody(moonX, moonY, 20, "#FFFF99", "Moon");

  // Sun Position
  const sunX = centerX + Math.cos((sunAngle * Math.PI) / 180) * 300;
  const sunY = centerY + Math.sin((sunAngle * Math.PI) / 180) * 300;
  drawCelestialBody(sunX, sunY, 30, "#FFD700", "Sun");

  // More Detailed Tidal Explanation
  const angleDifference = Math.abs(moonAngle - sunAngle) % 360;
  let explanationText = "Normal gravitational pull.";
  let explanationColor = "#333";

  if (angleDifference < 30 || angleDifference > 330) {
    explanationText = "Spring Tide: Maximum gravitational pull. Highest tidal range.";
    explanationColor = "#FF4500"; // Orange
  } else if ((angleDifference > 80 && angleDifference < 100) || (angleDifference > 260 && angleDifference < 280)) {
    explanationText = "Neap Tide: Minimum gravitational pull. Lowest tidal range.";
    explanationColor = "#00CED1"; // Turquoise
  }

  explanationBox.textContent = explanationText;
  explanationBox.style.color = explanationColor;
}

// Add event listeners for moon and sun sliders
moonSlider.addEventListener('input', () => {
  moonAngle = parseInt(moonSlider.value);
  drawGravitationalInfluence(moonAngle, sunAngle);
});

sunSlider.addEventListener('input', () => {
  sunAngle = parseInt(sunSlider.value);
  drawGravitationalInfluence(moonAngle, sunAngle);
});

// Animation Functions
function animateGravitationalInfluence() {
  moonAngle = (moonAngle + 1) % 360;
  sunAngle = (sunAngle + 0.5) % 360;
  moonSlider.value = moonAngle;
  sunSlider.value = sunAngle;
  drawGravitationalInfluence(moonAngle, sunAngle);
}

playButton.addEventListener("click", () => {
  if (!animationInterval) {
    animationInterval = setInterval(animateGravitationalInfluence, 100);
  }
});

stopButton.addEventListener("click", () => {
  clearInterval(animationInterval);
  animationInterval = null;
});

function renderTides() {
  const level = (tideSlider.value / 100) * tideCanvas.height;

  // Normalize the tide level for percentage comparison
  const normalizeTideLevel = (level / tideCanvas.height) * 100;
  const midTidePoint = 50; // Mid-tide in percentage

  // Thresholds for determining tide state
  const lowTideThreshold = 10;  // Close to the minimum tide
  const highTideThreshold = 90; // Close to the maximum tide
  const midTideTolerance = 5;   // Allowable range around mid-tide

  let tideState = "";

  if (Math.abs(normalizeTideLevel - midTidePoint) <= midTideTolerance) {
    // Close to mid-tide
    tideState = "Maximum Current Speed (Mid Tide)";
  } else if (normalizeTideLevel <= lowTideThreshold) {
    // Close to low tide
    tideState = "Slack Water (Low Tide)";
  } else if (normalizeTideLevel >= highTideThreshold) {
    // Close to high tide
    tideState = "Slack Water (High Tide)";
  }

  // Display tide state
  tideExplanation.textContent = tideState;

  drawWaves(level);
  requestAnimationFrame(renderTides);
}


// Initial Render
drawGravitationalInfluence(moonAngle, sunAngle);
renderTides();