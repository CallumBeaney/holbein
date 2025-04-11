function getResponsiveValue(mobileVal, desktopVal) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  
  const minRatio = 0.6;  // mobile
  const maxRatio = 2.0;  // desktop
  
  const clampedRatio = Math.max(Math.min(aspectRatio, maxRatio), minRatio);
  
  // Set specific bias values for different ranges
  let biasedRatio = clampedRatio;
  console.log(`aspectRatio: ${aspectRatio}, clampedRatio: ${clampedRatio}`);
  
  if (clampedRatio >= minRatio && clampedRatio <= maxRatio) {
    let biasAmount;
    
    if (clampedRatio >= 0.65 && clampedRatio < 0.75) {
      biasAmount = 0.25
    }
    else if (clampedRatio >= 0.75 && clampedRatio < 0.85) {
      biasAmount = 0.4
    } 
    else if (clampedRatio >= 0.85 && clampedRatio < 0.85) {
      biasAmount = 0.55
    }
    else if (clampedRatio >= 0.85 && clampedRatio < 0.95) {
      biasAmount = 0.7
    }
    else if (clampedRatio >= 0.95 && clampedRatio < 1.05) {
      biasAmount = 1.1
    }
    else if (clampedRatio >= 1.05 && clampedRatio < 1.15) {
      biasAmount = 0.8
    }
    else if (clampedRatio >= 1.15 && clampedRatio < 1.25) {
      biasAmount = 0.7
    } 
    else if (clampedRatio >= 1.25 && clampedRatio < 1.35) {
      biasAmount = 0.6
    }
    else if (clampedRatio >= 1.35 && clampedRatio < 1.45) {
      biasAmount = 0.5
    }
    else if (clampedRatio >= 1.45 && clampedRatio < 1.55) {
      biasAmount = 0.4
    }
    else if (clampedRatio >= 1.55 && clampedRatio < 1.65) {
      biasAmount = 0.25
    }
    else if (clampedRatio >= 1.65 && clampedRatio < 1.75) {
      biasAmount = 0.2
    }
    else if (clampedRatio >= 1.75 && clampedRatio < 1.85) {
      biasAmount = 0.15
    }
    else if (clampedRatio >= 1.85 && clampedRatio < 1.95) {
      biasAmount = 0.1
    }

    // Add bias to make it behave more like a desktop layout
    biasedRatio = clampedRatio + biasAmount;
    console.log(`Applied bias: ${biasAmount}, biasedRatio: ${biasedRatio}`);
  }

  // Now using biasedRatio in the mapping
  return mapRange(
    mobileVal,
    desktopVal,
    biasedRatio,
    minRatio,       
    maxRatio        
  );
}


let state = {
  scrollPosition: 0,
}

let defaults = {
  translateX: 0,  
  translateY: 0,
  translateZ: -700,
  // get translateZ() { return getResponsiveValue(-50, -700); },
  get maxTranslateY() { return getResponsiveValue(-120, -220); }
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
  
  minTranslateY: 0, 
  get maxTranslateY() { return defaults.maxTranslateY; },
  
  get minTranslateZ() { return defaults.translateZ; },
  maxTranslateZ: 4450,
}



function transform() {
  // you might not believe it, but this is what peak performance looks like
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
      translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateX(${rotationX}deg) 
      rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)
    `;
  }
  
  const panes = document.querySelectorAll('.pane:not([src])'); // disgusting element selection logic
  panes.forEach(pane => {
    pane.style.transform = `translate3d(${defaults.translateX}px, ${defaults.translateY}px, ${defaults.translateZ}px)`;
  });
}

function handleMouseWheel(event) {
  // reverse scroll direction & reduce value to 1 or -1
  let scrollDelta = -Math.sign(event.deltaY) * settings.scrollRateMultiplier;
  
  state.scrollPosition += scrollDelta;
  state.scrollPosition = Math.min(Math.max(state.scrollPosition, settings.minScroll), settings.maxScroll);

  transform();

  event.preventDefault(); // disable pagescrolling
}

function mapRange(outMin, outMax, normalisedValue = state.scrollPosition, inMin = settings.minScroll, inMax = settings.maxScroll) {
  return (normalisedValue - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function toggleFullScroll() {
  if (state.scrollPosition > settings.maxScroll - 10) {
    state.scrollPosition = settings.minScroll;
  } else {
    state.scrollPosition = settings.maxScroll;
  }
  
  transform();
}

transform();
window.addEventListener('wheel', handleMouseWheel, { passive: false });
document.querySelector('.image-container').addEventListener('click', toggleFullScroll);
