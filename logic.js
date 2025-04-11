// function addPanes() {
//   let builder = "";
//   for (let i=0; i<5; i++) builder += '<div class="pane"></div>';
//   document.querySelector('.image-container').insertAdjacentHTML("afterbegin", builder);
// }

let state = {
  scrollPosition: 0,
}

const defaults = {
  translateX: 0,  
  translateY: 0,
  translateZ: -800,
}

const settings = {
  // normalised value with set range
  scrollPosition: 0,
  minScroll: 0, maxScroll: 1000,
  scrollRateMultiplier: 20,

  minPerspective: 1000,
  maxPerspective: 5000,
  
  minRotationX: 0, maxRotationX: 10,
  minRotationY: 0, maxRotationY: -81,
  minRotationZ: 0, maxRotationZ: 35,
  
  minTranslateX: 0, maxTranslateX: 14,
  minTranslateY: 0, maxTranslateY: -215, 
  minTranslateZ: -800, maxTranslateZ: 4400,
}

state = {
  rotationX: settings.minRotationX,
  rotationY: settings.minRotationY,
  rotationZ: settings.minRotationZ,
  translateX: settings.minTranslateX,
  translateY: settings.minTranslateY,
  translateZ: settings.minTranslateZ,
  perspective: settings.minPerspective,
  scrollPosition: settings.minScroll,
}

function transform() {
  let perspective = mapRange(settings.minPerspective, settings.maxPerspective);
  let rotationX = mapRange(settings.minRotationX, settings.maxRotationX);
  let rotationY = mapRange(settings.minRotationY, settings.maxRotationY);
  let rotationZ = mapRange(settings.minRotationZ, settings.maxRotationZ);
  let translateY = mapRange(settings.minTranslateY, settings.maxTranslateY);
  let translateZ = mapRange(settings.minTranslateZ, settings.maxTranslateZ);
  let translateX = mapRange(settings.minTranslateX, settings.maxTranslateX);
  
  document.querySelector('.image-container').style.perspective = `${perspective}px`;

  const image = document.querySelector('.pane[src]');
  if (image) {
    image.style.transform = `
      translate3d(${translateX}px, ${translateY}px, ${translateZ}px) 
      rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
  }
  
  const panes = document.querySelectorAll('.pane:not([src])'); // disgusting element selection logic
  panes.forEach(pane => {
    pane.style.transform = `translate3d(${defaults.translateX}px, ${defaults.translateY}px, ${defaults.translateZ}px)`;
  });
}

function handleMouseWheel(event) {
  // reverse scroll direction & reduce value to 1 or -1
  let scrollDelta = -Math.sign(event.deltaY) * settings.scrollRateMultiplier;
  
  settings.scrollPosition += scrollDelta;
  settings.scrollPosition = Math.min(Math.max(settings.scrollPosition, settings.minScroll), settings.maxScroll);

  transform();

  event.preventDefault(); // disable pagescrolling
}

function mapRange(outMin, outMax, normalisedValue = settings.scrollPosition, inMin = settings.minScroll, inMax = settings.maxScroll) {
  return (normalisedValue - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function toggleFullScroll() {
  // If we're close to maxScroll, go back to minScroll
  if (settings.scrollPosition > settings.maxScroll - 10) {
    settings.scrollPosition = settings.minScroll;
  } else {
    // Otherwise, go to maxScroll
    settings.scrollPosition = settings.maxScroll;
  }
  
  // Update the transforms based on new position
  transform();
}

// addPanes();
transform();
window.addEventListener('wheel', handleMouseWheel, { passive: false });

document.querySelector('.image-container').addEventListener('click', toggleFullScroll);
// settings.scrollPosition = settings.minScroll;
// toggleFullScroll();