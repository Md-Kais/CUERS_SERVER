const {loadData} = require('./loadData.js');
const {conn} = require('./connectDatabase.js');
const toEnglishNumber = require('./Modules/toEnglishNumber.js');
const toBanglaNumber = require('./Modules/toBanglaNumber.js');

const fs = require('fs');

async function processDropDownData(props){
    const {
        dynamicOps,
        tableName,
        operation,
        cols,
        storageLabel,
        condition,
        value,
      } = props;

    const filePath = './Data/dropdown_options.json';
    const backupFilePath = './Data/dropdown_options_backup.json';
    let existingData = fs.readFileSync(filePath, 'utf-8');
    let jsonData, backupData;
    console.log('Existing data: ', existingData);
    try {
      jsonData = JSON.parse(existingData);
    } catch (err) {
      console.log('jsonData is empty, trying to get backup');
      if (jsonData == null || Object.keys(jsonData).length == 0) {
        try {
          existingData = fs.readFileSync(backupFilePath, 'utf-8');
          jsonData = JSON.parse(existingData);
          // make a copy of the backupData
          backupData = JSON.parse(JSON.stringify(jsonData));
        } catch (err) {
          console.log('backup is also empty, trying to get {}');
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
            fs.writeFile(filePath, JSON.stringify(jsonData), (fileError) => {
              if (fileError) {
                console.error(fileError);
                return { error: 'Error updating data' };
                // res.status(500).json({ error: 'Error updating data' });
                // return;
              }
              return JSON.stringify(jsonData);
              // res.json(JSON.stringify(jsonData));
            });
          }
        );
      } else {
        return JSON.stringify(backupData)
        // res.json(JSON.stringify(backupData));
      }
    } else {
      if (dynamicOps == true) {
        console.log('DynamicOps are true');
        let colString = cols.join(', ');

        let dataX = await processingDropDownData(tableName, colString, condition);
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
        // Update or add data to the JSON file
        // Data already exists, update it
        jsonData[storageLabel] = dropdownOptions;

        console.log('DynamicOps are generated, now jsonData: ', jsonData);
        // Write the updated data back to the JSON file
        if (jsonData != null && Object.keys(jsonData).length != 0) {
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
              console.log('Inside writeFile!!!')
              fs.writeFile(filePath, JSON.stringify(jsonData), (fileError) => {
                if (fileError) {
                  // console.error(fileError);
                  // res.status(500).json({ error: 'Error updating data' });
                  return { error: 'Error updating data' };
                }
                return JSON.stringify(jsonData);
              });
            }
          );
        } else {
          return JSON.stringify(backupData);
        }
      } else {
        if (jsonData != null && Object.keys(jsonData).length != 0) {
          return JSON.stringify(jsonData);
        } else {
          fs.writeFile(filePath, JSON.stringify(jsonData), (fileError) => {
            if (fileError) {
              console.error(fileError);
              // res.status(500).json({ error: 'Error updating data' });
              // return;
              return { error: 'Error updating data' };
            }
            // res.json(JSON.stringify(backupData));
            return JSON.stringify(backupData);
          });
        }
      }
    }
    return JSON.stringify(jsonData);
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

  module.exports = {processDropDownData}