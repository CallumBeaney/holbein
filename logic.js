// I wrote this at 4am after a long day of work due to not being able to sleep owing to a regional mosquito burgeoning
// I will not apologise for how it is designed but will accept pull requests

let state = {
  scrollPosition: 0,
}

let defaults = {
  translateX: 0,  
  translateY: 0,
  get translateZ() { return calculateMinTranslateZ(-50, -100); },
}

let settings = {
  minScroll: 0, maxScroll: 1000,
  scrollRateMultiplier: 15,

  minPerspective: 1000,
  maxPerspective: 5000,
  
  minRotationX: 0, maxRotationX: 8,
  minRotationY: 0, maxRotationY: -82,
  minRotationZ: 0, maxRotationZ: 32,
  
  minTranslateX: 0, maxTranslateX: 14,
  minTranslateY: 0, maxTranslateY: -215, 
  get yAxisBoundsMidpoint() { return this.maxTranslateY / 2; },

  get minTranslateZ() { return defaults.translateZ; },
  maxTranslateZ: 4450,

  // settings for narrow width adjustment
  narrowWidthThreshold: 650,
  minNarrowWidth: 300,      
  maxNarrowWidth: 650,
  minWidthAdjustment: 0, 
  maxWidthAdjustment: 137,
}

function getScaleFactors() {
  // this is an incorrigible hack devised with the help of an LLM
  // basically this is the dimensions of my brower when I designed this transformation
  // it helps keep the skull near the centre except for when the window is too narrow
  const referenceHeight = 700; 
  const referenceWidth = 1200;

  const heightFactor = window.innerHeight / referenceHeight;
  const widthFactor = window.innerWidth / referenceWidth;
  
  // using smaller factor ensures image properly positioned within both dimensions
  const scaleFactor = Math.min(heightFactor, widthFactor);
  
  return { heightFactor, widthFactor, scaleFactor };
}


// This scales the unwarped image to fit the screen on first load
function calculateMinTranslateZ(min, max) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  
  const minRatio = 0.6;  // mobile
  const maxRatio = 1.7;  // desktop
  
  const clampedRatio = Math.max(Math.min(aspectRatio, maxRatio), minRatio);

  return mapRange(min, max, clampedRatio, minRatio, maxRatio);
}


function adjustVerticalPositionForNarrowScreen() {
  const widthAdjustment = mapRange(
    settings.minWidthAdjustment, 
    settings.maxWidthAdjustment,
    window.innerWidth,
    settings.minNarrowWidth,
    settings.maxNarrowWidth
  );
  
  // Invert the effect (smaller width = larger adjustment)
  const invertedAdjustment = settings.maxWidthAdjustment - widthAdjustment;
  return invertedAdjustment;
}


function transform() {
  const { heightFactor, widthFactor, scaleFactor } = getScaleFactors();
  
  let perspective = mapRange(settings.minPerspective, settings.maxPerspective) * scaleFactor;
  
  let rotationX = mapRange(settings.minRotationX, settings.maxRotationX);
  let rotationY = mapRange(settings.minRotationY, settings.maxRotationY);
  let rotationZ = mapRange(settings.minRotationZ, settings.maxRotationZ);
  
  let translateY = mapRange(settings.minTranslateY, settings.maxTranslateY) * heightFactor;
  let translateZ = mapRange(settings.minTranslateZ, settings.maxTranslateZ) * scaleFactor;
  let translateX = mapRange(settings.minTranslateX, settings.maxTranslateX) * widthFactor;
  
  const narrowScreen = window.innerWidth <= settings.narrowWidthThreshold
  if (narrowScreen && translateY < settings.yAxisBoundsMidpoint) {
    translateY += adjustVerticalPositionForNarrowScreen();
  }

  document.querySelector('.image-container').style.perspective = `${perspective}px`;

  const image = document.querySelector('.pane[src]');
  if (image) {
    image.style.transform = `
      translate3d(
        ${translateX}px, 
        ${translateY}px, 
        ${translateZ}px
      ) 
      rotateX(${rotationX}deg) 
      rotateY(${rotationY}deg)
      rotateZ(${rotationZ}deg)
    `;
  }
  
  const panes = document.querySelectorAll('.pane:not([src])');
  panes.forEach(pane => {
    pane.style.transform = `translate3d(
      ${defaults.translateX * widthFactor}px, 
      ${defaults.translateY * heightFactor}px, 
      ${defaults.translateZ * scaleFactor}px
    )`;
  });
}

function setTransformSpeed(speed) {
  const image = document.querySelector('.pane[src]');
  if (image) {
    image.style.transition = `transform ${speed}s ease-out`;
  }
}

function handleMouseWheel(event) {
  setTransformSpeed(1);

  // reverse scroll direction & reduce value to 1 or -1
  let scrollDelta = -Math.sign(event.deltaY) * settings.scrollRateMultiplier;
  
  state.scrollPosition += scrollDelta;
  state.scrollPosition = Math.min(Math.max(state.scrollPosition, settings.minScroll), settings.maxScroll);

  transform();

  event.preventDefault(); // disable pagescrolling
}

function toggleFullScroll() {
  setTransformSpeed(3);

  if (state.scrollPosition > settings.maxScroll - 10) {
    state.scrollPosition = settings.minScroll;
  } else {
    state.scrollPosition = settings.maxScroll;
  }
  
  transform();
}

function mapRange(outMin, outMax, normalisedValue = state.scrollPosition, inMin = settings.minScroll, inMax = settings.maxScroll) {
  return (normalisedValue - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}


!function setup() {
  transform();
  window.addEventListener('resize', transform);
  window.addEventListener('wheel', handleMouseWheel, { passive: false });
  document.addEventListener('click', toggleFullScroll);
}();
