// Element selector //

function selectParallaxElements () {
  return Array.from(document.querySelectorAll('.parallax'))
}

// Responsive scroll flags calculation //

function getParallaxElementsYPosition (elementsArray) {
  const elementsYPositions = []
  const scrolled = Math.floor(window.pageYOffset)
  elementsArray.forEach(element => {
    const correctedTop = getElementYPosition({
      element: element,
      scrolled: scrolled
    })
    elementsYPositions.push(correctedTop)
  })
  return elementsYPositions
}

function getElementYPosition ({ element, scrolled }) {
  const boundingRect = element.getBoundingClientRect()
  const currentTranslateStateString = getCurrentTranslateStateString(element)
  const translatedY = getValuesFromTransformString(currentTranslateStateString).y
  return boundingRect.top + scrolled - translatedY
}

function getCurrentTranslateStateString (element) {
  const translateRegex = /translate3d\(.*\)/
  const currentTransform = element.style.transform
  let matchArray
  if (currentTransform) {
    matchArray = currentTransform.match(translateRegex)
  } else {
    return ''
  }
  if (matchArray) {
    return matchArray[0]
  } else {
    return ''
  }
}

function getValuesFromTransformString (transformString) {
  const intRegex = /-*(\d+.)*\d+px/g
  if (transformString) {
    const translateArr = transformString.match(intRegex).map((x) => parseFloat(x))
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
        // case 'p--fix':
        //   parameters.fix = getParallaxFixParameters(elementObject)
        //   break
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

  moveParameters.endLimits = { low: minStartY, high: maxEndY }
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
    xParameters.maxDistance = getXMaxDistance({
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

function getXMaxDistance ({ element, boundingRect, xMoveData }) {
  const elementWidth = boundingRect.width
  const windowWidth = window.innerWidth
  const xDistance = (xMoveData.viewwidthDuration / 100) * windowWidth
  const distanceSign = getProductSign(1, xDistance)
  return xDistance - distanceSign * elementWidth / 2
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
  growParameters.widthEndScale = growData.widthEndScale
  growParameters.heightEndScale = growData.heightEndScale
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
  const growDataString = element.dataset.grow
  return JSON.parse(growDataString)
}

// function getParallaxFixParameters ({
//   element,
//   elementInitialPosition,
//   scrollLimits,
//   parallaxRangeExtra
// }) {
//   const top = elementInitialPosition
//   const scrolled = Math.floor(window.pageYOffset)
//   const fixData = getParallaxFixData(element)
//   const fixParameters = {}
//   fixParameters.startY = getStartScroll({
//     top: top,
//     viewheightAnticipation: 0,
//     scrollLimits: scrollLimits
//   })
//   fixParameters.endY = getEndScroll({
//     axisStart: fixParameters.startY,
//     parallaxData: fixData,
//     scrollLimits: scrollLimits
//   })
//   fixParameters.parentYPosition = getParentYPosition({
//     element: element,
//     scrolled: scrolled
//   })
//   const lowLimit = correctToRange({
//     limits: scrollLimits,
//     value: (fixParameters.startY - parallaxRangeExtra)
//   })
//   const highLimit = correctToRange({
//     limits: scrollLimits,
//     value: (fixParameters.endY + parallaxRangeExtra)
//   })
//   fixParameters.limits = { low: lowLimit, high: highLimit }
//   return fixParameters
// }
//
// function getParallaxFixData (element) {
//   const fixDataString = element.dataset.fix
//   return JSON.parse(fixDataString)
// }
//
// function getParentYPosition ({ element, scrolled }) {
//   return getElementYPosition({
//     element: element.parentNode,
//     scrolled: scrolled
//   })
// }

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
      // case 'fix':
      //   parallaxFix(elementObject)
      //   break
    }
  }
}

function getNameOfParallaxFunction (className) {
  const parallaxClassHyphens = '--'
  return className.split(parallaxClassHyphens)[1]
}

function applyParallaxToAll (elementsArray, parametersArray) {
  const scrolled = Math.floor(window.pageYOffset)
  applyParallaxFade({
    elementsArray: elementsArray,
    parametersArray: parametersArray,
    scrolled: scrolled
  })
  applyParallaxMove({
    elementsArray: elementsArray,
    parametersArray: parametersArray,
    scrolled: scrolled
  })
  applyParallaxGrow({
    elementsArray: elementsArray,
    parametersArray: parametersArray,
    scrolled: scrolled
  })
  // applyParallaxFix({
  //   elementsArray: elementsArray,
  //   parametersArray: parametersArray,
  //   scrolled: scrolled
  // })
}

function applyParallaxMove ({ elementsArray, parametersArray, scrolled }) {
  elementsArray.forEach((element, index) => {
    if (hasClass(element, 'p--move')) {
      parallaxMove({
        element: element,
        parameters: parametersArray[index].move,
        scrolled: scrolled
      })
    }
  })
}

function applyParallaxFade ({ elementsArray, parametersArray, scrolled }) {
  elementsArray.forEach((element, index) => {
    if (hasClass(element, 'p--fade')) {
      parallaxFade({
        element: element,
        parameters: parametersArray[index].fade,
        scrolled: scrolled
      })
    }
  })
}

function applyParallaxGrow ({ elementsArray, parametersArray, scrolled }) {
  elementsArray.forEach((element, index) => {
    if (hasClass(element, 'p--grow')) {
      parallaxGrow({
        element: element,
        parameters: parametersArray[index].grow,
        scrolled: scrolled
      })
    }
  })
}

// function applyParallaxFix ({ elementsArray, parametersArray, scrolled }) {
//   elementsArray.forEach((element, index) => {
//     if (hasClass(element, 'p--fix')) {
//       parallaxFix({
//         element: element,
//         parameters: parametersArray[index].fix,
//         scrolled: scrolled
//       })
//     }
//   })
// }


// Parallax main move functions //

function parallaxMove ({ element, parameters, scrolled }) {
  const currentTranslateStateString = getCurrentTranslateStateString(element)
  const translateState = getValuesFromTransformString(currentTranslateStateString)
  const translateDistances = getTranslateDistances({
    element: element,
    parameters: parameters,
    scrolled: scrolled,
    translateState: translateState
  })
  const translateString = makeTranslateString(translateDistances)
  modifyTransformState({
    element: element,
    currentPropertyStateString: currentTranslateStateString,
    newPropertyString: translateString
  })
}

function getTranslateDistances ({
  element,
  parameters,
  scrolled,
  translateState
}) {
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

function modifyTransformState ({
  element,
  currentPropertyStateString,
  newPropertyString
}) {
  const currentTransform = element.style.transform
  let newTransformString
  if (!currentTransform) {
    newTransformString = newPropertyString
  } else if (
    currentTransform &&
    currentPropertyStateString === ''
  ) {
    newTransformString =
      currentTransform +
      ' ' +
      newPropertyString
  } else {
    newTransformString = currentTransform.replace(
      currentPropertyStateString,
      newPropertyString
    )
  }
  element.style.transform = newTransformString
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
        hasClass(element, 'p--move-end') &&
        hasClass(element, 'p--move') &&
        inRange({
          limits: moveParameters.endLimits,
          value: scrolled
        })
      ) {
        parallaxMoveEnd({
          element: element,
          moveParameters: moveParameters,
          deltaScroll: deltaScroll,
          scrolled: scrolled,
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
  scrolled,
  endTransitionTime
}) {
  const endParameters = getParallaxEndParameters({
    element: element,
    moveParameters: moveParameters,
    deltaScroll: deltaScroll
  })
  const maxMove = getMaxMove(moveParameters)
  const currentTranslateStateString = getCurrentTranslateStateString(element)
  const translateState = getValuesFromTransformString(currentTranslateStateString)
  const endTranslateDistances = getEndTranslateDistances({
    translateState: translateState,
    endParameters: endParameters,
    maxMove: maxMove,
    moveParameters: moveParameters,
    deltaScroll: deltaScroll,
    scrolled: scrolled
  })
  const endTranslateString = makeTranslateString(endTranslateDistances)
  moveEndByDistances({
    element: element,
    currentTranslateStateString: currentTranslateStateString,
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
  moveParameters,
  deltaScroll,
  scrolled
}) {
  const x = getAxisEndTranslateDistance({
    axisTranslateState: translateState.x,
    axisEndParameters: endParameters.x,
    axisMaxMove: maxMove.x,
    axisParameters: moveParameters.x,
    deltaScroll: deltaScroll,
    scrolled: scrolled
  })
  const y = getAxisEndTranslateDistance({
    axisTranslateState: translateState.y,
    axisEndParameters: endParameters.y,
    axisMaxMove: maxMove.y,
    axisParameters: moveParameters.y,
    deltaScroll: deltaScroll,
    scrolled: scrolled
  })
  return { x: x, y: y }
}

function getAxisEndTranslateDistance ({
  axisTranslateState,
  axisEndParameters,
  axisMaxMove,
  axisParameters,
  deltaScroll,
  scrolled
}) {
  if (
    inRange({
      limits: {
        low: axisParameters.startY,
        high: axisParameters.endY
      },
      value: scrolled
    })
  ) {
    const endSign = getProductSign(axisMaxMove, deltaScroll)
    const endAdded = axisTranslateState + endSign * axisEndParameters
    return getDistanceInRange(endAdded, axisMaxMove)
  } else {
    return axisTranslateState
  }
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
  currentTranslateStateString,
  endTranslateString,
  endTransitionTime
}) {
  element.style.transition = 'transform ' + endTransitionTime + 'ms ease-out'
  modifyTransformState({
    element: element,
    currentPropertyStateString: currentTranslateStateString,
    newPropertyString: endTranslateString
  })
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
  let widthScale
  let heightScale
  if (scrolled <= parameters.startY) {
    widthScale = 1
    heightScale = 1
  } else if (scrolled >= parameters.endY) {
    widthScale = parameters.widthEndScale
    heightScale = parameters.heigthEndScale
  } else {
    const yAdvance = scrolled - parameters.startY
    widthScale = getScale({
      advance: yAdvance,
      rangeSize: parameters.yRangeSize,
      endScale: parameters.widthEndScale
    })
    heightScale = getScale({
      advance: yAdvance,
      rangeSize: parameters.yRangeSize,
      endScale: parameters.heightEndScale
    })
  }
  const scaleString = makeScaleString({
    widthScale: widthScale,
    heightScale: heightScale
  })
  const currentScaleStateString = getCurrentScaleStateString(element)
  modifyTransformState({
    element: element,
    currentPropertyStateString: currentScaleStateString,
    newPropertyString: scaleString
  })
}

function getScale ({ advance, rangeSize, endScale }) {
  const advancePercent = advance / rangeSize
  const scaleRangeSize = endScale - 1
  let scale = scaleRangeSize * advancePercent + 1
  if (scale < 0) {
    scale = 0
  }
  return scale
}

function makeScaleString ({
  widthScale,
  heightScale
}) {
  const x = roundToTwoDecimals(widthScale)
  const y = roundToTwoDecimals(heightScale)
  return `scale3d(${x}, ${y}, 1)`
}

function getCurrentScaleStateString (element) {
  const scaleRegex = /scale3d\(.*\)/
  const currentTransform = element.style.transform
  if (currentTransform) {
    return currentTransform.match(scaleRegex)
  } else {
    return ''
  }
}

// Parallax fix functions //

// function parallaxFix ({ element, parameters, scrolled }) {
//   if ((scrolled <= parameters.startY) ||
//     (scrolled >= parameters.endY)) {
//     unfixElement({
//       element: element,
//       parameters: parameters,
//       scrolled: scrolled
//     })
//   } else {
//     fixElement({
//       element: element,
//       parameters: parameters
//     })
//   }
// }
//
// function unfixElement ({ element, parameters, scrolled }) {
//   if (hasClass(element, 'p--fix-on')) {
//     console.log('unfixing')
//     console.log(scrolled)
//     const elementYPositionInParent = getElementYPositionInParent({
//       element: element,
//       parameters: parameters,
//       scrolled: scrolled
//     })
//     setNewYPosition({
//       element: element,
//       position: 'absolute',
//       yTranslate: elementYPositionInParent
//     })
//     element.classList.remove('p--fix-on')
//   }
// }
//
// function getElementYPositionInParent ({ element, parameters, scrolled }) {
//   const elementYPosition = getElementYPosition({
//     element: element,
//     scrolled: scrolled
//   })
//   return elementYPosition - parameters.parentYPosition
// }
//
// function setNewYPosition ({ element, position, yTranslate }) {
//   console.log('setting', position, 'to', yTranslate)
//   const currentTranslateStateString = getCurrentTranslateStateString(element)
//   const translateString = makeTranslateString({ x: 0, y: yTranslate })
//   element.style.position = position
//   modifyTransformState({
//     element: element,
//     currentPropertyStateString: currentTranslateStateString,
//     newPropertyString: translateString
//   })
// }
//
// function fixElement ({ element, parameters }) {
//   if (!(hasClass(element, 'p--fix-on'))) {
//     console.log('fixing')
//     console.log(Math.floor(window.pageYOffset))
//     const elementYPositionInViewport = element.getBoundingClientRect().top
//     setNewYPosition({
//       element: element,
//       position: 'fixed',
//       yTranslate: elementYPositionInViewport
//     })
//     element.classList.add('p--fix-on')
//   }
// }

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

const animationThrottle = (func, limit) => {
  let inThrottle = false
  return function () {
    if (!inThrottle) {
      func()
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

function hasClass (element, className) {
  return element.classList.contains(className)
}

function vhToPx (vh) {
  return vh / 100 * window.innerHeight
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

function roundToTwoDecimals (number) {
  return Math.round((number + Number.EPSILON) * 100) / 100
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
const SCROLL_DEBOUNCE_MS = 90
const SCROLL_THROTTLE_MS = 50
const RESIZE_DEBOUNCE_MS = 150
const MOVE_END_TRANSITION_MS = 300
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
    console.log('new positions')
    console.log(elementPositions)
    parallaxScrollParameters = getParallaxScrollParameters({
      elementsArray: parallaxElements,
      elementsInitialPositions: elementPositions,
      parallaxRangeExtraVh: PARALLAX_RANGE_EXTRA_VH
    })
    console.log('new parameters')
    applyParallaxToAll(parallaxElements, parallaxScrollParameters)
    console.log('parallaxApplied')
    scrollToTopElement()
  }
  lastSize = getWindowSize()
}, RESIZE_DEBOUNCE_MS))

window.addEventListener('scroll', animationThrottle(() => {
  applyParallaxInLimits({
    elementsArray: parallaxElements,
    parametersArray: parallaxScrollParameters,
    validParallaxScrollClasses: VALID_PARALLAX_SCROLL_CLASSES
  })
}, SCROLL_THROTTLE_MS))

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
