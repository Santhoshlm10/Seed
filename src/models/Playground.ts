export type FileTypes = "xlsx" | "csv" | "json" | "xml" | "yaml" | "sql" | "mongo";

export interface PlaygroundProps {
    setSelectedItems: (data:Parameter[]) => void;
    selectedItems:Parameter[]
}

export interface Group {
    groupName: string ;
    groupValue: Parameter[];
}

export interface Parameter {
    parameterName: string;
    searchQueries: string[];
    category: string;
    subCategory: string;
    description: string;
    returnType: ReturnType;
    options: Option[] | null;
    id?:string;
    columnName?:string
}

interface ReturnType {
    type: string;
    values: ReturnTypeValue[] | [];
    selectedValue?: string;
}

export interface ReturnTypeValue {
    name?: string;
    key?: string;
    type?: string;
}

export interface Option {
    name: string;
    keyName: string;
    type: string;
    description?: string;
    defaultValue?: boolean | string | number | number[] | string[];
    selectValues?: SelectValue[];
    children?: OptionChild[];
    selectedValue?: string;
    minRange?: number,
    maxRange?: number,
    value?:boolean | string | number | number[] | string[];
}

interface SelectValue {
    key: string;
    label: string;
}

interface OptionChild {
    name: string;
    keyName: string;
    type: string;
    description?: string;
    defaultValue?: boolean | string | number;
    selectValues?: SelectValue[];
    children?: OptionChild[];
    selectedValue: string;
}

export type DataSource = {
    [key:string]: Group
}
export interface FeatureContent {
    description:string;
    headerTitle:string;
    imageURL:string;
}
export type MultiSelectOption = {
    key:string;
    label:string;
}
export type LatOrLong = "lat" | "lng"