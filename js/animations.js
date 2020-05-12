'use strict';

const homeAnimations = (function () {

  /*  CONFIGURATION VALUES
  ----------------------------------------------- */

  const DOM_ELEMENTS_DATA = animationData.generalValues
  const SCROLL_INTERVAL_MS = 10
  const TOP_ELEMENT_DEBOUNCE_MS = 100
  const UPDATE_ALL_DEBOUNCE_MS = 5000
  const RESIZE_DEBOUNCE_MS = 150
  const PARALLAX_RANGE_EXTRA_VH = 35
  const VALID_HEIGHT_RESIZE_PERCENT = 10

  const IS_PERCENT_ON = true
  const PERCENT_DOM_DATA = animationData.percentAnimation

  /*  GLOBALS
  ----------------------------------------------- */

  let lastScroll = 0
  let topElement
  let lastScreenSize
  let maxScroll
  let scrollTimer
  const domElements = {}
  let scheduledAnimationFrame = false

  const percentAnimation = {}

  /*  CONSTRUCTION
  ----------------------------------------------- */

  function init () {
    setupParameters()
    setupEventListeners()
    scrollTimer = setInterval(tryToAnimateElementsInLimits, SCROLL_INTERVAL_MS)
  }

  function setupParameters () {
    lastScreenSize = getWindowSize()
    maxScroll = getMaxScroll()
    lastScroll = getScroll()
    const domElementsSelectors = Object.keys(DOM_ELEMENTS_DATA)
    buildDomElementsObject(domElementsSelectors)
    buildPercentAnimationObject()
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
    }, TOP_ELEMENT_DEBOUNCE_MS))

    window.addEventListener('scroll', debounce(() => {
      updateWholePage()
    }, UPDATE_ALL_DEBOUNCE_MS))
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
    const regularPosition = getRegularYPosition(element)
    const stickyCorrection = getStickyCorrection(element)
    return regularPosition - stickyCorrection
  }

  function getRegularYPosition (element) {
    if (window.getComputedStyle(element).position === 'fixed') {
      return element.getBoundingClientRect().top
    } else {
      let total = 0
      while (!isBodyOrHTML(element)) {
        total += element.offsetTop
        element = element.parentNode
      }
      return total
    }
  }

  function getStickyCorrection (element) {
    if (lastScroll === 0) {
      return 0
    }
    const stickyParent = getStickyParent(element)
    if (stickyParent) {
      const stickyPosition = getRegularYPosition(stickyParent)
      const stickyTop = parseFloat(window.getComputedStyle(stickyParent).top)
      const stickyContainerPosition = getRegularYPosition(
        stickyParent.parentNode
      )
      return stickyPosition - stickyContainerPosition - stickyTop
    } else {
      return 0
    }
  }

  function getStickyParent (element) {
    if (window.getComputedStyle(element).position === 'sticky') {
      return element
    }
    let parent = element.parentNode
    while (window.getComputedStyle(parent).position !== 'sticky') {
      parent = parent.parentNode
      if (isBodyOrHTML(parent)) {
        return
      }
    }
    return parent
  }

  function isBodyOrHTML (element) {
    return element.tagName === 'BODY' ||
      element.tagName === 'HTML'
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
      case 'classChange':
        valueRange.in = animationData.classIn
        valueRange.out = animationData.classOut
        break
      case 'rotate':
        valueRange.start = 0
        valueRange.end = animationData.endRotation
        valueRange.size = (valueRange.end - valueRange.start)
        break
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
      case 'fontSize':
        valueRange.start = animationData.initialRemFontSize
        valueRange.end = animationData.endRemFontSize
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

  function buildPercentAnimationObject () {
    if (IS_PERCENT_ON) {
      const data = PERCENT_DOM_DATA
      percentAnimation.element = document.querySelector(data.selector)
      percentAnimation.animations = { percent: {} }
      percentAnimation.animations.percent.scrollRange = getScrollRange({
        yPosition: getElementYPosition(percentAnimation.element),
        animationData: data
      })
      percentAnimation.animations.percent.valueRange = {
        start: 0,
        end: data.endValue,
        size: data.endValue,
        transition: 'linear'
      }
      percentAnimation.limits =
        getAnimationScrollLimits(percentAnimation.animations)
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
      animateIfInLimits(domElements[selector])
    }
    if (IS_PERCENT_ON) {
      animateIfInLimits(percentAnimation)
    }
    scheduledAnimationFrame = false
  }

  function animateIfInLimits (elementObject) {
    if (inRange({
      limits: elementObject.limits,
      value: lastScroll
    })
    ) {
      animateElement(elementObject)
    }
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
        case 'percent':
          animationValues[type] = getValueForAnimationType(animations[type])
            .toFixed(4) +
            '%'
          break
        case 'classChange':
          animationValues[type] = getClassValue(animations[type])
          break
        case 'translateX':
        case 'translateY':
        case 'rotate':
          animationValues[type] = Math.floor(
            getValueForAnimationType(animations[type])
          )
          break
        case 'fontSize':
          animationValues[type] = getValueForAnimationType(animations[type])
            .toFixed(1)
          break
        default:
          animationValues[type] = getValueForAnimationType(animations[type])
            .toFixed(2)
          break
      }
    }
    return animationValues
  }

  function getClassValue ({ scrollRange, valueRange }) {
    if (inRange({
      limits: {
        low: scrollRange.start,
        high: scrollRange.end
      },
      value: lastScroll
    })) {
      return {
        add: valueRange.in,
        remove: valueRange.out
      }
    } else {
      return {
        add: valueRange.out,
        remove: valueRange.in
      }
    }
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
    if (Array.from(Object.keys(animationValues)).includes('classChange')) {
      applyClassChange({
        element: element,
        classChange: animationValues.classChange
      })
    } else if (Array.from(Object.keys(animationValues)).includes('percent')) {
      applyContentChange({
        element: element,
        animationValues: animationValues
      })
    } else {
      applyStyleChanges({
        element: element,
        animationValues: animationValues
      })
    }
  }

  function applyClassChange ({ element, classChange: { add, remove } }) {
    element.classList.add(add)
    element.classList.remove(remove)
  }

  function applyContentChange ({ element, animationValues }) {
    element.textContent = animationValues.percent
  }

  function applyStyleChanges ({ element, animationValues }) {
    const {
      rotate = 0,
      translateX = 0,
      translateY = 0,
      opacity = 1,
      scaleX = 1,
      scaleY = 1,
      fontSize = ''
    } = animationValues
    const rotateString = `rotate(${rotate}deg)`
    const translateString = `translate3d(${translateX}px, ${translateY}px, 0px)`
    const scaleString = `scale3D(${scaleX}, ${scaleY}, 1)`
    element.style.opacity = opacity
    element.style.transform =
      rotateString +
      ' ' +
      translateString +
      ' ' +
      scaleString
    if (fontSize) {
      element.style.fontSize = fontSize + 'rem'
    }
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
    updateGeneralParameters()
    buildPercentAnimationObject()
  }

  function updateGeneralParameters () {
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

  init()
}())

console.log('Animations main script loaded correctly.')

console.log(
  `%c
  Hi there!
  If you're reading this that means:
  a. You're checking my repo, or
  b. You're checking my console
  Anyway, glad you're here, hopefully from home.
  I've been teaching myself to code for the last 7 months, almost full-time
  for the last  4.  My 2020 goal is to start working and learning from some
  real craftmen.
  Please feel free to contact me at any time at guecaimburu.j@gmail.com.
  Thank you and take care this months! ${String.fromCodePoint(0x1F637)}
  `,
  'color: #020111; font-size: 1.25rem; font-weight: bold; font-family: sans-serif'
)
