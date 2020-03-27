const imageCarousel = (function () {

  /*  GLOBALS
  ----------------------------------------------- */

  const CAROUSEL_INTERVAL_MS = 5000
  const RESIZE_DEBOUNCE_MS = 150
  const carouselObject = {}
  let slideTransitionTime
  let slideWidth
  let carouselTimer
  let timerIsOn

  /*  CONSTRUCTION
  ----------------------------------------------- */

  function init () {
    setupParameters()
    setupEventListeners()
    carouselTimer = setInterval(moveOneSlideForward, CAROUSEL_INTERVAL_MS)
    timerIsOn = true
  }

  function setupParameters () {
    buildCarouselObject()
    setSlideWidth()
    setSlideTransitionDuration()
    setSlidesInitialPositions()
  }

  function setupEventListeners () {
    setupButtonListeners()
    setupKeyboardListener()
    setupResizeListeners()
  }

  /*  SETUP
  ----------------------------------------------- */

  function buildCarouselObject () {
    const carousel = document.querySelector('.carousel')
    carouselObject.container = carousel
    carouselObject.buttons = {}
    carouselObject.buttons.forward = carousel
      .querySelector('.carousel__btn--forward')
    carouselObject.buttons.backward = carousel
      .querySelector('.carousel__btn--backward')
    carouselObject.buttons.play = carousel
      .querySelector('.carousel__btn--play')
    carouselObject.slides = Array.from(carousel
      .querySelectorAll('.carousel__slide')
    )
  }

  function setSlideWidth () {
    slideWidth = carouselObject.slides[0].getBoundingClientRect().width
  }

  function setSlideTransitionDuration () {
    slideTransitionTime = getElementTransitionDuration(carouselObject.slides[0])
  }

  function setSlidesInitialPositions () {
    moveSlides(0)
  }

  function getElementTransitionDuration (element) {
    const elementStyle = getComputedStyle(element)
    const transDurationStr = elementStyle.transitionDuration
    if (transDurationStr) {
      return Math.floor(parseFloat(transDurationStr) * 1000)
    } else {
      return 0
    }
  }

  /*  EVENT LISTENERS
  ----------------------------------------------- */

  function setupButtonListeners () {
    carouselObject.buttons.forward.addEventListener(
      'click'
      , throttle(() => {
        moveOneSlideForward()
        if (timerIsOn) {
          resetTimer()
        }
      }, slideTransitionTime)
    )

    carouselObject.buttons.backward.addEventListener(
      'click'
      , throttle(() => {
        moveOneSlideBackward()
        if (timerIsOn) {
          resetTimer()
        }
      }, slideTransitionTime)
    )

    carouselObject.buttons.play.addEventListener(
      'click'
      , throttle(() => {
        playStopTimer()
      }, slideTransitionTime)
    )
  }

  function setupKeyboardListener () {
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
  }

  function setupResizeListeners () {
    window.addEventListener('resize', debounce(() => {
      setSlideWidth()
    }, RESIZE_DEBOUNCE_MS))
  }

  /*  MOVE SLIDES
  ----------------------------------------------- */

  function moveOneSlideForward () {
    moveSlides(1)
  }

  function moveOneSlideBackward () {
    moveSlides(-1)
  }

  function moveSlides (indexChange) {
    const indexes = identifySlidesToPosition(indexChange)
    positionSlidesByIndex(indexes)
  }

  function identifySlidesToPosition (indexChange) {
    const currentSlide = carouselObject.container
      .querySelector('.carousel__slide--current')
    const indexes = {}
    indexes.current = carouselObject
      .slides.findIndex(slide => slide === currentSlide)
    indexes.target = getAbsoluteIndex({
      relativeIndex: indexes.current + indexChange,
      array: carouselObject.slides
    })
    indexes.newForward = getAbsoluteIndex({
      relativeIndex: indexes.target + 1,
      array: carouselObject.slides
    })
    indexes.newBackward = getAbsoluteIndex({
      relativeIndex: indexes.target - 1,
      array: carouselObject.slides
    })
    return indexes
  }

  function getAbsoluteIndex ({ relativeIndex, array }) {
    if (relativeIndex < 0) {
      return relativeIndex + array.length
    } else if (relativeIndex > array.length - 1) {
      return relativeIndex - array.length
    } else {
      return relativeIndex
    }
  }

  function positionSlidesByIndex ({ current, target, newForward, newBackward }) {
    const coverCurrentSlide = new Promise(function (resolve, reject) {
      carouselObject.slides[current].style.zIndex = '4'
      moveOnFront(carouselObject.slides[target], 0)
      setTimeout(() => { resolve() }, slideTransitionTime)
    })
    coverCurrentSlide.then(function () {
      moveOnBack(carouselObject.slides[newForward], slideWidth)
      moveOnBack(carouselObject.slides[newBackward], -slideWidth)
      carouselObject.slides[current].classList.remove('carousel__slide--current')
      carouselObject.slides[target].classList.add('carousel__slide--current')
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

  /*  TIMER MANAGEMENT
  ----------------------------------------------- */

  function playStopTimer () {
    if (timerIsOn) {
      clearInterval(carouselTimer)
      carouselObject.buttons.play.textContent = 'Play'
      timerIsOn = false
    } else {
      carouselTimer = setInterval(moveOneSlideForward, CAROUSEL_INTERVAL_MS)
      timerIsOn = true
      carouselObject.buttons.play.textContent = 'Pause'
    }
  }

  function resetTimer () {
    clearInterval(carouselTimer)
    carouselTimer = setInterval(moveOneSlideForward, CAROUSEL_INTERVAL_MS)
  }

  /*  HELPERS
  ----------------------------------------------- */
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

  function debounce (func, delay) {
    let inDebounce
    return function () {
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => { func() }, delay)
    }
  }

  init()
}())

console.log('Carousel file loaded correctly')
