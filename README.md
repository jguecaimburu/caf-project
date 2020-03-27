# Huancito Personal Website


This project was built as a part of the [Founders and Coders](https://www.foundersandcoders.com) application process. Everything was built to work on this particular website but the carousel and parallax scripts can be reused.


## Image carousel


### Features

- Display one slide at a time
- Move between slides when clicking navigation buttons
- Toggle automatically looping through all slides with a play/pause button
- Keyboard navigation between slides with the left/right arrow keys


### HTML Structure

All the carousel elements should be placed inside a **container** element.
It should contain one of each of these elements:
- Slide Container: Element that contains all the slides. One slide should be the **currentSlide**, which is the slide visible in the front of the carousel. The slides will be ordered in a list as presented in the HTML. The current slide sets the index to start with when the page is loaded.
- **btnForward**: Move to the next slide, the one located on the right of the current slide.
- **btnBackward**: Move to the previous slide, the one located on the left of the current slide.
- **btnPlay**: Turn on / off the carousel timer.

The slide container can hold any number of **slides**. Each of them must have the same class selector but other classes can be added to each one. Only one of them should have the currentSlide selector.


### CSS Style

The slides should have `position: absolute;`. It is recommended that all share the size of the slide container.

It is recommended that the following style is added to the slides:

```
transition-property: left;
transition-duration: 300ms;
transition-timing-function: ease-in-out;
```

The duration can be replaced for any number you prefer, but **always in miliseconds**.


### JS Configuration Values

At the start of the javascript file, you can set the following values:

**CAROUSEL_SELECTORS**: Object that contains all the selector classes mentioned before. Keys should be exactly as in the example, but selectors can be defined as it suits you better:

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

**CAROUSEL_INTERVAL_MS**: Slide looping time in miliseconds for the carousel. Each time a slide changes either automatically or manually the timer will wait this time before a new change.

```
// Example //

const CAROUSEL_INTERVAL_MS = 5000
```

**RESIZE_DEBOUNCE_MS**: Time that should be waited in miliseconds before updating values on a resize event.

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

- Feature 1


### HTML Structure



### CSS Style




### JS Configuration Values

At the start of the javascript file, you can set the following values:


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

**RESIZE_DEBOUNCE_MS**: Time that should be waited in miliseconds before updating values on a resize event.

```
// Example //

const RESIZE_DEBOUNCE_MS = 150
```

### How to Use

Once all the previous values are defined, place both the main and data scripts at the end of your html file's body:

```
// Example //

<script type="text/javascript" src="/js/animation-data.js"></script>
<script type="text/javascript" src="/js/animations.js"></script>
```

Please notice that the data script should be placed before the main script.

It is important that the CSS file containing the parallax element styles is loaded on the same page.


## Built With

Only vanilla Javascript was used on this project.

## Acknowledgments
