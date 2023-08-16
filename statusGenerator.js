async function statusGenerator(data, error) {
    let message = 'Error!';
    if (data === undefined) {
      console.log('Error happened', error);
      if (error.code === 'ER_DUP_ENTRY') {
        message = 'Row is already available!';
      } else if (error.code === 'ER_NO_REFERENCED_ROW') {
        message = 'No matching row in referenced table!';
      } else if (error.code === 'ER_PARSE_ERROR') {
        message = 'SQL syntax error!';
      } else if (error.code === 'ER_DATA_TOO_LONG') {
        message = 'Data value too long for column!';
      } else if (error.code === 'ER_INVALID_CHARACTER_STRING') {
        message = 'Invalid character string!';
      } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        message = 'Cannot delete row due to foreign key references!';
      } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        message = 'Foreign key constraint failure. Check parent record!';
      }
      return [0, message];
    } else {
      console.log('No error!', data);
      return [data.affectedRows, `${data.affectedRows} row affected`];
    }
  }

  module.exports = {statusGenerator};