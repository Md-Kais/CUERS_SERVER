async function loadData(conn, tableName, conditionCheck, tableColNames, query) {
  return new Promise((resolve, reject) => {
    //console.log("colName is:", colName);
    // console.log("At boss, Query: ", query);
    let query1;
    // console.log("conditionCheck is:", conditionCheck)
    if(query){
        query1 = query;
    }
    else if(tableColNames !== undefined && tableName !== undefined){
      let colNames = tableColNames.join(', ')
      query1 = `SELECT ${colNames} FROM ${tableName};`;
    }
    else if(tableColNames == undefined && tableName !== undefined){
      query1 = `SELECT * from ${tableName};`
    }
    else if(conditionCheck !== undefined && conditionCheck !== "" && tableName !== undefined) {
      // console.log("colName is:", conditionCheck)
      query1 = `SELECT * FROM ${tableName} WHERE ${conditionCheck};`;
      console.log("query is:", query1);
    }

    conn.query(query1, function (err, result) {
      if (err) reject(err);
        else{
        const data = Object.values(JSON.parse(JSON.stringify(result)));
        resolve(data);
        }
      });
  });
}

module.exports = {loadData};