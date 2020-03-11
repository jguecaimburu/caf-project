// Element selector //

function selectParallaxElements () {
  return Array.from(document.querySelectorAll('.parallax'))
}

// Responsive scroll flags calculation //

function getParallaxElementsInitialYPositionInRems (elementsArray) {
  const elementsYPositions = []
  elementsArray.forEach(element => {
    const boundingRect = element.getBoundingClientRect()
    const topRem = pxToRem(boundingRect.top)
    elementsYPositions.push(topRem)
  })
  return elementsYPositions
}

function getParallaxScrollParameters (elementsArray, elementsInitialPositions) {
  const scrollParameters = []
  elementsArray.forEach((element, index) => {
    const parameters = {}
    parameters.move = getParallaxMoveParameters(
      element,
      elementsInitialPositions[index]
    )
    // Add other parallax functs
    scrollParameters.push(parameters)
  })
  return scrollParameters
}

function getParallaxMoveParameters (element, elementInitialPosition) {
  const boundingRect = element.getBoundingClientRect()
  const moveData = getParallaxMoveData(element)
  const moveParameters = {}
  moveParameters.y = getMoveYParameters(
    elementInitialPosition,
    boundingRect,
    moveData
  )
  moveParameters.x = getMoveXParameters(
    elementInitialPosition,
    element,
    boundingRect,
    moveData
  )
  return moveParameters
}

function getParallaxMoveData (element) {
  const xMoveString = element.dataset.xmove
  const xMoveData = JSON.parse(xMoveString)
  const yMoveString = element.dataset.ymove
  const yMoveData = JSON.parse(yMoveString)
  return { x: xMoveData, y: yMoveData }
}

function getMoveYParameters (
  elementInitialPosition,
  boundingRect,
  moveData
) {
  const yMoveData = moveData.y
  const yParameters = {}
  yParameters.isMoved = yMoveData.isMoved
  if (yParameters.isMoved) {
    const top = remToPx(elementInitialPosition)
    yParameters.startY = getMoveStart(top, yMoveData)
    yParameters.endY = getMoveEnd(yParameters.startY, yMoveData)
    yParameters.yRangeSize = (yParameters.endY - yParameters.startY)
    yParameters.rate = yMoveData.rate
    yParameters.maxDistance = yParameters.yRangeSize * yParameters.rate
    yParameters.endAccumulate = 0
  }
  return yParameters
}

function getMoveStart (top, axisMoveData) {
  const delay = axisMoveData.viewheightDelay / 100 * window.innerHeight
  return top + delay
}

function getMoveEnd (axisStart, axisMoveData) {
  const noEnd = 10000
  if (axisMoveData.deltaYrems === 0) {
    return noEnd
  } else {
    return axisStart + remToPx(axisMoveData.deltaYrems)
  }
}

function getMoveXParameters (
  elementInitialPosition,
  element,
  boundingRect,
  moveData
) {
  const xMoveData = moveData.x
  const xParameters = {}
  xParameters.isMoved = xMoveData.isMoved
  if (xParameters.isMoved) {
    const top = remToPx(elementInitialPosition)
    xParameters.startY = getMoveStart(top, xMoveData)
    xParameters.endY = getMoveEnd(xParameters.startY, xMoveData)
    xParameters.yRangeSize = (xParameters.endY - xParameters.startY)
    xParameters.maxDistance = getXCenterEnd(element, boundingRect, xMoveData)
    xParameters.rate = xParameters.maxDistance / xParameters.yRangeSize
    xParameters.endAccumulate = 0
  }
  return xParameters
}

function getXCenterEnd (element, boundingRect, xMoveData) {
  const elementWidth = boundingRect.width
  const windowWidth = window.innerWidth
  const initial = parseFloat(getComputedStyle(element).left)
  const finalXPercent = xMoveData.centerEndAtViewidth / 100
  return finalXPercent * windowWidth - elementWidth / 2 - initial
}


// Parallax main move functions //

function applyParallaxMove (elementsArray, ParametersArray) {
  const scrolled = window.pageYOffset
  elementsArray.forEach((element, index) => {
    if (Array.from(element.classList).includes('p--move')) {
      parallaxMove(
        element,
        ParametersArray[index].move,
        scrolled
      )
    }
  })
}

function parallaxMove (element, parameters, scrolled) {
  const translateDistances = getTranslateDistances(element, parameters, scrolled)
  moveElementByDistances(element, translateDistances)
}

function getTranslateDistances (element, parameters, scrolled) {
  const translateState = getCurrentTranslateState(element)
  const x = getTranslateDistance('x', parameters.x, translateState.x, scrolled)
  const y = getTranslateDistance('y', parameters.y, translateState.y, scrolled)
  return { x: x, y: y }
}

function getCurrentTranslateState (element) {
  const intRegex = /(\d+.)*\d+px/g
  const translateStr = element.style.transform
  if (translateStr) {
    const translateArr = translateStr.match(intRegex).map((x) => parseFloat(x)
    )
    return { x: translateArr[0], y: translateArr[1] }
  } else {
    return { x: 0, y: 0 }
  }
}

function getTranslateDistance (axis, axisParameters, axisTranslateState, scrolled) {
  if (!axisParameters.isMoved) {
    return axisTranslateState
  } else if (scrolled <= axisParameters.startY) {
    axisParameters.endAccumulate = 0
    return 0
  } else if (scrolled >= axisParameters.endY) {
    axisParameters.endAccumulate = 0
    return axisParameters.maxDistance
  } else {
    return calculateDistance(axis, axisParameters, scrolled)
  }
}

function calculateDistance (axis, axisParameters, scrolled) {
  const scrolledFromStart = scrolled - axisParameters.startY
  const percentOfAdvance = scrolledFromStart / axisParameters.yRangeSize
  if (differenceIsAlmostZero(percentOfAdvance, 1) ||
      differenceIsAlmostZero(percentOfAdvance, 0)) {
    axisParameters.endAccumulate = 0
  }
  let distance =
    scrolledFromStart *
    axisParameters.rate +
    axisParameters.endAccumulate
  distance = getDistanceInRange(distance, axisParameters.maxDistance)
  return distance
}

function getDistanceInRange (distanceCalculation, maxDistance) {
  if (Math.abs(distanceCalculation) > Math.abs(maxDistance)) {
    return maxDistance
  } else if (Math.abs(maxDistance - distanceCalculation) > Math.abs(maxDistance)) {
    return 0
  } else {
    return distanceCalculation
  }
}

function differenceIsAlmostZero (x, y) {
  const difference = 0.01
  return Math.abs(x - y) < difference
}


function moveElementByDistances (element, translateDistances) {
  element.style.transform =
  `translate3d(${translateDistances.x}px, ${translateDistances.y}px, 0px)`
}

// Parallax smooth ending functions //

function applyParallaxMoveEnd (
  elementsArray,
  ParametersArray,
  minScroll
) {
  const scrolled = window.pageYOffset
  const deltaScroll = getDeltaScroll(scrolled)
  if (Math.abs(deltaScroll) > minScroll) {
    elementsArray.forEach((element, index) => {
      if (Array.from(element.classList).includes('p--move-end')) {
        parallaxMoveEnd(
          element,
          ParametersArray[index].move,
          scrolled,
          deltaScroll
        )
      }
    })
  }
}

function getDeltaScroll (scrolled) {
  const deltaScroll = scrolled - lastScroll // global
  lastScroll = scrolled // Global
  return deltaScroll
}

function parallaxMoveEnd (element, moveParameters, scrolled, deltaScroll) {
  const endParameters = getParallaxEndParameters(
    element,
    moveParameters,
    deltaScroll
  )
  const maxMove = getMaxMove(moveParameters)
  const translateState = getCurrentTranslateState(element)
  const endTranslateDistances = getEndTranslateDistances(
    translateState,
    moveParameters,
    endParameters,
    maxMove,
    scrolled,
    deltaScroll
  )
  moveEndByDistances(element, endTranslateDistances)
  accumulateEndDistance(
    moveParameters,
    translateState,
    maxMove,
    endTranslateDistances)
}

function getParallaxEndParameters (
  element,
  moveParameters,
  deltaScroll
) {
  const endData = getParallaxEndData(element)
  const endParameters = {}
  endParameters.x = getProportionalEnd(
    moveParameters.x,
    deltaScroll,
    endData
  )
  endParameters.y = getProportionalEnd(
    moveParameters.y,
    deltaScroll,
    endData
  )
  return endParameters
}

function getParallaxEndData (element) {
  const endString = element.dataset.end
  return JSON.parse(endString)
}

function getProportionalEnd (axisMoveParameters, deltaScroll, endData) {
  const axisProportionalEnd = Math.abs(
    axisMoveParameters.rate *
    deltaScroll *
    endData.rate
  )
  const endMax = remToPx(endData.maxRems)
  if (axisProportionalEnd > endMax) {
    return endMax
  } else {
    return axisProportionalEnd
  }
}

function getMaxMove (moveParameters) {
  const maxX = moveParameters.x.maxDistance
  const maxY = moveParameters.y.maxDistance
  return { x: maxX, y: maxY }
}

function getEndTranslateDistances (
  translateState,
  moveParameters,
  endParameters,
  maxMove,
  scrolled,
  deltaScroll
) {
  const x = getAxisEndTranslateDistance(
    translateState.x,
    moveParameters.x,
    endParameters.x,
    maxMove.x,
    scrolled,
    deltaScroll
  )
  const y = getAxisEndTranslateDistance(
    translateState.y,
    moveParameters.y,
    endParameters.y,
    maxMove.y,
    scrolled,
    deltaScroll
  )
  return { x: x, y: y }
}

function getAxisEndTranslateDistance (
  axisTranslateState,
  axisMoveParameters,
  axisEndParameters,
  axisMaxMove,
  scrolled,
  deltaScroll
) {
  if (!inRange(axisMoveParameters, scrolled)) {
    return axisTranslateState
  } else {
    return calculateEndDistance(
      axisTranslateState,
      axisEndParameters,
      axisMaxMove,
      deltaScroll
    )
  }
}

function inRange (axisParameters, scrolled) {
  return (scrolled >= axisParameters.startY &&
    scrolled <= axisParameters.endY)
}

function calculateEndDistance (
  axisTranslateState,
  axisEndParameters,
  axisMaxMove,
  deltaScroll
) {
  const endSign = getProductSign(axisMaxMove, deltaScroll)
  const endAdded = axisTranslateState + endSign * axisEndParameters
  return getDistanceInRange(endAdded, axisMaxMove)
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

function moveEndByDistances (element, endTranslateDistances) {
  const endTransitionTime = 500
  element.style.transition = 'transform ' + endTransitionTime + 'ms ease-out'
  element.style.transform = `translate3d(${
    endTranslateDistances.x}px, ${endTranslateDistances.y}px, 0px)`
  flushCss(element)
  element.style.transition = ''
}

function flushCss (element) {
  element.offsetHeight
}

function accumulateEndDistance (
  moveParameters,
  translateState,
  maxMove,
  endTranslateDistances
) {
  moveParameters.x.endAccumulate += (endTranslateDistances.x - translateState.x)
  moveParameters.y.endAccumulate += (endTranslateDistances.y - translateState.y)
}

const debounce = (func, delay) => {
  let inDebounce
  return function () {
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => { func() }, delay)
  }
}

function remToPx (rem) {
  return rem * parseFloat(getComputedStyle(document.body).fontSize)
}

function pxToRem (px) {
  return px / parseFloat(getComputedStyle(document.body).fontSize)
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
console.log(window.pageYOffset)

const MIN_SCROLL_PX = 100
const SCROLL_DEBOUNCE_MS = 150
let lastScroll = 0
const parallaxElements = selectParallaxElements()
const initialPositions = getParallaxElementsInitialYPositionInRems(
  parallaxElements
)
let parallaxScrollParameters = getParallaxScrollParameters(
  parallaxElements,
  initialPositions
)
console.log(parallaxScrollParameters)

window.addEventListener('resize', function (e) {
  console.log('resizing')
  parallaxScrollParameters = getParallaxScrollParameters(
    parallaxElements,
    initialPositions
  )
  console.log(parallaxScrollParameters)
  applyParallaxMove(parallaxElements, parallaxScrollParameters)
})

window.addEventListener('scroll', function (e) {
  applyParallaxMove(parallaxElements, parallaxScrollParameters)
})

window.addEventListener('scroll', debounce(() => {
  console.log('DEBOUNCING !!!!!')
  applyParallaxMoveEnd(parallaxElements, parallaxScrollParameters, MIN_SCROLL_PX)
}, SCROLL_DEBOUNCE_MS))


// Marker to understand general layout. DELETE UNDER THIS LINE
window.addEventListener('scroll', function (e) { showOffsetMarker() })
// DELETE ABOVE THIS LINE


console.log('Parallax script end')
