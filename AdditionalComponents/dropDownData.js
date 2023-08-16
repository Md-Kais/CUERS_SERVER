// async function dropdownData(dropdownChanges) {
//   const { tableName, operation, colName } = dropdownChanges;
//   if (operation === 'load') {
//     try {
//       let data = [];
//       if (colName) {
//         data = await loadData(tableName, colName);
//         console.log('Loaded data: ', data);
//       }
//     } catch (err) {
//       console.error(err);
//       throw new Error('Error loading data');
//     }
//   }
// }