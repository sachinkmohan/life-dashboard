// NEW: Composable for centralized data management logic
// This handles all localStorage operations for backup and restore

/**
 * Get all application data from localStorage for export
 * @returns Object containing all app data
 */
export const getAllAppData = () => {
  return {
    tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
    otherTasks: JSON.parse(localStorage.getItem("otherTasks") || "[]"),
    weeklyProgressTasks: JSON.parse(
      localStorage.getItem("weeklyProgressTasks") || "[]"
    ),
    readingTrackerTasks: JSON.parse(
      localStorage.getItem("readingTrackerTasks") || "[]"
    ),
    todaysFocusItems: JSON.parse(
      localStorage.getItem("todaysFocusItems") || "[]"
    ),
    countdowns: JSON.parse(localStorage.getItem("countdowns") || "[]"),
    otherTasksWeeklyStats: JSON.parse(
      localStorage.getItem("otherTasksWeeklyStats") || "{}"
    ),
    timeByUser: localStorage.getItem("timeByUser") || "00:00:00",
    exportDate: new Date().toISOString(),
    version: "1.0.0", // NEW: Version for future compatibility checks
  };
};

/**
 * Restore uploaded data to localStorage and reload the page
 * @param data - The uploaded data object
 * @throws Error if data restoration fails
 */
export const restoreAppData = (data: any): void => {
  try {
    // NEW: Restore each data type to localStorage with validation
    if (data.tasks) {
      localStorage.setItem("tasks", JSON.stringify(data.tasks));
    }
    if (data.otherTasks) {
      localStorage.setItem("otherTasks", JSON.stringify(data.otherTasks));
    }
    if (data.weeklyProgressTasks) {
      localStorage.setItem(
        "weeklyProgressTasks",
        JSON.stringify(data.weeklyProgressTasks)
      );
    }
    if (data.readingTrackerTasks) {
      localStorage.setItem(
        "readingTrackerTasks",
        JSON.stringify(data.readingTrackerTasks)
      );
    }
    if (data.todaysFocusItems) {
      localStorage.setItem(
        "todaysFocusItems",
        JSON.stringify(data.todaysFocusItems)
      );
    }
    if (data.countdowns) {
      localStorage.setItem("countdowns", JSON.stringify(data.countdowns));
    }
    if (data.otherTasksWeeklyStats) {
      localStorage.setItem(
        "otherTasksWeeklyStats",
        JSON.stringify(data.otherTasksWeeklyStats)
      );
    }
    if (data.timeByUser) {
      localStorage.setItem("timeByUser", data.timeByUser);
    }

    // NEW: Reload page to reflect all changes across components
    // MODIFIED: Use globalThis instead of window for better compatibility
    globalThis.location.reload();
  } catch (error) {
    console.error("Failed to restore data:", error);
    throw new Error("Data restoration failed. Please check the file format.");
  }
};

/**
 * Validate uploaded data structure
 * @param data - Data to validate
 * @returns true if valid, false otherwise
 */
export const validateAppData = (data: any): boolean => {
  // NEW: Basic validation to ensure data has expected structure
  if (!data || typeof data !== "object") {
    return false;
  }

  // Check if at least one expected property exists
  const expectedKeys = [
    "tasks",
    "otherTasks",
    "weeklyProgressTasks",
    "readingTrackerTasks",
    "todaysFocusItems",
    "countdowns",
  ];

  return expectedKeys.some((key) => key in data);
};
