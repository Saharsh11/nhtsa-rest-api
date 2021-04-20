const fetch = require('node-fetch');

let rawOutput = [];
const loadCharacters = async() => {
    const searchVin = document.getElementById("searchBar");
    let vin = searchVin.value;
    var outcome = await fetch(
        "https://vpic.nhtsa.dot.gov/api//vehicles/DecodeVin/" + vin + "?format=json"
    ).then((r) => r.json());

if (false) {
    
} else {
    let output = {};
    // let noNull = [];
    for (i = 0; i < outcome.Results.length; i++) {
        output[outcome.Results[i].Variable] = outcome.Results[i].Value;
    }
    output = onlyValidOutput(output);
    show(output, vin)
}
};

const onlyValidOutput = (obj) => {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === "Not Applicable" || obj[propName] === "") {
            delete obj[propName];
        }
        delete obj['Error Code'];
        delete obj['Error Text'];
    }
    return obj
};

function show(data, vin) {
    let tab =
        `<thead>
        <tr>
        <th>Variables</th>
        <th>Values</th>
       </tr>
       </thead>`;

    // Loop to access all rows 
    tab += `<tbody>
            <tr> 
            <td>VIN</td>
            <td>${vin}</td>
            </tr>`
    for (let r of Object.keys(data)) {
        tab += `<tr> 
        <td>${r} </td>
        <td>${data[r]}</td>
        </tr>`;
    }
    tab += `</tbody>`

    // Setting innerHTML as tab variable
    document.getElementById("table1").innerHTML = tab;
}

document.getElementById("searchBtn").addEventListener("click", function() {
    loadCharacters();
    const searchVin = document.getElementById("searchBar");
});