'use strict';

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
    },
    '.welcome--p-char-o': {
      translateX: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        viewwidthDistance: -15,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        scrollRate: 0.5,
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
    },
    '.welcome--p-char-l': {
      translateX: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        viewwidthDistance: 15,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        scrollRate: 0.5,
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
    },
    '.welcome--p-char-a': {
      translateX: {
        viewheightAnticipation: 40,
        viewheightDuration: 50,
        viewwidthDistance: 25,
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
    },
    '.welcome__indicator': {
      opacity: {
        viewheightAnticipation: 80,
        viewheightDuration: 15,
        initialOpacity: 0.8,
        endOpacity: 0,
        transition: 'ease-out'
      }
    },
    '.about__title': {
      opacity: {
        viewheightAnticipation: 75,
        viewheightDuration: 25,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: 25,
        viewheightDuration: 30,
        scrollRate: -1,
        transition: 'ease-out'
      }
    },
    '.about__intro-text': {
      opacity: {
        viewheightAnticipation: 85,
        viewheightDuration: 25,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: 25,
        viewheightDuration: 30,
        scrollRate: -0.8,
        transition: 'ease-out'
      }
    },
    '.about--sat-1': {
      classChange: {
        viewheightAnticipation: 25,
        viewheightDuration: 50,
        classIn: 'about--sat-1-in',
        classOut: 'about--sat-1-out'
      }
    },
    '.about--sat-2': {
      classChange: {
        viewheightAnticipation: -25,
        viewheightDuration: 50,
        classIn: 'about--sat-2-in',
        classOut: 'about--sat-2-out'
      }
    },
    '.about--sat-3': {
      classChange: {
        viewheightAnticipation: -75,
        viewheightDuration: 50,
        classIn: 'about--sat-3-in',
        classOut: 'about--sat-3-out'
      }
    },
    '.about--sat-4': {
      classChange: {
        viewheightAnticipation: -125,
        viewheightDuration: 50,
        classIn: 'about--sat-4-in',
        classOut: 'about--sat-4-out'
      }
    },
    '.about__main-planet': {
      rotate: {
        viewheightAnticipation: 0,
        viewheightDuration: 150,
        endRotation: 100,
        transition: 'linear'
      }
    },
    '.transition__sticky-figure-container': {
      opacity: {
        viewheightAnticipation: 20,
        viewheightDuration: 20,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      }
    },
    '.transition__paragraph': {
      translateY: {
        viewheightAnticipation: 15,
        viewheightDuration: 50,
        scrollRate: -1.5,
        transition: 'linear'
      }
    },
    '.transition__cloud-1': {
      translateX: {
        viewheightAnticipation: 70,
        viewheightDuration: 100,
        viewwidthDistance: -70,
        transition: 'ease-out'
      }
    },
    '.transition__cloud-2': {
      translateX: {
        viewheightAnticipation: 75,
        viewheightDuration: 100,
        viewwidthDistance: 50,
        transition: 'ease-out'
      }
    },
    '.transition__cloud-3': {
      translateX: {
        viewheightAnticipation: 90,
        viewheightDuration: 200,
        viewwidthDistance: -100,
        transition: 'ease-out'
      }
    },
    '.transition__first-quote-container': {
      translateY: {
        viewheightAnticipation: 30,
        viewheightDuration: 50,
        scrollRate: -1.25,
        transition: 'ease-out'
      }
    },
    '.transition__first-quote--begin': {
      opacity: {
        viewheightAnticipation: -40,
        viewheightDuration: 25,
        initialOpacity: 1,
        endOpacity: 0,
        transition: 'ease-out'
      }
    },
    '.transition__first-quote--pre-relavant': {
      opacity: {
        viewheightAnticipation: -40,
        viewheightDuration: 25,
        initialOpacity: 1,
        endOpacity: 0,
        transition: 'ease-out'
      }
    },
    '.transition__first-quote--end': {
      opacity: {
        viewheightAnticipation: -40,
        viewheightDuration: 25,
        initialOpacity: 1,
        endOpacity: 0,
        transition: 'ease-out'
      }
    },
    '.transition__first-quote-author': {
      opacity: {
        viewheightAnticipation: -40,
        viewheightDuration: 25,
        initialOpacity: 1,
        endOpacity: 0,
        transition: 'ease-out'
      }
    },
    '.transition__first-quote--relevant': {
      scaleX: {
        viewheightAnticipation: -45,
        viewheightDuration: 30,
        deltaScale: 1.8,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -45,
        viewheightDuration: 30,
        deltaScale: 1.8,
        transition: 'ease-out'
      }
    },
    '.transition__second-quote-container': {
      translateY: {
        viewheightAnticipation: -40,
        viewheightDuration: 42,
        scrollRate: -1.40,
        transition: 'ease-out'
      }
    },
    '.carousel__sticky-slider': {
      translateX: {
        viewheightAnticipation: 40,
        viewheightDuration: 225,
        viewwidthDistance: -140,
        transition: 'ease-out'
      }
    },
    '.unexpected__whale-container': {
      opacity: {
        viewheightAnticipation: -725,
        viewheightDuration: 10,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: -730,
        viewheightDuration: 15,
        deltaScale: 4,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -730,
        viewheightDuration: 15,
        deltaScale: 4,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: -950,
        viewheightDuration: 300,
        scrollRate: 0.25,
        transition: 'ease-out'
      }
    },
    '.unexpected__flower-container': {
      opacity: {
        viewheightAnticipation: -725,
        viewheightDuration: 20,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: -730,
        viewheightDuration: 30,
        deltaScale: 2,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -730,
        viewheightDuration: 30,
        deltaScale: 2,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: -1075,
        viewheightDuration: 200,
        scrollRate: 0.31,
        transition: 'ease-out'
      }
    },
    '.unexpected__whale': {
      opacity: {
        viewheightAnticipation: -950,
        viewheightDuration: 60,
        initialOpacity: 0.15,
        endOpacity: 1,
        transition: 'linear'
      }
    },
    '.unexpected__flower': {
      opacity: {
        viewheightAnticipation: -950,
        viewheightDuration: 60,
        initialOpacity: 0.15,
        endOpacity: 1,
        transition: 'linear'
      },
      translateY: {
        viewheightAnticipation: -975,
        viewheightDuration: 100,
        scrollRate: 0.05,
        transition: 'ease-out'
      }
    }
  },
  percentAnimation: {
    selector: '.transition__figure',
    viewheightAnticipation: 15,
    viewheightDuration: 60,
    endValue: 100 * 15 / 17
  }
}

console.log('Animations data loaded correctly.')
