import { faker } from "@faker-js/faker";
import * as XLSX from "xlsx";
import jsontoxml from "jsontoxml";

self.onmessage = function (event) {
  const { type, schema, count, data, format, fileName, tableName, collectionName } = event.data;

  const generateData = (schema, count, reportProgress) => {
    const generated = [];
    const totalCount = parseInt(count);
    const progressStep = 100;

    for (let i = 0; i < totalCount; i++) {
      const record = {};
      schema.forEach(field => {
        const { category, subCategory, parameterName, options } = field;
        try {
          if (faker[category] && typeof faker[category][subCategory] === 'function') {
            // Build options object from parameter options
            const fakerOptions = {};
            if (options && Array.isArray(options)) {
              options.forEach(option => {
                // Use 'value' property (configured by user) instead of defaultValue
                if (option.keyName && option.value !== undefined) {
                  let optionValue = option.value;

                  // Convert date strings to Date objects for faker
                  if (option.type === 'date' && typeof optionValue === 'string') {
                    optionValue = new Date(optionValue);
                  }

                  fakerOptions[option.keyName] = optionValue;
                }
              });
            }

            // Call faker function with options if available
            if (Object.keys(fakerOptions).length > 0) {
              record[parameterName] = faker[category][subCategory](fakerOptions);
            } else {
              record[parameterName] = faker[category][subCategory]();
            }
          } else {
            record[parameterName] = null;
          }
        } catch (e) {
          console.error(`Error generating field ${parameterName}:`, e);
          record[parameterName] = null;
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
