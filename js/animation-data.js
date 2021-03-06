'use strict';

const animationData = {
  generalValues: {
    '.transition__cloud-1': {
      translateX: {
        viewheightAnticipation: 70,
        viewheightDuration: 150,
        viewwidthDistance: -70,
        transition: 'ease-out'
      }
    },
    '.transition__cloud-2': {
      translateX: {
        viewheightAnticipation: 75,
        viewheightDuration: 150,
        viewwidthDistance: 50,
        transition: 'ease-out'
      }
    },
    '.transition__cloud-3': {
      translateX: {
        viewheightAnticipation: 90,
        viewheightDuration: 250,
        viewwidthDistance: -100,
        transition: 'ease-out'
      }
    },
    '.unexpected__whale-container': {
      opacity: {
        viewheightAnticipation: -150,
        viewheightDuration: 10,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: -150,
        viewheightDuration: 15,
        deltaScale: 4,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -150,
        viewheightDuration: 15,
        deltaScale: 4,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: -200,
        viewheightDuration: 410,
        scrollRate: 0.17,
        transition: 'ease-out'
      }
    },
    '.unexpected__flower-container': {
      opacity: {
        viewheightAnticipation: -230,
        viewheightDuration: 20,
        initialOpacity: 0,
        endOpacity: 1,
        transition: 'ease-out'
      },
      scaleX: {
        viewheightAnticipation: -230,
        viewheightDuration: 30,
        deltaScale: 2,
        transition: 'ease-out'
      },
      scaleY: {
        viewheightAnticipation: -230,
        viewheightDuration: 30,
        deltaScale: 2,
        transition: 'ease-out'
      },
      translateY: {
        viewheightAnticipation: -260,
        viewheightDuration: 210,
        scrollRate: 0.05,
        transition: 'ease-out'
      }
    },
    '.unexpected__whale': {
      opacity: {
        viewheightAnticipation: -200,
        viewheightDuration: 60,
        initialOpacity: 0.15,
        endOpacity: 1,
        transition: 'linear'
      }
    },
    '.unexpected__flower': {
      opacity: {
        viewheightAnticipation: -260,
        viewheightDuration: 60,
        initialOpacity: 0.15,
        endOpacity: 1,
        transition: 'linear'
      },
      translateY: {
        viewheightAnticipation: -550,
        viewheightDuration: 120,
        scrollRate: 0.17,
        transition: 'ease-out'
      }
    }
  },
}
