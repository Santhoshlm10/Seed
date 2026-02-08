import { faker } from "@faker-js/faker";

self.onmessage = function (event) {
  const { type, schema, count } = event.data;

  if (type === 'GENERATE') {
    try {
      if (!schema || !Array.isArray(schema) || typeof count !== 'number') {
        throw new Error("Invalid input parameters");
      }

      const generatedData = [];
      const totalCount = parseInt(count);
      // const progressStep = Math.max(1, Math.floor(totalCount / 100)); // Report progress every 1% or at least 1 record
      const progressStep = 100
      for (let i = 0; i < totalCount; i++) {
        const record = {};

        schema.forEach(field => {
          const { category, subCategory, parameterName } = field;
          // Dynamic faker generation
          try {
            // @ts-ignore
            if (faker[category] && typeof faker[category][subCategory] === 'function') {
              // Check if any options or arguments are needed. 
              // For simplified dynamic access, we just call it.
              // If specific args are needed based on `field.options`, logic should go here.
              // @ts-ignore
              record[parameterName] = faker[category][subCategory]();
            } else {
              // Fallback or error handling for invalid path
              record[parameterName] = null;
            }
          } catch (e) {
            console.error(`Error generating field ${parameterName}:`, e);
            record[parameterName] = null;
          }
        });

        generatedData.push(record);

        // Report progress
        if (i % progressStep === 0) {
          const progress = Math.round((i / totalCount) * 100);
          self.postMessage({ type: 'PROGRESS', progress });
        }
      }

      self.postMessage({ type: 'RESULT', data: generatedData });

    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};
