import {
  achievements,
  defaultActivity,
  defaultChallenges,
  defaultGoals,
} from "../domain/mockData.js";
import {
  sanitizeStoredState,
  sanitizeText,
  validateActivityInput,
  validateChallenge,
  validateGoalInput,
} from "../domain/validators.js";
import { loadState, saveState } from "./storage.js";

const defaultState = Object.freeze({
  activity: defaultActivity,
  goals: defaultGoals,
  challenges: defaultChallenges,
  achievements,
  theme: "light",
  activeView: "overview",
  educationSearch: "",
  educationCategory: "All",
  lastMilestone: "",
  loading: false,
  error: "",

  streak: {
  current: 0,
  best: 0,
  lastRecordedDate: null,
},

  notification: null,
  earnedBadges: [],

  simulation: {
    currentFootprint: null,
    projectedFootprint: null,
    monthlySavingsKg: 0,
    yearlySavingsKg: 0,
    improvedScore: 0,
  },
  history: [], // For storing past footprints and activities
  lastUpdatedDate: new Date().toDateString(), 
  
});

export function createInitialState() {
  const theme = typeof window !== "undefined"
    && window.matchMedia
    && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const fallback = { ...defaultState, theme };
  return loadState(fallback, sanitizeStoredState);
}

export function createStore(initialState = createInitialState()) {
  let state = sanitizeStoredState(initialState, defaultState);
    const today = new Date().toDateString();
  if (state.lastUpdatedDate !== today) {
    console.log("New day detected: Resetting daily challenges.");
    state = {
      ...state,
      lastUpdatedDate: today,
      challenges: state.challenges.map(challenge => {
        if (challenge.cadence?.toLowerCase() === 'daily') {
          return { ...challenge, progress: 0, completed: false };
        }
        return challenge;
      })
    };
    saveState(state); // Save the reset state immediately
  }
  const listeners = new Set();

  function dispatch(action) {
    state = reducer(state, action);
    saveState(state);
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState: () => state,
    dispatch,
    subscribe,
  };
}

export function reducer(state, action) {

  switch (action.type) {
    case "RECORD_FOOTPRINT":
  return {
    ...state,
    history: [
      ...state.history,
      { 
        date: new Date().toISOString(), 
        monthlyKg: action.monthlyKg,
        score: action.score 
      }
    ].slice(-12) // This keeps only the last 12 records (1 year)
  };
     // 1. Corrected SET_SIMULATION
    case "SET_SIMULATION":
      return { 
        ...state, 
        simulation: action.simulation 
      };

    // 2. Added CLEAR_SIMULATION (helpful for the reset button)
    case "CLEAR_SIMULATION":
      return { 
        ...state, 
        simulation: {
          currentFootprint: null,
          projectedFootprint: null,
          monthlySavingsKg: 0,
          yearlySavingsKg: 0,
          improvedScore: 0,
        } 
      };

    case "SET_VIEW":
      return { ...state, activeView: sanitizeText(action.view, 24) || "overview" };
    case "SET_THEME":
      return { ...state, theme: action.theme === "dark" ? "dark" : "light" };
    case "UPDATE_ACTIVITY": {
      const nextActivity = deepMerge(state.activity, action.patch);
      return { ...state, activity: validateActivityInput(nextActivity), error: "" };
    }
    case "SET_EDUCATION_SEARCH":
      return { ...state, educationSearch: sanitizeText(action.value, 60) };
    case "SET_EDUCATION_CATEGORY":
      return { ...state, educationCategory: sanitizeText(action.value, 32) || "All" };
    case "ADD_GOAL": {
      const goal = validateGoalInput(action.goal);
      return { ...state, goals: [goal, ...state.goals].slice(0, 12), lastMilestone: "" };
    }
    case "UPDATE_GOAL": {
      const goals = state.goals.map((goal) => {
        if (goal.id !== action.id) return goal;
        const next = validateGoalInput({ ...goal, current: Number(goal.current) + Number(action.delta || 0) });
        return { ...next, current: Math.min(next.current, next.target) };
      });
      const completed = goals.find((goal) => goal.id === action.id && goal.current >= goal.target);
      return {
        ...state,
        goals,
        lastMilestone: completed ? `${completed.title} completed` : state.lastMilestone,
      };
    }
    case "REMOVE_GOAL":
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.id) };
    case "TOGGLE_CHALLENGE": {
      const challenges = state.challenges.map((challenge) => (
        challenge.id === action.id ? validateChallenge({ ...challenge, active: !challenge.active }) : challenge
      ));
      return { ...state, challenges };
    }
    case "ADVANCE_CHALLENGE": {
      const challenges = state.challenges.map((challenge) => {
        if (challenge.id !== action.id) return challenge;
        const progress = Math.min(challenge.target, challenge.progress + 1);
        return validateChallenge({
          ...challenge,
          active: true,
          progress,
          completed: progress >= challenge.target,
        });
      });
      const completed = challenges.find((challenge) => challenge.id === action.id && challenge.completed);
      return {
        ...state,
        challenges,
        lastMilestone: completed ? `${completed.badge} badge unlocked` : state.lastMilestone,
      };
    }
    case "RESET_SAMPLE":
      return { ...defaultState, theme: state.theme };
    case "SHOW_NOTIFICATION":
      return {
        ...state,
        notification: action.notification,
      };
    
    case "CLEAR_NOTIFICATION":
      return {
        ...state,

        notification: null,
      };
    case "SET_EARNED_BADGES":
  return {
    ...state,
    earnedBadges: action.badges,
  };

  case "UPDATE_STREAK": {
  const today = new Date().toDateString();

  if (state.streak.lastRecordedDate === today) {
    return state;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const continued =
    state.streak.lastRecordedDate ===
    yesterday.toDateString();

  const current =
    continued
      ? state.streak.current + 1
      : 1;

  return {
    ...state,

    streak: {
      current,
      best: Math.max(current, state.streak.best),
      lastRecordedDate: today,
    },
  };
}

    default:
      return state;
  }
  
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") {
    return base;
  }
  const next = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    next[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(base[key] ?? {}, value)
      : value;
  });
  return next;
}
