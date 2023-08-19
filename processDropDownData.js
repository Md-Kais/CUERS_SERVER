const { loadData } = require('./loadData.js');
const { conn } = require('./connectDatabase.js');
const toEnglishNumber = require('./Modules/toEnglishNumber.js');
const toBanglaNumber = require('./Modules/toBanglaNumber.js');

const fs = require('fs');

async function processDropDownData(props) {
    const {
        dynamicOps,
        tableName,
        operation,
        cols,
        storageLabel,
        condition,
        value,
    } = props;

    /*
     * We're using two separate file for reading and writing dropdown options.
     * backup file is used for safety reason. If there is any problem while
     * writing at dropdown_options.json, it may get empty. So on the next
     * reading we can read from the backup file and also write the contents of
     * the backup file to the main file(dropdown_options.json).
     */
    const filePath = './Data/dropdown_options.json';
    const backupFilePath = './Data/dropdown_options_backup.json';
    let existingData = fs.readFileSync(filePath, 'utf-8');
    // jsonData contains the contents of the dropdown_options.json and backupData
    // contains the contents of the dropdown_options_backup.json
    let jsonData, backupData;
    console.log('Existing data: ', existingData);
    try {
        jsonData = JSON.parse(existingData);
    } catch (err) {
        console.log('jsonData is empty, trying to get backup');
        if (jsonData == null || Object.keys(jsonData).length == 0) {
            try {
                // if jsonData is empty, we're reading from the backup file and
                // storing it into jsonData
                existingData = fs.readFileSync(backupFilePath, 'utf-8');
                jsonData = JSON.parse(existingData);
                // make a copy of the backupData
                backupData = JSON.parse(JSON.stringify(jsonData));
            } catch (err) {
                console.log('backup is also empty, trying to get {}');
                // even if backupData is also empty, then we're initializing a
                // new object to add new dropdown options from frontend.
                if (jsonData == null || Object.keys(jsonData).length == 0) {
                    jsonData = {};
                }
            }
        }
    }

    if (operation && operation == 'write') {
        if (jsonData && !jsonData[storageLabel]) {
            jsonData[storageLabel] = [value];
        } else {
            jsonData[storageLabel].push(value);
        }
        if (jsonData != null && Object.keys(jsonData).length != 0) {
            // if jsonData is not null, that means jsonData already contains
            // options, we're writing the passed data to the both file
            fs.writeFile(
                backupFilePath,
                JSON.stringify(jsonData),
                (backupError) => {
                    if (backupError) {
                        console.error(backupError);
                        return { error: 'Error updating data' };
                        // res.status(500).json({ error: 'Error updating data' });
                        // return;
                    }
                    fs.writeFile(
                        filePath,
                        JSON.stringify(jsonData),
                        (fileError) => {
                            if (fileError) {
                                console.error(fileError);
                                return { error: 'Error updating data' };
                                // res.status(500).json({ error: 'Error updating data' });
                                // return;
                            }
                            return JSON.stringify(jsonData);
                            // res.json(JSON.stringify(jsonData));
                        }
                    );
                }
            );
        } else {
            return JSON.stringify(backupData);
            // res.json(JSON.stringify(backupData));
        }
    } else {
        // if we have to read the options
        if (dynamicOps == true) {
            // dynamicOps == true means we need to load the from table
            console.log('DynamicOps are true');
            let colString = cols.join(', ');

            // processingDropDownData function is used to fetch option data from table
            let dataX = await processingDropDownData(
                tableName,
                colString,
                condition
            );

            // mapping the data to possible key
            let result = dataX.map((item) => Object.values(item).join(' - '));
            const dropdownOptions = result.reduce((acc, option) => {
                const [id, name] = option.split(' - ');
                // console.log('spliting: ', id, name);
                const englishId = toEnglishNumber(id.trim().split(' ')[0]);
                if (tableName != 'Course') {
                    acc[englishId] = `${toBanglaNumber(id)}- ${name}`;
                } else {
                    acc[englishId] = `${toEnglishNumber(id)} - ${name}`;
                }
                return acc;
            }, {});
            jsonData[storageLabel] = dropdownOptions;

            console.log('DynamicOps are generated, now jsonData: ', jsonData);

            // Now we need to keep the jsonData or the json file updated. So
            // after reading from the database, we're writing the data to the
            // json files
            if (jsonData != null && Object.keys(jsonData).length != 0) {
                // writing in the backup file
                fs.writeFile(
                    backupFilePath,
                    JSON.stringify(jsonData),
                    (backupError) => {
                        if (backupError) {
                            console.error(backupError);
                            return { error: 'Error updating data' };
                            // res.status(500).json({ error: 'Error updating data' });
                            // return;
                        }
                        console.log('Inside writeFile!!!');
                        // And also writing in the main file
                        fs.writeFile(
                            filePath,
                            JSON.stringify(jsonData),
                            (fileError) => {
                                if (fileError) {
                                    // console.error(fileError);
                                    // res.status(500).json({ error: 'Error updating data' });
                                    return { error: 'Error updating data' };
                                }
                                return JSON.stringify(jsonData);
                            }
                        );
                    }
                );
            } else {
                return JSON.stringify(backupData);
            }
        } else {
            // if we don't need to load them from the table
            // we can just send them to frontend
            if (jsonData != null && Object.keys(jsonData).length != 0) {
                return JSON.stringify(jsonData);
            } else {
                // This part Needs review
                fs.writeFile(
                    filePath,
                    JSON.stringify(jsonData),
                    (fileError) => {
                        if (fileError) {
                            console.error(fileError);
                            // res.status(500).json({ error: 'Error updating data' });
                            // return;
                            return { error: 'Error updating data' };
                        }
                        // res.json(JSON.stringify(backupData));
                        return JSON.stringify(backupData);
                    }
                );
            }
        }
    }
    return jsonData;
}

async function processingDropDownData(tableName, colString, condition) {
    try {
        let data = [];
        let query = ``;
        if (condition) {
            query = `SELECT DISTINCT ${colString} FROM ${tableName} where ${condition}`;
        } else {
            query = `SELECT DISTINCT ${colString} FROM ${tableName}`;
        }
        console.log(query);
        data = await loadData(conn, null, null, query);
        //console.log("Loaded data: ", data);
        return data;
    } catch (err) {
        console.error(err);
        throw new Error('Error loading data');
    }
}

module.exports = { processDropDownData };
