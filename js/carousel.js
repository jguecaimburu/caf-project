function createCarouselObj () {
  const carousel = document.querySelector('.carousel')
  const carouselObj = {}
  carouselObj.container = carousel
  carouselObj.buttons = {}
  carouselObj.buttons.forward = carousel
    .querySelector('.carousel__btn--forward')
  carouselObj.buttons.backward = carousel
    .querySelector('.carousel__btn--backward')
  carouselObj.buttons.play = carousel
    .querySelector('.carousel__btn--play')
  carouselObj.slides = Array.from(carousel
    .querySelectorAll('.carousel__slide')
  )
  return carouselObj
}

function moveSlides (indexChange, slideTransitionTime, carouselObj) {
  const indexes = identifySlidesToPosition(indexChange, carouselObj)
  positionSlidesByIndex(indexes, slideTransitionTime, carouselObj)
}

function identifySlidesToPosition (indexChange, carouselObj) {
  const currentSlide = carouselObj.container
    .querySelector('.carousel__slide--current')

  const currentIndex = carouselObj
    .slides.findIndex(slide => slide === currentSlide)
  const targetIndex = getAbsoluteIndex(
    currentIndex + indexChange,
    carouselObj.slides
  )
  const newForwardIndex = getAbsoluteIndex(
    targetIndex + 1,
    carouselObj.slides
  )
  const newBackwardIndex = getAbsoluteIndex(
    targetIndex - 1,
    carouselObj.slides
  )
  return {
    current: currentIndex,
    target: targetIndex,
    newForward: newForwardIndex,
    newBackward: newBackwardIndex
  }
}

function getAbsoluteIndex (relativeIndex, array) {
  if (relativeIndex < 0) {
    return relativeIndex + array.length
  } else if (relativeIndex > array.length - 1) {
    return relativeIndex - array.length
  } else {
    return relativeIndex
  }
}

function positionSlidesByIndex (
  slidesIndexes
  , slideTransitionTime
  , carouselObj
) {
  const slideWidth = carouselObj.slides[0].getBoundingClientRect().width
  const coverCurrentSlide = new Promise(function (resolve, reject) {
    carouselObj.slides[slidesIndexes.current].style.zIndex = '4'
    moveOnFront(carouselObj.slides[slidesIndexes.target], 0)
    setTimeout(() => { resolve() }, slideTransitionTime)
  })
  coverCurrentSlide.then(function () {
    moveOnBack(carouselObj.slides[slidesIndexes.newForward], slideWidth)
    moveOnBack(carouselObj.slides[slidesIndexes.newBackward], -slideWidth)
    carouselObj.slides[slidesIndexes.current]
      .classList.remove('carousel__slide--current')
    carouselObj.slides[slidesIndexes.target]
      .classList.add('carousel__slide--current')
  })
}

function moveOnFront (element, px) {
  element.style.zIndex = '5'
  element.style.left = px + 'px'
}

function moveOnBack (element, px) {
  element.style.zIndex = '0'
  element.style.transitionDuration = '0ms'
  element.style.left = px + 'px'
  flushCss(element)
  element.style.transitionDuration = ''
}

function flushCss (element) {
  element.offsetHeight
}

function throttle (func, limit) {
  let inThrottle = false
  return function () {
    if (!inThrottle) {
      func()
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}


function getElementTransitionDuration (element) {
  const elementStyle = getComputedStyle(element)
  const transDurationStr = elementStyle.transitionDuration
  return Math.floor(parseFloat(transDurationStr) * 1000)
}


// Start execution

console.log('Running script')

// Select HTML Elements
const carouselObj = createCarouselObj()

// Set slides initial position
const slideTransitionTime =
getElementTransitionDuration(carouselObj.slides[0])
moveSlides(0, slideTransitionTime, carouselObj)

// Define functions for events
const moveOneSlideForward = () => moveSlides(1, slideTransitionTime, carouselObj)
const moveOneSlideBackward = () => moveSlides(-1, slideTransitionTime, carouselObj)

// Set timer on, stop and reset functions
let carouselTimer = setInterval(moveOneSlideForward, 5000)
let timerIsOn = true
const playStopTimer = () => {
  if (timerIsOn) {
    console.log('is on, turn off')
    clearInterval(carouselTimer)
    timerIsOn = false
  } else {
    console.log('is off, turn on')
    carouselTimer = setInterval(moveOneSlideForward, 5000)
  }
}
const resetTimer = () => {
  clearInterval(carouselTimer)
  carouselTimer = setInterval(moveOneSlideForward, 5000)
}

// Add events to buttons
carouselObj.buttons.forward.addEventListener(
  'click'
  , throttle(() => {
    moveOneSlideForward()
    if (timerIsOn) {
      resetTimer()
    }
  }, slideTransitionTime)
)

carouselObj.buttons.backward.addEventListener(
  'click'
  , throttle(() => {
    moveOneSlideBackward()
    if (timerIsOn) {
      resetTimer()
    }
  }, slideTransitionTime)
)

carouselObj.buttons.play.addEventListener(
  'click'
  , throttle(() => {
    playStopTimer()
  }, slideTransitionTime)
)

// Add events to keys
document.onkeydown = throttle((e) => {
  e = e || window.event
  if (e.keyCode === 39) {
    moveOneSlideForward()
  } else if (e.keyCode === 37) {
    moveOneSlideBackward()
  }
  if (timerIsOn) {
    resetTimer()
  }
}, slideTransitionTime)

console.log('End of script')
