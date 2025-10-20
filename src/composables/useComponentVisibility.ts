import { ref, watch } from "vue";

// Interface for component visibility state
interface ComponentVisibility {
  weather: boolean;
  calendar: boolean;
  todos: boolean;
  habits: boolean;
  notes: boolean;
  quotes: boolean;
}

// Default visibility - all components visible by default
const DEFAULT_VISIBILITY: ComponentVisibility = {
  weather: true,
  calendar: true,
  todos: true,
  habits: true,
  notes: true,
  quotes: true,
};

// LocalStorage key for persistence
const STORAGE_KEY = "life-dashboard-component-visibility";

/**
 * Composable to manage component visibility state
 * Handles localStorage persistence and provides toggle functionality
 */
export function useComponentVisibility() {
  // Load visibility state from localStorage or use defaults
  const loadVisibility = (): ComponentVisibility => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load component visibility:", error);
    }
    return { ...DEFAULT_VISIBILITY };
  };

  // Reactive visibility state
  const visibility = ref<ComponentVisibility>(loadVisibility());

  // Watch for changes and save to localStorage
  watch(
    visibility,
    (newVisibility) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibility));
      } catch (error) {
        console.error("Failed to save component visibility:", error);
      }
    },
    { deep: true }
  );

  // Toggle visibility for a specific component
  const toggleComponent = (component: keyof ComponentVisibility) => {
    visibility.value[component] = !visibility.value[component];
  };

  // Set visibility for a specific component
  const setComponentVisibility = (
    component: keyof ComponentVisibility,
    visible: boolean
  ) => {
    visibility.value[component] = visible;
  };

  // Reset all to default visibility
  const resetToDefaults = () => {
    visibility.value = { ...DEFAULT_VISIBILITY };
  };

  return {
    visibility,
    toggleComponent,
    setComponentVisibility,
    resetToDefaults,
  };
}
