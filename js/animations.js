// Element selector //

function selectParallaxElements () {
  return Array.from(document.querySelectorAll('.parallax'))
}

// Responsive scroll flags calculation //

function getParallaxElementsYPosition (elementsArray) {
  const elementsYPositions = []
  const scrolled = Math.floor(window.pageYOffset)
  elementsArray.forEach(element => {
    const boundingRect = element.getBoundingClientRect()
    const translatedY = getCurrentTranslateState(element).y
    const correctedTop = boundingRect.top + scrolled - translatedY
    elementsYPositions.push(correctedTop)
  })
  return elementsYPositions
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

function getParallaxScrollParameters ({
  elementsArray,
  elementsInitialPositions,
  parallaxRangeExtraVh
}) {
  const scrollParameters = []
  const scrollMin = 0
  const scrollMax = getMaxScroll()
  const scrollLimits = { low: scrollMin, high: scrollMax }
  const parallaxRangeExtraPx = vhToPx(parallaxRangeExtraVh)
  elementsArray.forEach((element, index) => {
    const parameters = {}
    const elementClasses = Array.from(element.classList)
    const elementObject = {
      element: element,
      elementInitialPosition: elementsInitialPositions[index],
      scrollLimits: scrollLimits,
      parallaxRangeExtra: parallaxRangeExtraPx
    }
    elementClasses.forEach((className) => {
      switch (className) {
        case 'p--move':
          parameters.move = getParallaxMoveParameters(elementObject)
          break
        case 'p--fade':
          parameters.fade = getParallaxFadeParameters(elementObject)
          break
        case 'p--grow':
          parameters.grow = getParallaxGrowParameters(elementObject)
          break
      }
    })
    scrollParameters.push(parameters)
  })
  return scrollParameters
}

function getMaxScroll () {
  const limit = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  )
  return limit
}

function getParallaxMoveParameters ({
  element,
  elementInitialPosition,
  scrollLimits,
  parallaxRangeExtra
}) {
  const boundingRect = element.getBoundingClientRect()
  const moveData = getParallaxMoveData(element)
  const moveParameters = {}
  moveParameters.y = getMoveYParameters({
    elementInitialPosition: elementInitialPosition,
    boundingRect: boundingRect,
    moveData: moveData,
    scrollLimits: scrollLimits
  })
  moveParameters.x = getMoveXParameters({
    elementInitialPosition: elementInitialPosition,
    element: element,
    boundingRect: boundingRect,
    moveData: moveData,
    scrollLimits: scrollLimits
  })
  const minStartY = Math.min(
    moveParameters.x.startY,
    moveParameters.y.startY
  )
  const lowLimit = correctToRange({
    limits: scrollLimits,
    value: (minStartY - parallaxRangeExtra)
  })
  const maxEndY = Math.max(
    moveParameters.x.endY,
    moveParameters.y.endY
  )
  const highLimit = correctToRange({
    limits: scrollLimits,
    value: (maxEndY + parallaxRangeExtra)
  })

  moveParameters.limits = { low: lowLimit, high: highLimit }
  return moveParameters
}

function getParallaxMoveData (element) {
  const xMoveString = element.dataset.xmove
  const xMoveData = JSON.parse(xMoveString)
  const yMoveString = element.dataset.ymove
  const yMoveData = JSON.parse(yMoveString)
  return { x: xMoveData, y: yMoveData }
}

function getMoveYParameters ({
  elementInitialPosition,
  boundingRect,
  moveData,
  scrollLimits
}) {
  const yMoveData = moveData.y
  const yParameters = {}
  yParameters.isMoved = yMoveData.isMoved
  if (yParameters.isMoved) {
    const top = elementInitialPosition
    yParameters.startY = getStartScroll({
      top: top,
      viewheightAnticipation: yMoveData.viewheightAnticipation,
      scrollLimits: scrollLimits
    })
    yParameters.endY = getEndScroll({
      axisStart: yParameters.startY,
      parallaxData: yMoveData,
      scrollLimits: scrollLimits
    })
    yParameters.yRangeSize = (yParameters.endY - yParameters.startY)
    yParameters.rate = yMoveData.rate
    yParameters.maxDistance = yParameters.yRangeSize * yParameters.rate
    yParameters.endAccumulate = 0
  } else {
    yParameters.startY = scrollLimits.high
    yParameters.endY = scrollLimits.low
  }
  return yParameters
}

function getStartScroll ({
  top,
  viewheightAnticipation,
  scrollLimits
}) {
  const anticipation = vhToPx(viewheightAnticipation)
  const startY = top - anticipation
  return correctToRange({
    limits: scrollLimits,
    value: startY
  })
}

function getEndScroll ({
  axisStart,
  parallaxData,
  scrollLimits
}) {
  if (parallaxData.viewheightDuration === 0) {
    return scrollLimits.high
  } else {
    const duration = vhToPx(parallaxData.viewheightDuration)
    const endY = axisStart + duration
    return correctToRange({
      limits: scrollLimits,
      value: endY
    })
  }
}

function getMoveXParameters ({
  elementInitialPosition,
  element,
  boundingRect,
  moveData,
  scrollLimits
}) {
  const xMoveData = moveData.x
  const xParameters = {}
  xParameters.isMoved = xMoveData.isMoved
  if (xParameters.isMoved) {
    const top = elementInitialPosition
    xParameters.startY = getStartScroll({
      top: top,
      viewheightAnticipation: xMoveData.viewheightAnticipation,
      scrollLimits: scrollLimits
    })
    xParameters.endY = getEndScroll({
      axisStart: xParameters.startY,
      parallaxData: xMoveData,
      scrollLimits: scrollLimits
    })
    xParameters.yRangeSize = (xParameters.endY - xParameters.startY)
    xParameters.maxDistance = getXCenterEnd({
      element: element,
      boundingRect: boundingRect,
      xMoveData: xMoveData
    })
    xParameters.rate = xParameters.maxDistance / xParameters.yRangeSize
    xParameters.endAccumulate = 0
  } else {
    xParameters.startY = scrollLimits.high
    xParameters.endY = scrollLimits.low
  }
  return xParameters
}

function getXCenterEnd ({ element, boundingRect, xMoveData }) {
  const elementWidth = boundingRect.width
  const windowWidth = window.innerWidth
  const initial = parseFloat(getComputedStyle(element).left)
  const finalXPercent = xMoveData.centerEndAtViewidth / 100
  return finalXPercent * windowWidth - elementWidth / 2 - initial
}

function getParallaxFadeParameters ({
  element,
  elementInitialPosition,
  scrollLimits,
  parallaxRangeExtra
}) {
  const top = elementInitialPosition
  const fadeData = getParallaxFadeData(element)
  const fadeParameters = {}
  fadeParameters.startY = getStartScroll({
    top: top,
    viewheightAnticipation: fadeData.viewheightAnticipation,
    scrollLimits: scrollLimits
  })
  fadeParameters.endY = getEndScroll({
    axisStart: fadeParameters.startY,
    parallaxData: fadeData,
    scrollLimits: scrollLimits
  })
  fadeParameters.yRangeSize = (fadeParameters.endY - fadeParameters.startY)
  const deltaOpacity = fadeData.endOpacity - fadeData.initialOpacity
  fadeParameters.rate = deltaOpacity / fadeParameters.yRangeSize
  fadeParameters.initialOpacity = fadeData.initialOpacity
  fadeParameters.endOpacity = fadeData.endOpacity
  const lowLimit = correctToRange({
    limits: scrollLimits,
    value: (fadeParameters.startY - parallaxRangeExtra)
  })
  const highLimit = correctToRange({
    limits: scrollLimits,
    value: (fadeParameters.endY + parallaxRangeExtra)
  })
  fadeParameters.limits = { low: lowLimit, high: highLimit }
  return fadeParameters
}

function getParallaxFadeData (element) {
  const fadeString = element.dataset.fade
  return JSON.parse(fadeString)
}

function getParallaxGrowParameters ({
  element,
  elementInitialPosition,
  scrollLimits,
  parallaxRangeExtra
}) {
  const top = elementInitialPosition
  const growData = getParallaxGrowData(element)
  const growParameters = {}
  growParameters.startY = getStartScroll({
    top: top,
    viewheightAnticipation: growData.viewheightAnticipation,
    scrollLimits: scrollLimits
  })
  growParameters.endY = getEndScroll({
    axisStart: growParameters.startY,
    parallaxData: growData,
    scrollLimits: scrollLimits
  })
  growParameters.yRangeSize = (growParameters.endY - growParameters.startY)
  growParameters.widthRate = growData.widthRate
  growParameters.heightRate = growData.heightRate
  growParameters.initialWidth = parseFloat(getComputedStyle(element).width)
  growParameters.initialHeight = parseFloat(getComputedStyle(element).height)
  const lowLimit = correctToRange({
    limits: scrollLimits,
    value: (growParameters.startY - parallaxRangeExtra)
  })
  const highLimit = correctToRange({
    limits: scrollLimits,
    value: (growParameters.endY + parallaxRangeExtra)
  })
  growParameters.limits = { low: lowLimit, high: highLimit }
  return growParameters
}

function getParallaxGrowData (element) {
  const growString = element.dataset.grow
  return JSON.parse(growString)
}

// Apply parallax scroll and resize functions //

function applyParallaxInLimits ({
  elementsArray,
  parametersArray,
  validParallaxScrollClasses
}) {
  const scrolled = Math.floor(window.pageYOffset)
  elementsArray.forEach((element, index) => {
    const elementParameters = parametersArray[index]
    applyParallaxToElementInLimits({
      element: element,
      parameters: elementParameters,
      scrolled: scrolled,
      validParallaxScrollClasses: validParallaxScrollClasses
    })
  })
}

function applyParallaxToElementInLimits ({
  element,
  parameters,
  scrolled,
  validParallaxScrollClasses
}) {
  const elementClasses = Array.from(element.classList)
  elementClasses.forEach((className) => {
    if (validParallaxScrollClasses.includes(className)) {
      const parallaxFunctionName = getNameOfParallaxFunction(className)
      applyParallaxFunctionIfElementInRange({
        element: element,
        parameters: parameters,
        scrolled: scrolled,
        parallaxFunctionName: parallaxFunctionName
      })
    }
  })
}

function applyParallaxFunctionIfElementInRange ({
  element,
  parameters,
  scrolled,
  parallaxFunctionName
}) {
  if (
    inRange({
      limits: parameters[parallaxFunctionName].limits,
      value: scrolled
    })
  ) {
    const elementObject = {
      element: element,
      parameters: parameters[parallaxFunctionName],
      scrolled: scrolled
    }
    switch (parallaxFunctionName) {
      case 'move':
        parallaxMove(elementObject)
        break
      case 'fade':
        parallaxFade(elementObject)
        break
      case 'grow':
        parallaxGrow(elementObject)
        break
    }
  }
}

function getNameOfParallaxFunction (className) {
  const parallaxClassHyphens = '--'
  return className.split(parallaxClassHyphens)[1]
}

function applyParallaxToAll (elementsArray, parametersArray) {
  const scrolled = Math.floor(window.pageYOffset)
  applyParallaxFade(elementsArray, parametersArray, scrolled)
  applyParallaxMove(elementsArray, parametersArray, scrolled)
  applyParallaxGrow(elementsArray, parametersArray, scrolled)
}

function applyParallaxMove (elementsArray, parametersArray, scrolled) {
  elementsArray.forEach((element, index) => {
    if (hasParallaxEffect(element, 'p--move')) {
      parallaxMove({
        element: element,
        parameters: parametersArray[index].move,
        scrolled: scrolled
      })
    }
  })
}

function applyParallaxFade (elementsArray, parametersArray, scrolled) {
  elementsArray.forEach((element, index) => {
    if (hasParallaxEffect(element, 'p--fade')) {
      parallaxFade({
        element: element,
        parameters: parametersArray[index].fade,
        scrolled: scrolled
      })
    }
  })
}

function applyParallaxGrow (elementsArray, parametersArray, scrolled) {
  elementsArray.forEach((element, index) => {
    if (hasParallaxEffect(element, 'p--grow')) {
      parallaxGrow({
        element: element,
        parameters: parametersArray[index].grow,
        scrolled: scrolled
      })
    }
  })
}

function hasParallaxEffect (element, typeOfEffect) {
  return Array.from(element.classList).includes(typeOfEffect)
}

// Parallax main move functions //

function parallaxMove ({ element, parameters, scrolled }) {
  const translateDistances = getTranslateDistances({
    element: element,
    parameters: parameters,
    scrolled: scrolled
  })
  const translateString = makeTranslateString(translateDistances)
  moveElementByDistances(element, translateString)
}

function getTranslateDistances ({
  element,
  parameters,
  scrolled
}) {
  const translateState = getCurrentTranslateState(element)
  const x = getTranslateDistance({
    axis: 'x',
    axisParameters: parameters.x,
    axisTranslateState: translateState.x,
    scrolled: scrolled
  })
  const y = getTranslateDistance({
    axis: 'y',
    axisParameters: parameters.y,
    axisTranslateState: translateState.y,
    scrolled: scrolled
  })
  return { x: x, y: y }
}

function getTranslateDistance ({
  axis,
  axisParameters,
  axisTranslateState,
  scrolled
}) {
  if (!axisParameters.isMoved) {
    return axisTranslateState
  } else if (scrolled <= axisParameters.startY) {
    axisParameters.endAccumulate = 0
    return 0
  } else if (scrolled >= axisParameters.endY) {
    axisParameters.endAccumulate = 0
    return axisParameters.maxDistance
  } else {
    return calculateDistance({
      axis: axis,
      axisParameters: axisParameters,
      scrolled: scrolled
    })
  }
}

function calculateDistance ({ axis, axisParameters, scrolled }) {
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

function makeTranslateString (translateDistances) {
  const x = Math.floor(translateDistances.x)
  const y = Math.floor(translateDistances.y)
  return `translate3d(${x}px, ${y}px, 0px)`
}

function moveElementByDistances (element, translateString) {
  element.style.transform = translateString
}

// Parallax smooth ending functions //

function applyParallaxMoveEnd ({
  elementsArray,
  parametersArray,
  minScroll,
  endTransitionTime
}) {
  const scrolled = Math.floor(window.pageYOffset)
  const deltaScroll = getDeltaScroll(scrolled)
  if (Math.abs(deltaScroll) > minScroll) {
    elementsArray.forEach((element, index) => {
      const moveParameters = parametersArray[index].move
      if (
        hasParallaxEffect(element, 'p--move-end') &&
        hasParallaxEffect(element, 'p--move') &&
        inRange({
          limits: moveParameters.limits,
          value: scrolled
        })
      ) {
        parallaxMoveEnd({
          element: element,
          moveParameters: moveParameters,
          deltaScroll: deltaScroll,
          endTransitionTime: endTransitionTime
        })
      }
    })
  }
}

function getDeltaScroll (scrolled) {
  const deltaScroll = scrolled - lastScroll // global
  lastScroll = scrolled // Global
  return deltaScroll
}

function parallaxMoveEnd ({
  element,
  moveParameters,
  deltaScroll,
  endTransitionTime
}) {
  const endParameters = getParallaxEndParameters({
    element: element,
    moveParameters: moveParameters,
    deltaScroll: deltaScroll
  })
  const maxMove = getMaxMove(moveParameters)
  const translateState = getCurrentTranslateState(element)
  const endTranslateDistances = getEndTranslateDistances({
    translateState: translateState,
    endParameters: endParameters,
    maxMove: maxMove,
    deltaScroll: deltaScroll
  })
  const endTranslateString = makeTranslateString(endTranslateDistances)
  moveEndByDistances({
    element: element,
    endTranslateString: endTranslateString,
    endTransitionTime: endTransitionTime
  })
  accumulateEndDistance({
    moveParameters: moveParameters,
    translateState: translateState,
    maxMove: maxMove,
    endTranslateDistances: endTranslateDistances
  })
}

function getParallaxEndParameters ({
  element,
  moveParameters,
  deltaScroll
}) {
  const endData = getParallaxEndData(element)
  const endParameters = {}
  endParameters.x = getProportionalEnd({
    axisMoveParameters: moveParameters.x,
    deltaScroll: deltaScroll,
    endData: endData
  })
  endParameters.y = getProportionalEnd({
    axisMoveParameters: moveParameters.y,
    deltaScroll: deltaScroll,
    endData: endData
  })
  return endParameters
}

function getParallaxEndData (element) {
  const endString = element.dataset.end
  return JSON.parse(endString)
}

function getProportionalEnd ({ axisMoveParameters, deltaScroll, endData }) {
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

function getEndTranslateDistances ({
  translateState,
  endParameters,
  maxMove,
  deltaScroll
}) {
  const x = getAxisEndTranslateDistance({
    axisTranslateState: translateState.x,
    axisEndParameters: endParameters.x,
    axisMaxMove: maxMove.x,
    deltaScroll: deltaScroll
  })
  const y = getAxisEndTranslateDistance({
    axisTranslateState: translateState.y,
    axisEndParameters: endParameters.y,
    axisMaxMove: maxMove.y,
    deltaScroll: deltaScroll
  })
  return { x: x, y: y }
}

function getAxisEndTranslateDistance ({
  axisTranslateState,
  axisEndParameters,
  axisMaxMove,
  deltaScroll
}) {
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

function moveEndByDistances ({
  element,
  endTranslateDistances,
  endTranslateString,
  endTransitionTime
}) {
  element.style.transition = 'transform ' + endTransitionTime + 'ms ease-out'
  element.style.transform = endTranslateString
  flushCss(element)
  element.style.transition = ''
}

function accumulateEndDistance ({
  moveParameters,
  translateState,
  maxMove,
  endTranslateDistances
}) {
  moveParameters.x.endAccumulate += (endTranslateDistances.x - translateState.x)
  moveParameters.y.endAccumulate += (endTranslateDistances.y - translateState.y)
}

// Parallax fade functions //

function parallaxFade ({ element, parameters, scrolled }) {
  let opacity
  if (scrolled <= parameters.startY) {
    opacity = parameters.initialOpacity
  } else if (scrolled >= parameters.endY) {
    opacity = parameters.endOpacity
  } else {
    opacity = getOpacity(parameters, scrolled)
  }
  element.style.opacity = '' + opacity
}

function getOpacity (parameters, scrolled) {
  const yAdvance = scrolled - parameters.startY
  return parameters.initialOpacity + yAdvance * parameters.rate
}

// Parallax grow functions //

function parallaxGrow ({ element, parameters, scrolled }) {
  let width
  let height
  if (scrolled <= parameters.startY) {
    width = parameters.initialWidth
    height = parameters.initialHeight
  } else if (scrolled >= parameters.endY) {
    width = getDimension({
      baseDimension: parameters.initialWidth,
      advance: parameters.yRangeSize,
      rangeSize: parameters.yRangeSize,
      rate: parameters.widthRate
    })
    height = getDimension({
      baseDimension: parameters.initialHeight,
      advance: parameters.yRangeSize,
      rangeSize: parameters.yRangeSize,
      rate: parameters.heightRate
    })
  } else {
    const yAdvance = scrolled - parameters.startY
    width = getDimension({
      baseDimension: parameters.initialWidth,
      advance: yAdvance,
      rangeSize: parameters.yRangeSize,
      rate: parameters.widthRate
    })
    height = getDimension({
      baseDimension: parameters.initialHeight,
      advance: yAdvance,
      rangeSize: parameters.yRangeSize,
      rate: parameters.heightRate
    })
  }
  element.style.width = width + 'px'
  element.style.height = height + 'px'
}

function getDimension ({ baseDimension, advance, rangeSize, rate }) {
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
      topElement = tempElement // Global
    }
  }
}

function scrollToTopElement () {
  if (topElement) {
    topElement.scrollIntoView(true)
  }
}

// Avoid resize event when url bar gets added

function isValidResize () {
  const validResizePercent = 0.1
  const deltaSize = getDeltaWindowSize()
  return deltaSize.width > 0 || deltaSize.height > validResizePercent
}

function getDeltaWindowSize () {
  const size = getWindowSize()
  const deltaWidth =
    Math.abs(size.width - lastSize.width) / // global
    Math.min(size.width, lastSize.width) // global
  const deltaHeight =
    Math.abs(size.height - lastSize.height) / // global
    Math.min(size.height, lastSize.height) // global
  return { width: deltaWidth, height: deltaHeight }
}

function getWindowSize () {
  const size = {}
  size.width = window.innerWidth
  size.height = window.innerHeight
  return size
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

function vhToPx (vh) {
  return vh / 100 * window.innerHeight
}

function inRange ({ limits: { low, high }, value }) {
  return value >= low && value <= high
}

function correctToRange ({ limits: { low, high }, value }) {
  if (value <= low) {
    return low
  } else if (value >= high) {
    return high
  } else {
    return value
  }
}

// Marker to understand general layout. DELETE UNDER THIS LINE

function showOffsetMarker () {
  const scrolled = Math.floor(window.pageYOffset)
  const marker = document.querySelector('.y-offset-marker')
  marker.textContent = scrolled
}
// DELETE ABOVE THIS LINE



// Run script

console.log('Load Parallax script')
console.log('Initial Scroll is ' + window.pageYOffset)

const MIN_SCROLL_PX = 100
const SCROLL_DEBOUNCE_MS = 150
const RESIZE_DEBOUNCE_MS = 150
const MOVE_END_TRANSITION_MS = 500
const PARALLAX_RANGE_EXTRA_VH = 25
const VALID_PARALLAX_SCROLL_CLASSES = ['p--fade', 'p--move', 'p--grow']
let lastScroll = 0
let topElement
let lastSize = getWindowSize()

const parallaxElements = selectParallaxElements()
console.log(parallaxElements)
let elementPositions = getParallaxElementsYPosition(
  parallaxElements
)
console.log('Positions')
console.log(elementPositions)
let parallaxScrollParameters = getParallaxScrollParameters({
  elementsArray: parallaxElements,
  elementsInitialPositions: elementPositions,
  parallaxRangeExtraVh: PARALLAX_RANGE_EXTRA_VH
})
console.log('Parameters')
console.log(parallaxScrollParameters)

window.addEventListener('resize', debounce(() => {
  if (isValidResize()) {
    console.log('Valid resize')
    elementPositions = getParallaxElementsYPosition(
      parallaxElements
    )
    parallaxScrollParameters = getParallaxScrollParameters({
      elementsArray: parallaxElements,
      elementsInitialPositions: elementPositions,
      parallaxRangeExtraVh: PARALLAX_RANGE_EXTRA_VH
    })
    applyParallaxToAll(parallaxElements, parallaxScrollParameters)
    scrollToTopElement()
  }
  lastSize = getWindowSize()
}, RESIZE_DEBOUNCE_MS))

window.addEventListener('scroll', function (e) {
  applyParallaxInLimits({
    elementsArray: parallaxElements,
    parametersArray: parallaxScrollParameters,
    validParallaxScrollClasses: VALID_PARALLAX_SCROLL_CLASSES
  })
})

window.addEventListener('scroll', debounce(() => {
  applyParallaxMoveEnd({
    elementsArray: parallaxElements,
    parametersArray: parallaxScrollParameters,
    minScroll: MIN_SCROLL_PX,
    endTransitionTime: MOVE_END_TRANSITION_MS
  })
  getTopElementInViewport()
}, SCROLL_DEBOUNCE_MS))



// Marker to understand general layout. DELETE UNDER THIS LINE
window.addEventListener('scroll', function (e) { showOffsetMarker() })
// DELETE ABOVE THIS LINE


console.log('Parallax script end')
