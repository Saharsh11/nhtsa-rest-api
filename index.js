const express = require('express');
const fetch = require('node-fetch');
const asyncHandler = require('express-async-handler');
const swaggerUi = require('swagger-ui-express')
//const swaggerJsDoc = require('swagger-jsdoc')
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
        var outcome = await fetch(
            "https://vpic.nhtsa.dot.gov/api/vehicles/GetMakeForManufacturer/" +
            req.params.name +
            "?format=json"
        ).then((r) => r.json())
        res.send(outcome);
    })
);

//fetching  Year, make, and model from requested VIN Number
//Routes
app.get(
    "/manufacturers/vin/:vin_number",
    asyncHandler(async(req, res) => {
        let vin = req.params.vin_number;
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

        res.send(output);
    })
);

//Routes
app.get(
    "/manufacturers/Validate_vin/:vin",
    asyncHandler(async(req, res) => {
        var vin = req.params.vin;
        // Created JS enum to define character weights
        const transliteration_values = {
            A: 1,
            B: 2,
            C: 3,
            D: 4,
            E: 5,
            F: 6,
            G: 7,
            H: 8,
            J: 1,
            K: 2,
            L: 3,
            M: 4,
            N: 5,
            P: 7,
            R: 9,
            S: 2,
            T: 3,
            U: 4,
            V: 5,
            W: 6,
            X: 7,
            Y: 8,
            Z: 9,
        };

        // Array contains
        const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

        let i = 0,
            val,
            sum = 0;
        for (let abc of vin) {
            if (!(abc in transliteration_values)) {
                val = parseInt(abc);
            } else {
                val = transliteration_values[abc];
            }
            sum = sum + val * weights[i];
            if (i == 8) {
                vin_checker = val;
            }
            i++;
        }
        // let clr = sum%11
        if (vin_checker == sum % 11) {
            res.status(200).send("VIN Valid!");
        } else {
            res.status(300).send("VIN InValid!");
        }
    })
);

//Routes
app.get(
    "/search/:vin_number",
    asyncHandler(async(req, res) => {
        let vin = req.params.vin_number;
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
    })
);

app.listen(4000, () => console.log("port running on port 4000"));