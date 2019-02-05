
import * as mysql from 'mysql';

const pool = mysql.createPool({
        host:"localhost",
        user:"root",
        password:"root1234",
        database:"ExtPOCDB"
});

pool.getConnection(function(err, con){
        if (!!err) {
            con.release();
            console.log(err);
        }
    });

export default pool;