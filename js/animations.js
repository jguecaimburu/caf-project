const homeAnimations = (function () {

  /*  GLOBALS
  ----------------------------------------------- */

  const DOM_ELEMENTS_DATA = animationData.values
  const SCROLL_INTERVAL_MS = 15
  const SCROLL_DEBOUNCE_MS = 100
  const RESIZE_DEBOUNCE_MS = 150
  const PARALLAX_RANGE_EXTRA_VH = 15
  const VALID_HEIGHT_RESIZE_PERCENT = 10
  let lastScroll = 0
  let topElement
  let lastScreenSize
  let maxScroll
  let scrollTimer
  const domElements = {}
  let scheduledAnimationFrame = false

  /*  CONSTRUCTION
  ----------------------------------------------- */

  function init () {
    setupParameters()
    console.log('Parameters set')
    console.log(domElements)
    setupEventListeners()
    scrollTimer = setInterval(tryToAnimateElementsInLimits, SCROLL_INTERVAL_MS)
  }

  function setupParameters () {
    lastScreenSize = getWindowSize()
    maxScroll = getMaxScroll()
    lastScroll = getScroll()
    const domElementsSelectors = Object.keys(DOM_ELEMENTS_DATA)
    buildDomElementsObject(domElementsSelectors)
  }

  function setupEventListeners () {
    window.addEventListener('resize', debounce(() => {
      if (isValidResize()) {
        updateParameters()
        updateWholePage()
        scrollToTopElement()
      }
      lastScreenSize = getWindowSize()
    }, RESIZE_DEBOUNCE_MS))

    window.addEventListener('scroll', debounce(() => {
      getTopElementInViewport()
    }, SCROLL_DEBOUNCE_MS))

    // Marker to understand general layout. DELETE UNDER THIS LINE
    window.addEventListener('scroll', function (e) { showOffsetMarker() })
    // DELETE ABOVE THIS LINE
  }

  /*  SETUP
  ----------------------------------------------- */

  function buildDomElementsObject (selectors) {
    selectors.forEach(selector => {
      domElements[selector] = setupElementParameters(selector)
    })
  }

  function setupElementParameters (selector) {
    const elementObject = {}
    elementObject.element = document.querySelector(selector)
    elementObject.animations = processAnimationData({
      selector: selector,
      element: elementObject.element
    })
    elementObject.limits = getAnimationScrollLimits(elementObject.animations)
    return elementObject
  }

  function processAnimationData ({ selector, element }) {
    const animationParameters = {}
    const yPosition = getElementYPosition(element)
    for (const animationType in DOM_ELEMENTS_DATA[selector]) {
      animationParameters[animationType] = {}
      animationParameters[animationType].scrollRange = getScrollRange({
        yPosition: yPosition,
        animationData: DOM_ELEMENTS_DATA[selector][animationType]
      })
      animationParameters[animationType].valueRange = getValueRange({
        animationData: DOM_ELEMENTS_DATA[selector][animationType],
        animationType: animationType,
        scrollRange: animationParameters[animationType].scrollRange
      })
    }
    return animationParameters
  }

  function getElementYPosition (element) {
    const boundingRect = element.getBoundingClientRect()
    const translatedY = getAxisTranslatedValue({
      element: element,
      axis: 'y'
    })
    return boundingRect.top + lastScroll - translatedY
  }

  function getAxisTranslatedValue ({ element, axis }) {
    const translate3dString = getTranslate3dString(element)
    const intRegex = /-*(\d+.)*\d+px/g
    if (translate3dString) {
      const translateValues =
        translate3dString.match(intRegex).map((x) => parseFloat(x))
      switch (axis) {
        case 'x':
          return translateValues[0]
        case 'y':
          return translateValues[1]
      }
    } else {
      return 0
    }
  }

  function getTranslate3dString (element) {
    const translate3dRegex = /translate3d\(.*\)/
    const currentTransform = element.style.transform
    let matchArray
    if (currentTransform) {
      matchArray = currentTransform.match(translate3dRegex)
    } else {
      return ''
    }
    if (matchArray) {
      return matchArray[0]
    } else {
      return ''
    }
  }

  function getScrollRange ({ yPosition, animationData }) {
    const scrollRange = {}
    scrollRange.start = getStartScroll({
      yPosition: yPosition,
      viewheightAnticipation: animationData.viewheightAnticipation
    })
    scrollRange.end = getEndScroll({
      startScroll: scrollRange.start,
      viewheightDuration: animationData.viewheightDuration
    })
    scrollRange.size = scrollRange.end - scrollRange.start
    return scrollRange
  }

  function getStartScroll ({ yPosition, viewheightAnticipation }) {
    const anticipation = vhToPx(viewheightAnticipation)
    const startScroll = yPosition - anticipation
    return correctToRange({
      limits: { low: 0, high: maxScroll },
      value: startScroll
    })
  }

  function getEndScroll ({ startScroll, viewheightDuration }) {
    const duration = vhToPx(viewheightDuration)
    const endScroll = startScroll + duration
    return correctToRange({
      limits: { low: 0, high: maxScroll },
      value: endScroll
    })
  }

  function getValueRange ({ animationData, animationType, scrollRange }) {
    const valueRange = {}
    switch (animationType) {
      case 'translateX':
        valueRange.start = 0
        valueRange.end = vwToPx(animationData.viewwidthDistance)
        valueRange.size = (valueRange.end - valueRange.start)
        break
      case 'translateY':
        valueRange.start = 0
        valueRange.end = scrollRange.size * animationData.scrollRate
        valueRange.size = (valueRange.end - valueRange.start)
        break
      case 'opacity':
        valueRange.start = animationData.initialOpacity
        valueRange.end = animationData.endOpacity
        valueRange.size = (valueRange.end - valueRange.start)
        break
      case 'scaleX':
      case 'scaleY':
        valueRange.start = 1
        valueRange.end = valueRange.start + animationData.deltaScale
        valueRange.size = (valueRange.end - valueRange.start)
        break
    }
    valueRange.transition = animationData.transition
    return valueRange
  }

  function getAnimationScrollLimits (animationParameters) {
    const extraLimit = vhToPx(PARALLAX_RANGE_EXTRA_VH)
    let lowScrollLimit
    let highScrollLimit
    for (const animationType in animationParameters) {
      const startScroll = animationParameters[animationType].scrollRange.start
      const endScroll = animationParameters[animationType].scrollRange.end
      if ((!lowScrollLimit) || (startScroll < lowScrollLimit)) {
        lowScrollLimit = startScroll
      }
      if ((!highScrollLimit) || (endScroll > highScrollLimit)) {
        highScrollLimit = endScroll
      }
    }
    lowScrollLimit -= extraLimit
    highScrollLimit += extraLimit
    return {
      low: correctToRange({
        limits: { low: 0, high: maxScroll },
        value: lowScrollLimit
      }),
      high: correctToRange({
        limits: { low: 0, high: maxScroll },
        value: highScrollLimit
      })
    }
  }

  /*  UPDATE CONTENT ON SCROLL
  ----------------------------------------------- */

  function tryToAnimateElementsInLimits () {
    const scroll = getScroll()
    if (Math.abs(scroll - lastScroll) > 0) {
      lastScroll = scroll
      if (scheduledAnimationFrame) {
        return
      }
      scheduledAnimationFrame = true
      window.requestAnimationFrame(animateElementsInLimits)
    }
  }

  function animateElementsInLimits () {
    for (const selector in domElements) {
      if (inRange({
        limits: domElements[selector].limits,
        value: lastScroll
      })
      ) {
        animateElement(domElements[selector])
      }
    }
    scheduledAnimationFrame = false
  }

  function animateElement ({ element, animations }) {
    const animationValues = getAnimationValues(animations)
    applyAnimation({
      element: element,
      animationValues: animationValues
    })
  }

  function getAnimationValues (animations) {
    const animationValues = {}
    for (const type in animations) {
      switch (type) {
        case 'translateX':
        case 'translateY':
          animationValues[type] = Math.floor(
            getValueForAnimationType(animations[type])
          )
          break
        default:
          animationValues[type] = getValueForAnimationType(animations[type])
            .toFixed(2)
          break
      }
    }
    return animationValues
  }

  function getValueForAnimationType ({ scrollRange, valueRange }) {
    if (lastScroll < scrollRange.start) {
      return valueRange.start
    } else if (lastScroll > scrollRange.end) {
      return valueRange.end
    } else {
      const relativeScroll = lastScroll - scrollRange.start
      const animationAdvance = relativeScroll / scrollRange.size
      const animationRate = getEasedAnimationRate({
        animationAdvance: animationAdvance,
        transition: valueRange.transition
      })
      return valueRange.start + valueRange.size * animationRate
    }
  }

  function getEasedAnimationRate ({ animationAdvance, transition }) {
    switch (transition) {
      case 'ease-out':
        return animationAdvance * (2 - animationAdvance) // Quadratic Ease Out
      case 'linear':
      default:
        return animationAdvance
    }
  }

  function applyAnimation ({ element, animationValues }) {
    const {
      translateX = 0,
      translateY = 0,
      opacity = 1,
      scaleX = 1,
      scaleY = 1
    } = animationValues
    const translateString = `translate3d(${translateX}px, ${translateY}px, 0px)`
    const scaleString = `scale3D(${scaleX}, ${scaleY}, 1)`
    element.style.opacity = opacity
    element.style.transform = translateString + ' ' + scaleString
  }

  /*  UPDATE CONTENT ON RESIZE
  ----------------------------------------------- */

  function isValidResize () {
    const validResizePercent = VALID_HEIGHT_RESIZE_PERCENT / 100
    const deltaSize = getDeltaWindowSize()
    return deltaSize.width > 0 || deltaSize.height > validResizePercent
  }

  function getDeltaWindowSize () {
    const size = getWindowSize()
    const deltaWidth =
      Math.abs(size.width - lastScreenSize.width) /
      Math.min(size.width, lastScreenSize.width)
    const deltaHeight =
      Math.abs(size.height - lastScreenSize.height) /
      Math.min(size.height, lastScreenSize.height)
    return { width: deltaWidth, height: deltaHeight }
  }

  function updateParameters () {
    lastScreenSize = getWindowSize()
    maxScroll = getMaxScroll()
    lastScroll = getScroll()
    for (const selector in domElements) {
      const element = domElements[selector].element
      domElements[selector].animations = processAnimationData({
        selector: selector,
        element: element
      })
      domElements[selector].limits = getAnimationScrollLimits(
        domElements[selector].animations
      )
    }
  }

  function updateWholePage () {
    window.requestAnimationFrame(animateAllElements)
  }

  function animateAllElements () {
    for (const selector in domElements) {
      animateElement(domElements[selector])
    }
  }

  /*  VIEW KEEPER ON RESIZE
  ----------------------------------------------- */

  function getTopElementInViewport () {
    let tempElement
    topElement = null
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

  /*  HELPERS
  ----------------------------------------------- */

  function getWindowSize () {
    const size = {}
    size.width = window.innerWidth
    size.height = window.innerHeight
    return size
  }

  function getMaxScroll () {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )
  }

  function getScroll () {
    return window.pageYOffset
  }

  function debounce (func, delay) {
    let inDebounce
    return function () {
      clearTimeout(inDebounce)
      inDebounce = setTimeout(() => { func() }, delay)
    }
  }

  function vhToPx (vh) {
    return vh / 100 * lastScreenSize.height
  }

  function vwToPx (vw) {
    return vw / 100 * lastScreenSize.width
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

  init()
}())

console.log('Animations file loaded correctly')
