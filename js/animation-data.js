'use strict';

const animationData = {
  generalValues: {
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
    '.unexpected__whale-container': {
      opacity: {
        viewheightAnticipation: -825,
        viewheightDuration: 10,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: -830,
        viewheightDuration: 15,
        deltaScale: 4,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -830,
        viewheightDuration: 15,
        deltaScale: 4,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: -1050,
        viewheightDuration: 320,
        scrollRate: 0.25,
        transition: 'ease-out'
      }
    },
    '.unexpected__flower-container': {
      opacity: {
        viewheightAnticipation: -825,
        viewheightDuration: 20,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: -830,
        viewheightDuration: 30,
        deltaScale: 2,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -830,
        viewheightDuration: 30,
        deltaScale: 2,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: -1175,
        viewheightDuration: 210,
        scrollRate: 0.31,
        transition: 'ease-out'
      }
    },
    '.unexpected__whale': {
      opacity: {
        viewheightAnticipation: -1050,
        viewheightDuration: 60,
        initialOpacity: 0.15,
        endOpacity: 1,
        transition: 'linear'
      }
    },
    '.unexpected__flower': {
      opacity: {
        viewheightAnticipation: -1050,
        viewheightDuration: 60,
        initialOpacity: 0.15,
        endOpacity: 1,
        transition: 'linear'
      },
      translateY: {
        viewheightAnticipation: -1075,
        viewheightDuration: 195,
        scrollRate: 0.05,
        transition: 'ease-out'
      }
    }
  },
}
