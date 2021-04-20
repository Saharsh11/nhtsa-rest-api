const express = require('express');
const fetch = require('node-fetch');
const asyncHandler = require('express-async-handler');
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//to be able to render static html page
app.use("/public", express.static("public"));

app.get("/", (req, res) => {
    // res.sendFile(__dirname + 'search.html')
    res.sendFile("search.html", { root: __dirname });
});

//Routes
app.get(
    "/manufacturers",
    asyncHandler(async(req, res,next) => {
        var outcome = await fetch(
            "https://vpic.nhtsa.dot.gov/api/vehicles/GetAllManufacturers?format=json"
        ).then((r) => r.json());
        
        let manufacturer_list = [],temp
        for(i = 0; i < outcome.Results.length; i++){
            if(!(outcome.Results[i].Mfr_CommonName === null)){
                temp = outcome.Results[i].Mfr_CommonName.toString()
            }else{
                temp = outcome.Results[i].Mfr_Name.toString()
            }
            manufacturer_list.push(temp)
        }
        outcome = {
            "Total Manufacturers": manufacturer_list.length,
            "Manufacturers List" : manufacturer_list
        }
        res.send(outcome);
    })
);

app.get(
    "/manufacturers/:name",
    asyncHandler(async(req, res) => {
        if(!req.params.name.trim()){
            res.status(400).send({"Result":"Bad Request"})
        }else{
            var outcome = await fetch(
                "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakeForManufacturer/" +
                req.params.name +
                "?format=json"
            ).then((r) => r.json())
            res.status(200).send(outcome);
        }
    })
);

//fetching  Year, make, and model from requested VIN Number
//Routes
app.get(
    "/manufacturers/vin/:vin_number",
    asyncHandler(async(req, res) => {
        let vin = req.params.vin_number;
        if(!vin.trim()){
            res.status(400).send({"Result":"Bad vin number input"})
        }else{
            var outcome = await fetch(
                "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" +
                vin +
                "?format=json"
            ).then((r) => r.json())
            
            info =
                outcome.Results[9].Value +
                " " +
                outcome.Results[6].Value +
                " " +
                outcome.Results[8].Value;
    
            //Creating a json object with vin number a key and value having concatenated Year, Make, and Model respectively.
            let output = {};
            output[vin.toString()] = info;
    
            res.status(200).send(output);    
        }
    })
);

//Routes
app.get(
    "/manufacturers/Validate_vin/:vin",
    asyncHandler(async(req, res) => {
        var vin = req.params.vin;
            var outcome = await fetch(
                "https://vpic.nhtsa.dot.gov/api//vehicles/DecodeVin/" +
                vin +
                "?format=json"
            ).then((r) => r.json());
    
               if (outcome.Results[1].Value === "0") {
                res.status(200).send({"Result":"VIN Valid!"});
            } else {
                res.status(400).send({"Result":"VIN Invalid!"});
            }
    })
);

//Routes
app.get(
    "/manufacturers/search/:vin_number",
    asyncHandler(async(req, res) => {
        let vin = req.params.vin_number;
        if (!vin.trim()){
            res.status(400).send({"Result":"Bad Request"})            
        } else {
            var outcome = await fetch(
                "https://vpic.nhtsa.dot.gov/api//vehicles/DecodeVin/" +
                vin +
                "?format=json"
            ).then((r) => r.json());
    
            let output = {};
    
            for (i = 0; i < outcome.Results.length; i++) {
                
                output[outcome.Results[i].Variable] = outcome.Results[i].Value;
            }
            res.send(output);
        }
    })
);
module.exports = app

app.listen(4000, () => console.log("port running on port 4000"));