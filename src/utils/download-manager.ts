import * as XLSX from "xlsx";
import yaml from "js-yaml";
import jsontoxml from "jsontoxml";
import { Parameter } from "../models/Playground";
import {
  DEFAULT_AFFIXES,
  FILE_BLOB_TYPES,
  FILE_TYPES,
} from "../models/DownloadManager";

type DataFeed = Record<string, string | number | boolean | null>;

export type DataArray = {
  data: DataFeed[];
};

class DownloadManagerClass {
  private createAndDownloadBlob(
    content: string,
    mimeType: string,
    fileName: string
  ): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (error) {
      throw new Error(
        `Failed to download file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private validateData(data: DataArray): void {
    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error("Data array is empty or invalid");
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[<>:"/\\|?*]/g, "_");
  }

  saveAsExcel(data: DataArray, filename: string): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(filename);

      const ws = XLSX.utils.json_to_sheet(data.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, DEFAULT_AFFIXES.SHEET);
      XLSX.writeFile(wb, `${sanitizedFilename}${FILE_TYPES.XLSX}`);
    } catch (error) {
      throw new Error(
        `Failed to save Excel file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveAsCSV(data: DataArray, fileName: string): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(fileName);

      const columns = Object.keys(data.data[0]);

      const sanitizeValue = (value: unknown): string => {
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvContent = [
        columns.map(sanitizeValue).join(","),
        ...data.data.map((row: DataFeed) =>
          columns.map((col) => sanitizeValue(row[col])).join(",")
        ),
      ].join("\n");

      this.createAndDownloadBlob(
        csvContent,
        FILE_BLOB_TYPES.CSV,
        `${sanitizedFilename}${FILE_TYPES.CSV}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save CSV file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveAsJSON(data: DataArray, fileName: string): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(fileName);

      const jsonContent = JSON.stringify(data.data, null, 2);
      this.createAndDownloadBlob(
        jsonContent,
        FILE_BLOB_TYPES.JSON,
        `${sanitizedFilename}${FILE_TYPES.JSON}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save JSON file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveAsXML(data: DataArray, fileName: string): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(fileName);

      // Better XML structure - wrap in root element
      const xmlData = { records: { record: data.data } };
      const xml = jsontoxml(xmlData, { prettyPrint: true });
      this.createAndDownloadBlob(
        xml,
        FILE_BLOB_TYPES.XML,
        `${sanitizedFilename}${FILE_TYPES.XML}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save XML file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveAsSQLInsert(
    data: DataArray,
    fileName: string,
    tableName: string = "TABLE_NAME"
  ): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(fileName);

      const columns = Object.keys(data.data[0]);
      const escapeValue = (value: unknown): string => {
        if (value === null || value === undefined) return "NULL";
        if (typeof value === "string") {
          return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        }
        return String(value);
      };

      const values = data.data
        .map(
          (item: DataFeed) =>
            `(${Object.values(item).map(escapeValue).join(", ")})`
        )
        .join(",\n  ");

      const sqlContent = `INSERT INTO ${tableName} (${columns.join(
        ", "
      )}) VALUES\n  ${values};`;
      this.createAndDownloadBlob(
        sqlContent,
        FILE_BLOB_TYPES.SQL,
        `${sanitizedFilename}${FILE_TYPES.SQL}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save SQL file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveAsYAML(data: DataArray, fileName: string): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(fileName);

      const yamlData = yaml.dump(data.data);
      this.createAndDownloadBlob(
        yamlData,
        FILE_BLOB_TYPES.YAML,
        `${sanitizedFilename}${FILE_TYPES.YAML}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save YAML file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveAsMongoInsert(
    data: DataArray,
    fileName: string,
    collectionName: string = "myCollection"
  ): void {
    try {
      this.validateData(data);
      const sanitizedFilename = this.sanitizeFileName(fileName);

      const documents = data.data
        .map((doc: DataFeed) => `  ${JSON.stringify(doc)}`)
        .join(",\n");

      const mongoContent = `db.${collectionName}.insertMany([\n${documents}\n]);`;
      this.createAndDownloadBlob(
        mongoContent,
        FILE_BLOB_TYPES.JAVASCRIPT,
        `${sanitizedFilename}${FILE_TYPES.JAVASCRIPT}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save MongoDB file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  saveTemplate(data: Parameter[], playgroundName: string, count: string): void {
    try {
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid template data provided");
      }

      const sanitizedPlaygroundName = this.sanitizeFileName(playgroundName);

      const downloadTemplate = {
        data,
        playgroundName,
        count,
      };

      const jsonContent = JSON.stringify(downloadTemplate, null, 2);
      const fileName = `${sanitizedPlaygroundName}${DEFAULT_AFFIXES.TEMPLATE}`;

      this.createAndDownloadBlob(
        jsonContent,
        FILE_BLOB_TYPES.JSON,
        `${fileName}${FILE_TYPES.JSON}`
      );
    } catch (error) {
      throw new Error(
        `Failed to save template: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

}

const DownloadManager = new DownloadManagerClass();
export default DownloadManager;
