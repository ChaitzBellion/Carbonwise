const STORAGE_KEY = "carbonwise:v1";

export function loadState(fallback, sanitizer) {
  if (!storageAvailable()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    return sanitizer(JSON.parse(raw), fallback);
  } catch {
    return fallback;
  }
}

export function saveState(state) {
  if (!storageAvailable()) {
    return;
  }

  const persisted = {
    activity: state.activity,
    goals: state.goals,
    challenges: state.challenges,
    theme: state.theme,
    activeView: state.activeView,
    educationSearch: state.educationSearch,
    educationCategory: state.educationCategory,
    lastMilestone: state.lastMilestone,
    lastUpdatedDate: state.lastUpdatedDate || new Date().toDateString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Private browsing and quota failures should not break the product.
  }
}

function storageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}
