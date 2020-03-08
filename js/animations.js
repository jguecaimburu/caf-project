function selectParallaxElements () {
  return Array.from(document.querySelectorAll('.parallax'))
}

function applyMainParallax () {
  const scrolled = window.pageYOffset
  parallaxElements.forEach(element => move(element, scrolled))
}

function move (element, scrolled) {
  const rates = getParallaxRates(element)
  const translateDistances = getTranslateDistances(scrolled, rates)
  moveElementByDistances(element, translateDistances)
}

function getParallaxRates (element) {
  const ratesString = element.dataset.rates
  const rates = JSON.parse(ratesString)
  return rates
}

function getTranslateDistances (scrolled, rates) {
  const x = scrolled * rates.x
  const y = scrolled * rates.y
  return { x: x, y: y }
}

function moveElementByDistances (element, translateDistances) {
  element.style.transform =
  `translate3d(${translateDistances.x}px, ${translateDistances.y}px, 0px)`
}

function applyParallaxEnding () {
  const scrolled = window.pageYOffset
  const deltaScroll = getDeltaScroll(scrolled)
  parallaxElements.forEach(element => moveSmooth(element, scrolled, deltaScroll))
}

function getDeltaScroll (scrolled) {
  const deltaScroll = scrolled - lastScroll // global
  lastScroll = scrolled
  return deltaScroll
}

function moveSmooth (element, scrolled, deltaScroll) {
  const rates = getParallaxRates(element)
  const endingMvm = getEndingMovement(scrolled, deltaScroll, rates)
  moveSmoothByDistance(element, endingMvm)
}

function getEndingMovement (scrolled, deltaScroll, rates) {
  const endingDistance = 15
  const endX = getProductSign(deltaScroll, rates.x) * endingDistance
  const endY = getProductSign(deltaScroll, rates.y) * endingDistance
  const x = scrolled * rates.x + endX
  const y = scrolled * rates.y + endY
  return { x: x, y: y }
}

function getProductSign (x, y) {
  if (x * y > 0) {
    return 1
  } else if (x * y < 0) {
    return -1
  } else {
    return 0
  }
}

function moveSmoothByDistance (element, endingMvm) {
  element.style.transition = 'transform 500ms ease-out'
  element.style.transform = `translate3d(${endingMvm.x}px, ${endingMvm.y}px, 0px)`
  flushCss(element)
  element.style.transition = ''
}

function flushCss (element) {
  element.offsetHeight
}

const debounce = (func, delay) => {
  let inDebounce
  return function () {
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => { func() }, delay)
  }
}

// Marker to understand general layout. DELETE UNDER THIS LINE

function showOffsetMarker () {
  const scrolled = window.pageYOffset
  const marker = document.querySelector('.y-offset-marker')
  marker.textContent = scrolled
}
// DELETE ABOVE THIS LINE

// Run script

console.log('Load Parallax script')

let lastScroll = 0
const parallaxElements = selectParallaxElements()

window.addEventListener('scroll', function (e) { applyMainParallax() })

window.addEventListener('scroll', debounce(() => {
  applyParallaxEnding()
}, 150))

// Marker to understand general layout. DELETE UNDER THIS LINE
window.addEventListener('scroll', function (e) { showOffsetMarker() })
// DELETE ABOVE THIS LINE

console.log('Parallax script end')
