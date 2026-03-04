import fs from "fs"

const data = fs.readFileSync('./../resources/data.json', 'utf8');
const jsonData = JSON.parse(data);
let types = [""]
let match = []
for(let i in jsonData){
    let gp = jsonData[i]["groupValue"]
    gp.map((item) => {
        if(item.options){
            item.options.map((i) => {
                if(!types.includes(i.type)){
                    types.push(i.type)
                   
                }
                 if(i.type == "multiSelect"){
                     match.push(item)
                    }
            })
        }
    })
}
console.log(match)


// [
//     '',            'boolean',
//     'object',      'select',
//     'string',      'number',
//     'date',        'range',
//     'multiSelect', 'latlong'
//   ]