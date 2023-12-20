const {statusGenerator} = require('./statusGenerator.js');
const {insertData, deleteData, updateData} = require('./tableDataOperations.js');
const {loadData} = require('./loadData.js');

async function processData(conn, changes, getTableInfo, query) {
    // console.log("passed tableInfo: ", getTableInfo);
    // console.log("Query at func", query);
    const { tableName, row, operation, updatedData, tableColNames, conditionCheck } = changes;
    if (operation === 'load') {
      let data;
      try {
        data = await loadData(conn, tableName, conditionCheck, tableColNames, query);
        console.log("Loaded data: ", data);
        return data;
      } catch (err) {
        const status = await statusGenerator(undefined, err);
        return status;
      }
    } else if (operation === 'insert') {
      try {
        const data = await insertData(conn, tableName, row, getTableInfo);
        const status = await statusGenerator(data, undefined);
        return status;
      } catch (err) {
        // mostly duplicated row will create problem
        const status = await statusGenerator(undefined, err);
        return status;
      }
    } else if (operation === 'delete') {
      try {
        const data = await deleteData(conn, tableName, row, getTableInfo);
        const status = await statusGenerator(data, undefined);
        return status;
        // console.log("Deletion status: ", data);
      } catch (err) {
        const status = await statusGenerator(undefined, err);
        return status;
      }
    } else if (operation === 'update') {
      try {
        const data = await updateData(conn, tableName, row, updatedData, getTableInfo);
        // console.log("Update status: ", data);
        const status = await statusGenerator(data, undefined);
        return status;
      } catch (err) {
        console.error('Here', err);
        const status = await statusGenerator(undefined, err);
        return status;
      }
    }
  }

  module.exports = {processData}