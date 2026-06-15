export const scenarioLibrary = [
  {
    id: "cut-car-20",
    title: "Drive 20% less",
    description: "Reduce weekly car travel by 20%.",
    patchFor(activity) {
      return {
        transportation: {
          carKmWeek: Math.max(0, activity.transportation.carKmWeek * 0.8),
        },
      };
    },
  },
  {
    id: "more-renewable",
    title: "Increase renewable electricity",
    description: "Raise renewable electricity share by 25 points.",
    patchFor(activity) {
      return {
        homeEnergy: {
          renewablePercent: Math.min(100, activity.homeEnergy.renewablePercent + 25),
        },
      };
    },
  },
  {
    id: "vegetarian-shift",
    title: "Shift to vegetarian diet",
    description: "Move to a vegetarian meal pattern.",
    patchFor() {
      return {
        food: {
          dietType: "vegetarian",
        },
      };
    },
  },
];