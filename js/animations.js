// Element selector //

function selectParallaxElements () {
  return Array.from(document.querySelectorAll('.parallax'))
}

// Responsive scroll flags calculation //

function getParallaxElementsInitialYPositionInRems (elementsArray) {
  const elementsYPositions = []
  const scrolled = window.pageYOffset
  elementsArray.forEach(element => {
    const boundingRect = element.getBoundingClientRect()
    const topRem = pxToRem(boundingRect.top + scrolled)
    elementsYPositions.push(topRem)
  })
  return elementsYPositions
}

function getParallaxScrollParameters (elementsArray, elementsInitialPositions) {
  const scrollParameters = []
  elementsArray.forEach((element, index) => {
    const parameters = {}
    const elementClasses = Array.from(element.classList)
    elementClasses.forEach((className) => {
      switch(className) {
        case 'p--move':
          parameters.move = getParallaxMoveParameters(
            element,
            elementsInitialPositions[index]
          )
          break;
        case 'p--fade':
          parameters.fade = getParallaxFadeParameters(
            element,
            elementsInitialPositions[index]
          )
          break;
        case 'p--grow':
          parameters.grow = getParallaxGrowParameters(
            element,
            elementsInitialPositions[index]
          )
          break;
      }
    })
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
    yParameters.startY = getStartScroll(top, yMoveData.viewheightAnticipation)
    yParameters.endY = getMoveEnd(yParameters.startY, yMoveData)
    yParameters.yRangeSize = (yParameters.endY - yParameters.startY)
    yParameters.rate = yMoveData.rate
    yParameters.maxDistance = yParameters.yRangeSize * yParameters.rate
    yParameters.endAccumulate = 0
  }
  return yParameters
}

function getStartScroll (top, viewheightAnticipation) {
  const anticipation =
    viewheightAnticipation / 100 *
    window.innerHeight
  return top - anticipation
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
    xParameters.startY = getStartScroll(top, xMoveData.viewheightAnticipation)
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

function getParallaxFadeParameters (element, elementInitialPosition) {
  const top = remToPx(elementInitialPosition)
  const fadeData = getParallaxFadeData(element)
  const fadeParameters = {}
  fadeParameters.startY = getStartScroll(top, fadeData.viewheightAnticipation)
  fadeParameters.yRangeSize = getRangeSizeFromViewheighDuration(
    fadeData.viewheightDuration
  )
  fadeParameters.endY = fadeParameters.startY + fadeParameters.yRangeSize
  const deltaOpacity = fadeData.endOpacity - fadeData.initialOpacity
  fadeParameters.rate = deltaOpacity / fadeParameters.yRangeSize
  fadeParameters.initialOpacity = fadeData.initialOpacity
  fadeParameters.endOpacity = fadeData.endOpacity
  return fadeParameters
}

function getParallaxFadeData (element) {
  const fadeString = element.dataset.fade
  return JSON.parse(fadeString)
}

function getRangeSizeFromViewheighDuration (viewheightDuration) {
  return viewheightDuration / 100 * window.innerHeight
}

function getParallaxGrowParameters (element, elementInitialPosition) {
  const top = remToPx(elementInitialPosition)
  const growData = getParallaxGrowData(element)
  const growParameters = {}
  growParameters.startY = getStartScroll(top, growData.viewheightAnticipation)
  growParameters.yRangeSize = getRangeSizeFromViewheighDuration(
    growData.viewheightDuration
  )
  growParameters.endY = growParameters.startY + growParameters.yRangeSize
  growParameters.widthRate = growData.widthRate
  growParameters.heightRate = growData.heightRate
  growParameters.initialWidth = element.getBoundingClientRect().width
  growParameters.initialHeight = element.getBoundingClientRect().height
  return growParameters
}

function getParallaxGrowData (element) {
  const growString = element.dataset.grow
  return JSON.parse(growString)
}

// Apply parallax scroll and resize functions //

function applyParallax (elementsArray, parametersArray) {
  const scrolled = window.pageYOffset
  applyParallaxFade(elementsArray, parametersArray, scrolled)
  applyParallaxMove(elementsArray, parametersArray, scrolled)
  applyParallaxGrow(elementsArray, parametersArray, scrolled)
}

// Parallax main move functions //

function applyParallaxMove (elementsArray, parametersArray, scrolled) {
  elementsArray.forEach((element, index) => {
    if (Array.from(element.classList).includes('p--move')) {
      parallaxMove(
        element,
        parametersArray[index].move,
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

function moveElementByDistances (element, translateDistances) {
  element.style.transform =
  `translate3d(${translateDistances.x}px, ${translateDistances.y}px, 0px)`
}

// Parallax smooth ending functions //

function applyParallaxMoveEnd (
  elementsArray,
  parametersArray,
  minScroll
) {
  const scrolled = window.pageYOffset
  const deltaScroll = getDeltaScroll(scrolled)
  if (Math.abs(deltaScroll) > minScroll) {
    elementsArray.forEach((element, index) => {
      if (Array.from(element.classList).includes('p--move-end')) {
        parallaxMoveEnd(
          element,
          parametersArray[index].move,
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

function accumulateEndDistance (
  moveParameters,
  translateState,
  maxMove,
  endTranslateDistances
) {
  moveParameters.x.endAccumulate += (endTranslateDistances.x - translateState.x)
  moveParameters.y.endAccumulate += (endTranslateDistances.y - translateState.y)
}

// Parallax fade functions //

function applyParallaxFade (elementsArray, parametersArray, scrolled) {
  elementsArray.forEach((element, index) => {
    if (Array.from(element.classList).includes('p--fade')) {
      parallaxFade(
        element,
        parametersArray[index].fade,
        scrolled
      )
    }
  })
}

function parallaxFade (element, parameters, scrolled) {
  let opacity
  if (scrolled <= parameters.startY) {
    opacity = parameters.initialOpacity
  } else if (scrolled >= parameters.endY) {
    opacity = parameters.endOpacity
  } else {
    opacity = getOpacity(parameters, scrolled)
  }
  element.style.opacity = "" + opacity
}

function getOpacity (parameters, scrolled) {
  const yAdvance = scrolled - parameters.startY
  return parameters.initialOpacity + yAdvance * parameters.rate
}

// Parallax grow functions //

function applyParallaxGrow (elementsArray, parametersArray, scrolled) {
  elementsArray.forEach((element, index) => {
    if (Array.from(element.classList).includes('p--grow')) {
      parallaxGrow(
        element,
        parametersArray[index].grow,
        scrolled
      )
    }
  })
}

function parallaxGrow (element, parameters, scrolled) {
  let width
  let height
  if (scrolled <= parameters.startY) {
    width = parameters.initialWidth
    height = parameters.initialHeight
  } else if (scrolled >= parameters.endY) {
    width = getDimension(
      parameters.initialWidth,
      parameters.yRangeSize,
      parameters.yRangeSize,
      parameters.widthRate
    )
    height = getDimension(
      parameters.initialHeight,
      parameters.yRangeSize,
      parameters.yRangeSize,
      parameters.heightRate
    )
  } else {
    const yAdvance = scrolled - parameters.startY
    width = getDimension(
      parameters.initialWidth,
      yAdvance,
      parameters.yRangeSize,
      parameters.widthRate
    )
    height = getDimension(
      parameters.initialHeight,
      yAdvance,
      parameters.yRangeSize,
      parameters.heightRate
    )
  }
  element.style.width = width + 'px'
  element.style.height = height + 'px'
}

function getDimension (baseDimension, advance, rangeSize, rate) {
  const advancePercent = advance / rangeSize
  let dimension = baseDimension * (1 + advancePercent * rate)
  if (dimension < 0) {
    dimension = 0
  }
  return dimension
}

// Avoids content jumps on resize

function getTopElementInViewport () {
  let tempElement
  topElement = null // Global
  for (let x = 0; x < document.body.offsetWidth; x++) {
    tempElement = document.elementFromPoint(x, 2)
    if (!topElement || tempElement.offsetTop > topElement.offsetTop) {
      topElement = tempElement
    }
  }
}

function scrollToTopElement () {
  if (topElement) {
    topElement.scrollIntoView(true)
  }
}

// General functions

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

function remToPx (rem) {
  return rem * parseFloat(getComputedStyle(document.body).fontSize)
}

function pxToRem (px) {
  return px / parseFloat(getComputedStyle(document.body).fontSize)
}

function differenceIsAlmostZero (x, y) {
  const difference = 0.01
  return Math.abs(x - y) < difference
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
const RESIZE_DEBOUNCE_MS = 150
let lastScroll = 0
let topElement

const parallaxElements = selectParallaxElements()
const initialPositions = getParallaxElementsInitialYPositionInRems(
  parallaxElements
)
let parallaxScrollParameters = getParallaxScrollParameters(
  parallaxElements,
  initialPositions
)
console.log(parallaxScrollParameters)

window.addEventListener('resize', debounce(() => {
  console.log('DEBOUNCING RESIZE !!!!!')
  parallaxScrollParameters = getParallaxScrollParameters(
    parallaxElements,
    initialPositions
  )
  applyParallax(parallaxElements, parallaxScrollParameters)
  scrollToTopElement()
}, RESIZE_DEBOUNCE_MS))

window.addEventListener('scroll', function (e) {
  applyParallax(parallaxElements, parallaxScrollParameters)
})

window.addEventListener('scroll', debounce(() => {
  console.log('DEBOUNCING SCROLL!!!!!')
  applyParallaxMoveEnd(parallaxElements, parallaxScrollParameters, MIN_SCROLL_PX)
  getTopElementInViewport()
}, SCROLL_DEBOUNCE_MS))


// Marker to understand general layout. DELETE UNDER THIS LINE
window.addEventListener('scroll', function (e) { showOffsetMarker() })
// DELETE ABOVE THIS LINE


console.log('Parallax script end')
