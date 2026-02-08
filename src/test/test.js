import { faker } from '@faker-js/faker';

function createFakerColumnMapping(data, faker) {
    const columnMapping = {};
    
    data.forEach(item => {
      // Set up the column property as a function that calls the appropriate faker method
      columnMapping[item.columnName] = () => {
        // Access the faker category and subcategory dynamically
        const fakerMethod = faker[item.category][item.subCategory];
        
        // Process options if they exist
        let options = {};
        if (item.options && item.options.length > 0) {
          item.options.forEach(option => {
            // Handle nested options (like length.min, length.max)
            if (option.type === "object" && option.children) {
              const parentKey = option.keyName.split('.')[0];
              options[parentKey] = options[parentKey] || {};
              
              option.children.forEach(child => {
                const childKey = child.keyName.split('.')[1];
                if (child.defaultValue !== undefined) {
                  options[parentKey][childKey] = child.defaultValue;
                }
              });
            } 
            // Handle simple options
            else if (option.defaultValue !== undefined) {
              options[option.keyName] = option.defaultValue;
            }
            // Handle select options
            else if (option.type === "select" && option.selectedValue) {
              options[option.keyName] = option.selectedValue;
            }
          });
        }
        
        // Call the faker method with options
        const result = Object.keys(options).length > 0 ? 
                       fakerMethod(options) : 
                       fakerMethod();
        
        // Handle return type for object types with selectedValue
        if (item.returnType.type === "object" && item.returnType.selectedValue) {
          return result[item.returnType.selectedValue];
        }
        
        return result;
      };
    });
    
    return columnMapping;
  }


  const DATA  = [
    {
        "parameterName": "Flight Number",
        "searchQueries": [
            "airplane",
            "air",
            "aircraft line",
            "flightNumber"
        ],
        "category": "airline",
        "subCategory": "flightNumber",
        "description": "Returns a random flight number.",
        "returnType": {
            "type": "string",
            "values": []
        },
        "options": [
            {
                "name": "Add leading zeros",
                "keyName": "addLeadingZeros",
                "type": "boolean",
                "description": "Whether to pad the flight number up to 4 digits with leading zeros.",
                "defaultValue": false
            },
            {
                "name": "Length",
                "keyName": "length",
                "type": "object",
                "children": [
                    {
                        "name": "Min value",
                        "keyName": "length.min",
                        "type": "number",
                        "description": "The minimum number of digits to generate."
                    },
                    {
                        "name": "Max value",
                        "keyName": "length.max",
                        "type": "number",
                        "description": "The maximum number of digits to generate."
                    }
                ],
                "description": "The number or range of digits to generate."
            }
        ],
        "id": "1742423936754",
        "columnName": "FlightNumber"
    },
    {
        "parameterName": "Seat",
        "searchQueries": [
            "airplane",
            "air",
            "Seat"
        ],
        "category": "airline",
        "subCategory": "seat",
        "description": "Generates a random seat.",
        "returnType": {
            "type": "string",
            "values": []
        },
        "options": [
            {
                "name": "Aircraft type",
                "keyName": "aircraftType",
                "type": "select",
                "selectValues": [
                    {
                        "key": "narrowbody",
                        "label": "Narrow Body"
                    },
                    {
                        "key": "regional",
                        "label": "Regional"
                    },
                    {
                        "key": "widebody",
                        "label": "Widebody"
                    }
                ],
                "description": "Whether to pad the flight number up to 4 digits with leading zeros.",
                "defaultValue": "",
                "selectedValue": "regional"
            }
        ],
        "id": "1742423952218",
        "columnName": "SeatNumber"
    },
    {
        "parameterName": "Adjective",
        "searchQueries": [
            "food",
            "adjective"
        ],
        "category": "food",
        "subCategory": "adjective",
        "description": "Generates a random dish adjective.",
        "returnType": {
            "type": "string",
            "values": []
        },
        "options": [],
        "id": "1742423964530",
        "columnName": "FoodPreference"
    },
    {
        "parameterName": "Avatar",
        "searchQueries": [
            "image",
            "avatar"
        ],
        "category": "image",
        "subCategory": "avatar",
        "description": "Generates a random avatar image url.",
        "returnType": {
            "type": "string",
            "values": []
        },
        "options": [],
        "id": "1742423975490",
        "columnName": "Image"
    },
    {
        "parameterName": "Sentence",
        "searchQueries": [
            "lorem",
            "sentence"
        ],
        "category": "lorem",
        "subCategory": "sentence",
        "description": "Generates a space separated list of words beginning with a capital letter and ending with a period.",
        "returnType": {
            "type": "string",
            "values": []
        },
        "options": [
            {
                "name": "Min",
                "keyName": "min",
                "type": "number",
                "description": "The minimum number of words to generate.",
                "defaultValue": "10"
            },
            {
                "name": "Max",
                "keyName": "max",
                "type": "number",
                "description": "The maximum number of words to generate.",
                "defaultValue": "30"
            }
        ],
        "id": "1742423984706",
        "columnName": "Sentences"
    },
    {
        "parameterName": "Air Line",
        "searchQueries": [
            "airplane",
            "air",
            "aircraft line"
        ],
        "category": "airline",
        "subCategory": "airline",
        "description": "Generates a random airline",
        "returnType": {
            "type": "object",
            "values": [
                {
                    "name": "Name",
                    "key": "name",
                    "type": "string"
                },
                {
                    "name": "IATA Code",
                    "key": "iataCode",
                    "type": "string"
                }
            ],
            "selectedValue": "name"
        },
        "options": null,
        "id": "1742424033859",
        "columnName": "AirLine"
    }
]
  
  const fakerData = DATA
  const data = createFakerColumnMapping(fakerData);
  console.log(data)
   const users = faker.helpers.multiple(data, {
    count: 5,
  });
