const { Router, query } = require('express'); //import Router class
const router = Router();
const bodyParser = require('body-parser');

const cors = require('cors');
router.use(cors());
const {
    getActivityList,
    getCourseActivityTable,
    getSemesterActivityTable,
} = require('./pdfGeneration.js');
const { getBill } = require('./billGeneration.js');
const { processData } = require('./processData.js');
const { processDropDownData } = require('./processDropDownData.js');

router.use(bodyParser.json());

// Connection to the database
const { conn } = require('./connectDatabase.js');

router.use((req, res, next) => {
    console.log('Request made to /USERS Route');
    next(); //needs to go to the middleware
});

router.get('/posts', (req, res) => {
    res.json({ route: 'Posts' });
});

// Loading for the first time is not working {}
router.post('/loadTableInfo', (req, res) => {
    const { tableNames } = req.body;
    let tableInfo = {};
    let tableDesc = {};
    const promises = tableNames.map((tableName) => {
        return new Promise((resolve, reject) => {
            const query = `desc ${tableName}`;
            conn.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    tableDesc[tableName] = results;
                    resolve();
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            // getting the primary keys of each
            const tableInfo = {};
            for (table in tableDesc) {
                const tempInfo = {};
                let primaryKeys = [];
                let dataTypes = {};
                primaryKeys = tableDesc[table]
                    .filter((item) => item.Key === 'PRI')
                    .map((item) => item.Field);
                tempInfo['primaryKeys'] = primaryKeys;
                // getting the types;
                dataTypes = tableDesc[table].reduce(
                    (result, { Field, Type }) => {
                        result[Field] = Type;
                        // console.log("The result is:", result);
                        return result;
                    },
                    {}
                );
                tempInfo['dataTypes'] = dataTypes;
                tableInfo[table] = tempInfo;
            }
            res.json(tableInfo);
        })
        .catch((err) => {
            console.error('Error getting table desc: ', err);
            res.status(500).send('Internal server Error');
        });
});

router.post('/processDropDownData', async (req, res) => {
    processDropDownData(req.body.data.params)
        .then((result) => {
            // console.log("Besult is here:", result)
            res.json(JSON.stringify(result));
            res.end();
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send(err);
        });
});

router.post('/processData', (req, res) => {
    const { changes, getTableInfo, query } = req.body;
    processData(conn, changes, getTableInfo, query)
        .then((data) => {
            // console.log("Query status", data);
            res.json(data);
            res.end();
        })
        .catch((error) => {
            res.status(400).send(error);
        });
});

router.post('/process_semester_info', (req, res) => {
    const { query } = req.body;
    //console.log(query);
    conn.query(query, function (error, data) {
        if (data) {
            res.json(JSON.stringify(data));
            // console.log(data);
        }
    });
});

router.post('/authenticatelogin', (req, res) => {
    const { evaluator_id, password, role } = req.body;
    console.log(evaluator_id, password, role);
    if (evaluator_id && password) {
        //console.log(evaluator_id + role);
        const query = `
        select * from Login_Info
        where evaluator_id = "${evaluator_id}" and role = "${role}"
        `;
        conn.query(query, function (error, data) {
            console.log(data);
            if (data?.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (
                        data[count].password === password &&
                        data[count].role.localeCompare(role) == 0
                    ) {
                        res.status(200);
                        return res.json({ msg: 'Correct Password' });
                    } else if (data[count].password == password) {
                        return res.json({ msg: 'Incorrect Role' });
                    } else {
                        return res.json({ msg: 'Incorrect Password' });
                    }
                    console.log(res);
                }
            } else {
                return res.json({ msg: 'Incorrect Evaluator Id' });
            }
            res.end();
        });
    }
});

router.post('/pdfGeneration', (req, res) => {
    const {
        semester_no,
        evaluator_id,
        to_get,
        activity_type_id,
        sector_or_program,
        // year
    } = req.body;
    console.log(req.body);
    if (to_get === 'activity_list') {
        getActivityList(conn, semester_no).then((data) => {
            res.json(data);
            res.end();
        });
    } else if (to_get === 'courseActivities') {
        getCourseActivityTable(
            conn,
            activity_type_id,
            sector_or_program,
            semester_no
        ).then((data) => {
            console.log('At getcourseActiivty: ', data);
            res.json(data);
            res.end();
        });
    } else {
        getSemesterActivityTable(
            conn,
            activity_type_id,
            sector_or_program,
            semester_no
        ).then((data) => {
            res.json(data);
            res.end();
        });
    }
});

router.post('/activityBillData', (req, res) => {
    getBill(conn, req.body).then((data) => {
        console.log('Data inside router', data);
        res.json(data);
        res.end();
    });
});

router.get('/', (req, res) => {
    conn.query('SELECT * from Login_Info', function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        res.json({ rows });
        //   res.send(`Result: ${rows[0][]}`);
    });
});

module.exports = router;
