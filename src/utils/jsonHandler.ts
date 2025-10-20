// Utility function to download data as JSON file
export const downloadJSON = (data: any, fileName: string = "data.json") => {
  // Create a JSON string from the data
  let jsonString: string;
  try {
    jsonString = JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(
      "Failed to serialize data to JSON: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  // Use modern remove() method instead of removeChild() for cleaner code
  link.remove();
  URL.revokeObjectURL(url);
};

// Utility function to upload and parse JSON file
// Refactored to use modern Blob#text() API instead of FileReader
export const uploadJSON = (file: File): Promise<any> => {
  return file
    .text()
    .then((text) => {
      try {
        const json = JSON.parse(text);
        return json;
      } catch (error) {
        // Enhanced error handling: include original error details for better debugging
        throw new Error(
          "Invalid JSON file: " +
            (error instanceof Error ? error.message : String(error))
        );
      }
    })
    .catch((error) => {
      throw error instanceof Error ? error : new Error("Failed to read file");
    });
};
