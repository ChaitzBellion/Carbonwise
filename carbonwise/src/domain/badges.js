export function evaluateBadges(footprint, recommendations) {
  const badges = [];

  if (footprint.score >= 80) {
    badges.push({
      id: "eco-champion",
      icon: "🌎",
      title: "Eco Champion",
      description: "Carbon score above 80",
    });
  }

  if (footprint.monthlyKg < 500) {
    badges.push({
      id: "low-carbon",
      icon: "🌱",
      title: "Low Carbon Lifestyle",
      description: "Monthly footprint below sustainable target",
    });
  }

  if (recommendations.length >= 5) {
    badges.push({
      id: "action-ready",
      icon: "⚡",
      title: "Action Ready",
      description: "Multiple reduction opportunities identified",
    });
  }

  if (footprint.topSources?.[0]?.id === "transportation") {
    badges.push({
      id: "mobility-focus",
      icon: "🚲",
      title: "Mobility Focus",
      description: "Transportation is your main focus area",
    });
  }

  return badges;

  if (footprint.score >= 80 && recommendations.length > 0) {
  badges.push({
    id: "eco-master",
    icon: "🏆",
    title: "Eco Master",
    description: "High score with active reduction opportunities",
  });
}

if (streak?.current >= 7) {
  badges.push({
    id: "week-warrior",
    icon: "🔥",
    title: "Week Warrior",
    description: "7 day carbon tracking streak",
  });
}
}
