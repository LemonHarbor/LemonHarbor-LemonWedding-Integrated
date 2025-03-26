import { create } from "zustand";

type DevModeStore = {
  enabled: boolean;
  toggleDevMode: () => void;
  setDevMode: (enabled: boolean) => void;
  // Feature flags for specific functionality testing
  mockData: boolean;
  toggleMockData: () => void;
  slowNetwork: boolean;
  toggleSlowNetwork: () => void;
  showAllFeatures: boolean;
  toggleShowAllFeatures: () => void;
  // Debug options
  showDebugInfo: boolean;
  toggleDebugInfo: () => void;
};

// Initialize from localStorage if available, otherwise default to false
const getInitialState = () => {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem("wedding_planner_dev_mode");
    return stored ? JSON.parse(stored) : false;
  } catch (e) {
    return false;
  }
};

export const useDevModeStore = create<DevModeStore>((set) => ({
  enabled: getInitialState(),
  toggleDevMode: () =>
    set((state) => {
      const newState = !state.enabled;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "wedding_planner_dev_mode",
          JSON.stringify(newState),
        );
      }
      return { enabled: newState };
    }),
  setDevMode: (enabled) =>
    set(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "wedding_planner_dev_mode",
          JSON.stringify(enabled),
        );
      }
      return { enabled };
    }),
  mockData: false,
  toggleMockData: () => set((state) => ({ mockData: !state.mockData })),
  slowNetwork: false,
  toggleSlowNetwork: () =>
    set((state) => ({ slowNetwork: !state.slowNetwork })),
  showAllFeatures: false,
  toggleShowAllFeatures: () =>
    set((state) => ({ showAllFeatures: !state.showAllFeatures })),
  showDebugInfo: false,
  toggleDebugInfo: () =>
    set((state) => ({ showDebugInfo: !state.showDebugInfo })),
}));

// Helper function to simulate network delay
export const simulateNetworkDelay = async () => {
  const { slowNetwork, enabled } = useDevModeStore.getState();
  if (enabled && slowNetwork) {
    // Random delay between 500ms and 3000ms
    const delay = Math.floor(Math.random() * 2500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

// Helper to check if we should use mock data
export const shouldUseMockData = () => {
  const { mockData, enabled } = useDevModeStore.getState();
  return enabled && mockData;
};

// Helper to check if we should show all features
export const shouldShowAllFeatures = () => {
  const { showAllFeatures, enabled } = useDevModeStore.getState();
  return enabled && showAllFeatures;
};

// Helper to check if we should show debug info
export const shouldShowDebugInfo = () => {
  const { showDebugInfo, enabled } = useDevModeStore.getState();
  return enabled && showDebugInfo;
};
