const toEnglishNumber = require('./Modules/toEnglishNumber.js');
const toBanglaNumber = require('./Modules/toBanglaNumber.js');

async function deleteData(conn, tableName, row, getTableInfo) {
    return new Promise((resolve, reject) => {
      const { primaryKeys, dataTypes } = getTableInfo[tableName];
  
      // creating the query
      let pkLen = primaryKeys.length;
      console.log('PK LEN IS:', pkLen);
      console.log(row[primaryKeys[0]]);
      let pkValueString = '';
  
      // dataTypes[row[primaryKeys[i]] === "int(11)"
      for (let i = 0; i < pkLen; i++) {
        if (dataTypes[primaryKeys[i]].localeCompare('int(11)') == 0) {
          pkValueString += `${primaryKeys[i]} = ${toEnglishNumber(
            row[primaryKeys[i]]
          )}`;
        } else {
          pkValueString += `${primaryKeys[i]} = "${row[primaryKeys[i]]}"`;
        }
        if (pkLen - 1 != i) pkValueString += ' and ';
      }
  
      // running the query
      const query = `DELETE FROM ${tableName} WHERE ${pkValueString};`;
      conn.query(query, function (err, result) {
        if (err) reject(JSON.parse(JSON.stringify(err)));
        else {
          const data = Object(JSON.parse(JSON.stringify(result)));
          console.log('Deleted data:', data);
          resolve(data);
        }
      });
    });
  }

  async function updateData(conn, tableName, row, updatedData, getTableInfo) {
    return new Promise((resolve, reject) => {
      const { primaryKeys, dataTypes } = getTableInfo[tableName];
      const { colType, value } = updatedData;
      console.log('Row', row);
  
      // create the query
      let pkLen = primaryKeys.length;
      console.log('PK LEN IS:', pkLen);
      console.log(row[primaryKeys[0]]);
      let pkValueString = '';
      for (let i = 0; i < pkLen; i++) {
        // checking for primary key with course word -> exception
        if (dataTypes[primaryKeys[i]].localeCompare('int(11)') == 0)
          pkValueString += `${primaryKeys[i]} = ${toEnglishNumber(
            row[primaryKeys[i]]
          )}`;
        else {
          if (primaryKeys[i].includes('course')) {
            pkValueString += `${primaryKeys[i]} = "${toEnglishNumber(
              row[primaryKeys[i]]
            )}"`;
          } else {
            pkValueString += `${primaryKeys[i]} = "${row[primaryKeys[i]]}"`;
          }
        }
        if (pkLen - 1 != i) pkValueString += ' and ';
      }
      console.log('PkvalueString: ', pkValueString);
      let val = '';
      if (dataTypes[colType].localeCompare('int(11)') == 0) {
        val += `${colType} = ${toEnglishNumber(value)}`;
      } else {
        val += `${colType} =  '${value}'`;
      }
      const query = `UPDATE ${tableName} SET ${val} WHERE ${pkValueString};`;
      console.log('Query is', query);
  
      // run the query
      conn.query(query, function (err, result) {
        if (err) reject(JSON.parse(JSON.stringify(err)));
        else {
          const data = Object(JSON.parse(JSON.stringify(result)));
          resolve(data);
        }
      });
    });
}

async function insertData(conn, tableName, row, getTableInfo) {
    return new Promise((resolve, reject) => {
      // create the query
      const { dataTypes } = getTableInfo[tableName];
      // console.log("Get Table INFO: ", getTableInfo[tableName]);
      // console.log("ROWS: ", row);
      let fields = '';
      let val = '';
      for (let key in row) {
        if (row.hasOwnProperty(key)) {
          fields += `\`${key}\`, `;
          if (dataTypes[key].localeCompare('int(11)') == 0) {
            val += `${toEnglishNumber(row[key])}, `;
          } else {
            val += `"${row[key]}", `;
          }
        }
      }
      fields = fields.slice(0, fields.length - 2);
      val = val.slice(0, val.length - 2);
      const query = `INSERT INTO ${tableName} (${fields}) VALUES (${val});`;
  
      // console.log("Insertion", query);
      // run the query
      conn.query(query, (err, result) => {
        if (err) {
          reject(JSON.parse(JSON.stringify(err)));
        } else {
          const data = Object(JSON.parse(JSON.stringify(result)));
          resolve(data);
        }
      });
    });
  }

  module.exports = {deleteData, updateData, insertData}
