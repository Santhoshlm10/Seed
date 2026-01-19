/* eslint-disable @typescript-eslint/no-explicit-any */
import { LatOrLong, Parameter } from "../models/Playground";

export function insertSelectedOption(keyName: string, data: Parameter) {
  return {
    ...data,
    returnType: {
      ...data.returnType,
      selectedValue: keyName,
    },
  };
}
export function insertOptionsValue(
  value: string | number | boolean,
  keyName: string,
  data: Parameter,
  isLatLong?: boolean,
  cordinate?: LatOrLong
) {
  return {
    ...data,
    options:
      data.options?.map((i) => {
        if (i.keyName === keyName) {
          if (isLatLong) {
            return {
              ...i,
              selectedValue:
                cordinate === "lat"
                  ? [value, i?.selectedValue?.[1]]
                  : [i?.selectedValue?.[0], value],
            };
          }
          return {
            ...i,
            selectedValue: value,
          };
        }
        return i;
      }) || [],
  };
}

export function convertSecondsToTimeFormat(seconds: number) {
  if (seconds <= 60) {
    return `${seconds} sec`;
  } else if (seconds > 60 && seconds <= 3600) {
    const mins = seconds / 60;
    return `${mins.toFixed(1)} min`;
  } else {
    const hours = seconds / 3600;
    return `${hours.toFixed(1)} hrs`;
  }
}

export function createFakerColumnMapping(data: any, faker: any) {
  console.log("GenerateData",data)
  return {
    name: faker.internet.username(),
  };
}

export function generateData(columnMapping: any, count: any, faker: any) {
  const generateRecord = () => {
    const record: any = {};

    for (const column in columnMapping) {
      record[column] = columnMapping[column]();
    }

    return record;
  };
  const data = faker.helpers.multiple(generateRecord, {
    count: count,
  });
  return data;
}

export function generateTestData(selectedItems: Parameter[]) {
  console.log("GenerateFakedata", selectedItems);
}
