# Huancito's Personal Website


This project was built as a part of the [Founders and Coders](https://www.foundersandcoders.com) application process. Everything was built to work on this particular website but the carousel and parallax scripts can be reused. I encourage you to read this file before attempting to apply any code to your website.


## Image carousel


### Features

- Display one slide at a time
- Move between slides when clicking navigation buttons
- Toggle automatically looping through all slides with a play/pause button
- Keyboard navigation between slides with the left/right arrow keys


### HTML Structure

All the carousel elements should be placed inside a **container** element.
It should contain one of each of these elements:
- Slide Container: Element that contains all the slides. One slide should be the `currentSlide`, which is the slide visible in the front of the carousel. The slides will be ordered in a list as presented in the HTML. The current slide sets the index to start with when the page is loaded.
- `btnForward`: Element that will hold a click event to call the function that moves to the next slide, the one located on the right of the current slide.
- `btnBackward`: Element that will hold a click event to call the function that moves to the previous slide, the one located on the left of the current slide.
- `btnPlay`: Element that will hold a click event to call the function that turns on / off the carousel timer.

The slide container can hold any number of **slides**. Each of them must have the same class selector but other classes can be added to each one. Only one of them should have the currentSlide selector.


### CSS Style

The slides selector should have `position: absolute;`. It is recommended that all share the size of the slide container.

It is recommended that the following declarations are added to the slides selector:

```
transition-property: left;
transition-duration: 300ms;
transition-timing-function: ease-in-out;
```

The duration can be replaced for any number you prefer, but **always in miliseconds**.


### JS Configuration Values

At the start of the JS file, the following values can be set:

`CAROUSEL_SELECTORS`: Object that contains all the selector classes mentioned before. Keys should be exactly as in the example, but selectors can be defined as it suits you better:

```
// Example //

const CAROUSEL_SELECTORS = {
  container: '.carousel',
  btnForward: '.carousel__btn--forward',
  btnBackward: '.carousel__btn--backward',
  btnPlay: '.carousel__btn--play',
  slides: '.carousel__slide',
  currentSlide: '.carousel__slide--current'
}
```

`CAROUSEL_INTERVAL_MS`: Slide looping time in miliseconds for the carousel. Each time a slide changes either automatically or manually the timer will wait this time before a new automatic change.

```
// Example //

const CAROUSEL_INTERVAL_MS = 5000
```

`RESIZE_DEBOUNCE_MS`: Time that should be waited in miliseconds before updating values on a resize event.

```
// Example //

const RESIZE_DEBOUNCE_MS = 150
```

### How to Use It

Once all the previous values are defined, place the script at the end of your html file's body:

```
// Example //

<script type="text/javascript" src="/js/carousel.js"></script>
```

It is important that the CSS file containing the carousel element styles is loaded on the same page.



## Parallax


### Features

- Apply changes to element styles
- Style changes timing function can be linear or ease-out
- Apply classes to elements
- Update element positions and variables on resize
- Work properly with every position style
- Keep user view on resize


### HTML Structure

Add the animation data to the data script as specified below, using the proper selector. Elements can't share the same selector. The animation will only be applied to the first element if more are given.


### CSS Style

No specific requisite needed, but you'll need to combine the styles with the animations to get the proper results. In particular, position and size are the most relevant.

It is recommended to apply animation values to an element and then try to achieve a responsive result by applying media rules to the position or size of a given element.

Any `transform` property applied to an element will be overwritten if a style change is applied via JS so it's better to avoid this property on animated elements.


### JS Configuration Values

#### Data JS script

The data JS file contains all the animation values to be applied by the main script. All the values are contained within a single object with the following structure:

```
const animationData = {
  generalValues: {
    '.element-selector': {
        property: {
          data-key: value
        ...
      },
      ...
    }
    ...
  },
  percentAnimation: {...}   // Explained better below
}
```
The first level divides between `generalValues` to be applied in a loop and particular animations. In this case, there's only one particular animation which key is `percentAnimation`.
The particular animations will hold an element specific for it's functionality.

Inside `generalValues`, the next level is composed by properties to be modified. Keys for the properties found on this level are:
- `translateX`
- `translateY`
- `scaleX`
- `scaleY`
- `rotate`
- `opacity`
- `classChange`

`classChange` applies a class when a given scrolling point of the website is reached. The others apply proportional changes to the properties, given a scrolling value.

Inside each of these keys there's another object that holds data for that given animation. Where to start, where to finish and how to apply the changes. Each data type has a key and a values. The object for each of the properties is different but they all share the way to define the starting and ending points.

##### Animation scroll range

The scrolling is measured from the top of the viewport. Its value is the distance scrolled from the top of the page to the top of the viewport, in pixels, at any given moment.

Each element has a starting Y position on the website, measured from the top of the page.

To set the scrolling range in which an object properties are changed, the following values must be defined:

- `viewheightAnticipation`: The scrolling point at which the values should start to be changed is given by the difference between the starting Y position and the `viewheightAnticipation`. This value should be set in vh units. The value should be 0 if the animation should start when the scrolling point reaches the initial Y position of an element. Negative values represent delays in the animation.
- `viewheightDuration`: The `viewheightDuration` is the size of the scrolling range from the starting point mentioned before. It is also measured in vh.

So:
Starting Scroll (limited to > 0) = Y Position - Anticipation.

Ending Scroll (limited to the scrolling size of the page) = Starting Scroll + Duration.

Where to start and finish an animation is defined relative to the element style position and the viewport size.


##### Animation values

As mentioned before, each property object has different data types. However, all but the classChange have a `transition` value. This defines the way in which the property change from the initial value to the end value across the scroll range. The default value for this is `"linear"`, but `"ease-out"` is the other choice. These behave in a similar way to transition timing functions from CSS, but in this case the advance of the animation is a function of scrolling, not time. All the other data types are:

- `translateX`
  - `viewwidthDistance`: Total distance that the object should be translated over the X axis after the scrolling range, measured in vw units.
- `translateY`
  - `scrollRate`: Rate at which the object should be translated over the Y axis relative to the scrolling. For example, a rate of 1 means that for every px scrolled down, the element will be translated down by 1 px.
- `scaleX` & `scaleY`:
  - `deltaScale`: Final scale of the element minus the initial scale. This means that with a `deltaScale` of 0 the object will stay the same. Values over 0 make the object grow. Negative values up to -1 will make the object shrink. Below that limit, final scale will always be 0.
- `opacity`
  - `initialOpacity`: Opacity of the object until reaching the starting scroll.
  - `endOpacity`: Opacity of the object after passing through the scrolling range.
- rotate
  - `endRotation`: Total rotation applied to the object after the scrolling range, measured in deg.
- `classChange`
  - `classIn`: Inside the range, the object gets added this class. The class holds the styles and animations in the CSS file.
  - `classOut`: Outside the range, the `classIn` is removed and this is added. It is recommended to add this class to the object in the HTML if the object is outside of the range at the initial load of the page and need to have this style.



```
// Example //

const animationData = {
  generalValues: {
    '.welcome--p-char-h': {
      translateX: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        viewwidthDistance: -25,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        scrollRate: 0.2,
        transition: 'ease-out'
      },
      opacity: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        initialOpacity: 1,
        endOpacity: 0,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: 40,
        viewheightDuration: 55,
        deltaScale: 0.25,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: 40,
        viewheightDuration: 55,
        deltaScale: 0.25,
        transition: 'ease-out'
      }
    }
  }
}
```

##### Particular animations

Particular animations have their own kind of object. In this case, there's only the percent animation.

`parcentAnimation`: Most data values of this object are self-explained or explained before. This animation adds a percent text value to the object, from 0 to the `endValue` declared in the object, changing across the scrolling range. The end value should be given as a float. A value of 10 will be added as 10%.

```
percentAnimation: {
  selector: '.transition__figure',
  viewheightAnticipation: 15,
  viewheightDuration: 60,
  endValue: 100 * 15 / 17
}
```

As this animation is too focused on this project, there's a flag in the main JS file to turn it off.


#### Main JS script

At the start of the JS file, the following values can be set:

- `DOM_ELEMENTS_DATA`: The data js file is loaded on the HTML so it must be called here to get the data. `animationData.generalValues` is the default in this example, being `animationData` the name of the whole data object and `generalValues` the key for the general animation data explained before.
- `SCROLL_INTERVAL_MS`: As adding a scroll listener was not performant, the scrolled value is measured at fixed intervals set by this variable. Time (integer) for the interval in miliseconds.
- `TOP_ELEMENT_DEBOUNCE_MS`: Resizing can push the content in the user view up or down. The script takes the user back to the element present at the top of the view before the resize. Time (integer) that should be waited in miliseconds before updating the top element on a scroll event. This keeps the scrolling event from launching this function all the time.
- `PARALLAX_RANGE_EXTRA_VH`: To improve performance, objects get ignored outside of their limits. As the user can scroll fast through the page, some animations can be left unfinished. To prevent this, the scrolling range gets extended by this value, set in positive vh units. A value of 0 keeps the limits to the scrolling range. A bigger limit prevents unfinished animations but reduce performance. If the scrolling value is inside of the limits of an object but outside it's scrolling range, the object will not be ignored but initial / ending values will be set.
- `UPDATE_ALL_DEBOUNCE_MS`: As a low extra value does not prevent all unfinished animations, every element position gets updated outside of their limits some time after the scroll. Time (integer) that should be waited in miliseconds before updating all element positions. This variable should have a value much bigger than all other variables in miliseconds.
- `RESIZE_DEBOUNCE_MS`: Time (integer) that should be waited in miliseconds before updating values on a resize event.
- `VALID_HEIGHT_RESIZE_PERCENT`: On mobile, the showing/hidding of the url bar launches a resize event. By setting this value to a positive integer, that resize event can be prevented. A value of 10 is enough.

- `IS_PERCENT_ON`: As the `percentAnimation` is not something that every page might use, it can be turned off. Set this value to `false` to prevent it's functions to be called.
- `PERCENT_DOM_DATA`: If the previous flag is set to `true`, the `percentAnimation` data should be loaded to the file. `animationData.percentAnimation` is the default in this example, being `animationData` the name of the whole data object and `percentAnimation` the key for this particular animation.

```
// Example //

const DOM_ELEMENTS_DATA = animationData.generalValues
const SCROLL_INTERVAL_MS = 10
const TOP_ELEMENT_DEBOUNCE_MS = 100
const UPDATE_ALL_DEBOUNCE_MS = 5000
const RESIZE_DEBOUNCE_MS = 150
const PARALLAX_RANGE_EXTRA_VH = 35
const VALID_HEIGHT_RESIZE_PERCENT = 10

const IS_PERCENT_ON = true
const PERCENT_DOM_DATA = animationData.percentAnimation
```

### How to Use

Once all the previous values are defined, place both the main and data scripts at the end of your html file's body:

```
// Example //

<script type="text/javascript" src="/js/animation-data.js"></script>
<script type="text/javascript" src="/js/animations.js"></script>
```

Please notice that the data script should be placed before the main script. Several pages might share the main script but each should have it's own data file.

It is important that the CSS file containing the parallax element styles is loaded on the same page.


## Built With

Only vanilla JS was used on this project.


## Acknowledgments

This fantastic article by Dave Gamache (@dhg) was key to understanding how to improve parallax performance: [Parallax Done Right](https://medium.com/@dhg/parallax-done-right-82ced812e61c).
It changed my whole approach to the scrolling event and inspired me to better structure my code.
