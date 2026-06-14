// 1. Achievements
export const achievements = [
  { label: "Baseline Builder", detail: "Completed a full footprint profile" },
  { label: "7-Day Streak", detail: "Tracked sustainable actions for a full week" },
  { label: "Energy Optimizer", detail: "Reduced home energy emissions" },
  { label: "Efficiency Expert", detail: "Successfully completed 3 weekly challenges" }
];

// 2. Default Activity (Missing)
export const defaultActivity = {
  transportation: { value: 0, unit: "km" },
  energy: { value: 0, unit: "kWh" },
  food: { value: 0, unit: "kg" }
};

// 3. Default Goals (Missing)
export const defaultGoals = [
  { id: "g1", title: "Reduce Meat Consumption", current: 0, target: 5 },
  { id: "g2", title: "Monthly Power Limit", current: 0, target: 200 }
];

// 4. Default Challenges (Missing)
export const defaultChallenges = [
  { 
    id: "c1", 
    title: "Switch to LEDs", 
    cadence: "weekly", 
    progress: 0, 
    target: 5, 
    active: true, 
    completed: false, 
    impactKg: 18 
  },
  { 
    id: "c2", 
    title: "Pack zero-waste lunches", 
    cadence: "weekly", 
    progress: 0, 
    target: 5, 
    active: true, 
    completed: false, 
    impactKg: 14 
  }
];

// 5. Education Articles
export const educationArticles = [
  {
    id: "edu-1",
    title: "Carbon footprint basics",
    description: "Understand CO2e, lifestyle categories, and why monthly tracking creates better choices.",
    category: "Foundations",
    duration: "4 Min",
    url: "https://www.epa.gov/ghgemissions/basics-greenhouse-gas-emissions"
  },
  {
    id: "edu-2",
    title: "Lower-carbon transportation",
    description: "Practical ways to reduce car and flight emissions without giving up mobility.",
    category: "Transportation",
    duration: "6 Min",
    url: "https://www.carbontrust.com/news-and-insights/insights/transport-and-the-carbon-footprint"
  },
  {
    id: "edu-3",
    title: "Home energy upgrades that compound",
    description: "A clear order of operations for lighting, insulation, appliances, and renewable energy.",
    category: "Home Energy",
    duration: "5 Min",
    url: "https://www.energystar.gov/saveathome"
  },
  {
    id: "edu-4",
    title: "Food choices with measurable impact",
    description: "Build a plant-forward routine, reduce wasted meals, and improve grocery planning.",
    category: "Food",
    duration: "5 Min",
    url: "https://www.worldwildlife.org/magazine/issues/winter-2022/articles/how-food-impacts-the-environment"
  },
  {
    id: "edu-5",
    title: "Circular shopping habits",
    description: "Reduce embodied emissions through repair, resale, borrowing, and buying less often.",
    category: "Shopping",
    duration: "7 Min",
    url: "https://www.ellenmacarthurfoundation.org/circular-economy/concept"
  },
  {
    id: "edu-6",
    title: "Recycling, composting, and landfill reduction",
    description: "Keep high-impact materials out of landfills and build a simple sorting system.",
    category: "Waste",
    duration: "4 Min",
    url: "https://zerowastehome.com/tips/"
  }
];
