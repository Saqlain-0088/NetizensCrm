import pkg from "pg"

const { Pool } = pkg

const pool = globalThis.pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
})

if (process.env.NODE_ENV !== "production") {
    globalThis.pgPool = pool
}

const db = {
    async execute(sqlOrObj, args = []) {
        let querySql, queryArgs;

        if (typeof sqlOrObj === 'object' && sqlOrObj.sql) {
            querySql = sqlOrObj.sql;
            queryArgs = sqlOrObj.args || [];
        } else {
            querySql = sqlOrObj;
            queryArgs = args;
        }

        // Replace ? with $1, $2, etc. for PostgreSQL
        let paramCount = 0;
        const pgSql = querySql.replace(/\?/g, () => {
            paramCount++;
            return `$${paramCount}`;
        });

        const result = await pool.query(pgSql, queryArgs);
        return {
            rows: result.rows,
            rowCount: result.rowCount,
        };
    },
}

export default db