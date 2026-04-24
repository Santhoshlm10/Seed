import { faker } from "@faker-js/faker";
import * as XLSX from "xlsx";
import jsontoxml from "jsontoxml";

self.onmessage = function (event) {
  const { type, schema, count, data, format, fileName, tableName, collectionName } = event.data;

  const generateData = (schema, count, reportProgress) => {
    console.log("GenerateData", schema)
    const generated = [];
    const totalCount = parseInt(count);
    const progressStep = 100;

    for (let i = 0; i < totalCount; i++) {
      const record = {};
      schema.forEach(field => {
        const { category, subCategory, parameterName, columnName, options } = field;
        const key = (columnName || parameterName).replace(/\s+/g, "");
        try {
          const fakerOptions = {};
          if (faker[category] && typeof faker[category][subCategory] === 'function') {

            // --- Special case: faker.helpers.fromRegExp(pattern) ---
            if (category === 'helpers' && subCategory === 'fromRegExp') {
              const patternOption = options && Array.isArray(options)
                ? options.find(o => o.keyName === 'pattern')
                : null;
              const rawPattern = patternOption
                ? (patternOption.value !== undefined ? patternOption.value : patternOption.defaultValue)
                : null;

              let result;
              if (rawPattern) {
                try {
                  result = faker.helpers.fromRegExp(new RegExp(rawPattern));
                } catch (regexErr) {
                  console.warn(`[${key}] Invalid regex pattern "${rawPattern}": ${regexErr.message}. Falling back to default.`);
                  result = faker.helpers.fromRegExp(/[A-Z]{2}[0-9]{4}/);
                }
              } else {
                result = faker.helpers.fromRegExp(/[A-Z]{2}[0-9]{4}/);
              }

              record[key] = result;
              // Skip the rest of the generic processing for this field
              return;
            }
            // --- Special case: faker.helpers.arrayElement(array) ---
            if (category === 'helpers' && subCategory === 'arrayElement') {
              const arrayOption = options && Array.isArray(options)
                ? options.find(o => o.keyName === 'array')
                : null;
              const rawArray = arrayOption
                ? (arrayOption.value !== undefined && arrayOption.value !== "" ? arrayOption.value : arrayOption.defaultValue)
                : null;

              let result;
              if (rawArray) {
                const arr = typeof rawArray === 'string' ? rawArray.split(',').map(s => s.trim()).filter(s => s.length > 0) : rawArray;
                if (arr && arr.length > 0) {
                  result = faker.helpers.arrayElement(arr);
                } else {
                  result = faker.helpers.arrayElement(['a', 'b', 'c']);
                }
              } else {
                result = faker.helpers.arrayElement(['a', 'b', 'c']);
              }

              record[key] = result;
              // Skip the rest of the generic processing for this field
              return;
            }
            // --------------------------------------------------------

            // Build options object from parameter options
            if (options && Array.isArray(options)) {
              const setNestedProperty = (obj, path, value) => {
                const parts = path.split('.');
                let current = obj;
                for (let i = 0; i < parts.length - 1; i++) {
                  const part = parts[i];
                  if (!(part in current)) {
                    current[part] = {};
                  }
                  current = current[part];
                }
                current[parts[parts.length - 1]] = value;
              };

              const parseOptions = (opts) => {
                opts.forEach(option => {
                  // If this is a container object with children, skip the parent value
                  // and only process the children (e.g. 'length' with 'length.min'/'length.max')
                  if (option.type === 'object' && option.children && option.children.length > 0) {
                    parseOptions(option.children);
                    return;
                  }

                  const optionValue = option.value !== undefined ? option.value : option.defaultValue;
                  
                  if (option.keyName && optionValue !== undefined && optionValue !== "") {
                    let processedValue = optionValue;

                    // Cast to number if the option type is number
                    if (option.type === 'number') {
                      processedValue = Number(processedValue);
                    }

                    // Convert date strings to Date objects for faker
                    if (option.type === 'date' && typeof processedValue === 'string') {
                      processedValue = new Date(processedValue);
                    }

                    // Skip invalid numbers
                    if (option.type === 'number' && isNaN(processedValue)) {
                      return;
                    }

                    setNestedProperty(fakerOptions, option.keyName, processedValue);
                  }
                });
              };

              parseOptions(options);

              // Safeguard: normalize fakerOptions.length to a valid number or {min, max} object
              if (fakerOptions.length !== undefined) {
                if (typeof fakerOptions.length === 'string' || typeof fakerOptions.length === 'number') {
                  // Convert string "3" -> number 3, clamp to at least 1
                  const n = Math.max(1, parseInt(fakerOptions.length) || 1);
                  fakerOptions.length = n;
                } else if (typeof fakerOptions.length === 'object') {
                  let { min, max } = fakerOptions.length;
                  min = Math.max(1, Number(min) || 1);
                  max = Math.max(min, Number(max) || min);
                  fakerOptions.length = { min, max };
                }
              }
            }

            // Call faker function with options if available
            let result;
            if (Object.keys(fakerOptions).length > 0) {
              try {
                result = faker[category][subCategory](fakerOptions);
              } catch (optErr) {
                // Options caused an error — store debug info in field and retry without options
                console.warn(`[${key}] Options caused error: ${optErr.message}. fakerOptions: ${JSON.stringify(fakerOptions)}. Retrying without options.`);
                record[key] = `[DEBUG - bad options: ${JSON.stringify(fakerOptions)}]`;
                result = faker[category][subCategory]();
              }
            } else {
              result = faker[category][subCategory]();
            }

            // Handle return type for object types with selectedValue
            if (field.returnType && field.returnType.type === "object" && field.returnType.selectedValue) {
              record[key] = result ? result[field.returnType.selectedValue] : null;
            } else if (!record[key]?.startsWith?.('[DEBUG')) {
              record[key] = result;
            }
          } else {
            record[key] = null;
          }
        } catch (e) {
          console.error(`Error generating field ${key}:`, e);
          record[key] = null;
        }
      });
      generated.push(record);
      if (reportProgress && i % progressStep === 0) {
        reportProgress(i, totalCount);
      }
    }
    return generated;
  };

  if (type === 'GENERATE') {
    try {
      if (!schema || !Array.isArray(schema) || typeof count !== 'number') {
        throw new Error("Invalid input parameters");
      }

      const reportProgress = (current, total) => {
        const progress = Math.round((current / total) * 100);
        self.postMessage({ type: 'PROGRESS', progress });
      };

      const generatedData = generateData(schema, count, reportProgress);
      self.postMessage({ type: 'RESULT', data: generatedData });

    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  } else if (type === 'DOWNLOAD') {
    try {
      let dataToProcess = data;

      const reportProgress = (current, total, phase) => {
        let progress;
        if (phase === 'generation') {
          progress = Math.round((current / total) * 50);
        } else {
          progress = 50 + Math.round((current / total) * 50);
        }
        self.postMessage({ type: 'PROGRESS', progress });
      };

      if (!dataToProcess || !Array.isArray(dataToProcess) || dataToProcess.length === 0) {
        if (!schema || !count) {
          throw new Error("Schema and count are required for generation during download");
        }
        const genProgress = (c, t) => reportProgress(c, t, 'generation');
        dataToProcess = generateData(schema, count, genProgress);
      }

      if (!dataToProcess || !Array.isArray(dataToProcess)) {
        throw new Error("Invalid data for download");
      }

      let content;
      let mimeType;
      let extension;

      const formatProgress = (c, t) => reportProgress(c, t, 'formatting');

      switch (format) {
        case 'excel':
          self.postMessage({ type: 'PROGRESS', progress: 50 });
          const ws = XLSX.utils.json_to_sheet(dataToProcess);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
          content = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = '.xlsx';
          break;

        case 'csv':
          const columns = Object.keys(dataToProcess[0]);
          const csvRows = [];
          csvRows.push(columns.join(","));

          dataToProcess.forEach((row, index) => {
            if (index % 100 === 0) formatProgress(index, dataToProcess.length);
            const values = columns.map(col => {
              const val = row[col];
              if (val === null || val === undefined) return "";
              const stringValue = String(val);
              if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            });
            csvRows.push(values.join(","));
          });
          content = csvRows.join("\n");
          mimeType = 'text/csv';
          extension = '.csv';
          break;

        case 'json':
          self.postMessage({ type: 'PROGRESS', progress: 75 });
          content = JSON.stringify(dataToProcess, null, 2);
          mimeType = 'application/json';
          extension = '.json';
          break;

        case 'xml':
          self.postMessage({ type: 'PROGRESS', progress: 75 });
          content = jsontoxml({ records: { record: dataToProcess } }, { prettyPrint: true });
          mimeType = 'application/xml';
          extension = '.xml';
          break;

        case 'sql':
          const sqlColumns = Object.keys(dataToProcess[0]);
          const sqlValues = [];
          dataToProcess.forEach((row, index) => {
            if (index % 100 === 0) formatProgress(index, dataToProcess.length);
            const vals = sqlColumns.map(col => {
              const val = row[col];
              if (val === null || val === undefined) return "NULL";
              if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
              return String(val);
            });
            sqlValues.push(`(${vals.join(", ")})`);
          });
          content = `INSERT INTO ${tableName || 'TABLE_NAME'} (${sqlColumns.join(", ")}) VALUES\n ${sqlValues.join(",\n ")};`;
          mimeType = 'application/sql';
          extension = '.sql';
          break;

        case 'mongo':
          const mongoDocs = [];
          dataToProcess.forEach((row, index) => {
            if (index % 100 === 0) formatProgress(index, dataToProcess.length);
            mongoDocs.push(`  ${JSON.stringify(row)}`);
          });
          content = `db.${collectionName || 'myCollection'}.insertMany([\n${mongoDocs.join(",\n")}\n]);`;
          mimeType = 'application/javascript';
          extension = '.js';
          break;

        default:
          throw new Error("Unsupported format");
      }

      self.postMessage({ type: 'DOWNLOAD_RESULT', content, mimeType, fileName: fileName + extension });

    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};
