const fs = require('fs');
const db = require('./db');

async function checkQueries() {
    await db.initPool();

    const code = fs.readFileSync('server/index.js', 'utf8');

    const queries = [];
    let match;
    const regex = /db\.query\(\s*(['"`])(.*?)\1/gs;
    while ((match = regex.exec(code)) !== null) {
        queries.push(match[2]);
    }

    console.log('Found ' + queries.length + ' queries.');

    let errors = 0;
    for (let i = 0; i < queries.length; i++) {
        let q = queries[i].trim();
        if (!q) continue;

        // Skip queries that use string interpolation dynamically since we can't easily EXPLAIN them without args
        if (q.includes('${')) continue;

        // Try to EXPLAIN
        try {
            // Replace ? with $1, $2, etc for pg, or let our db.js do it? Wait, EXPLAIN doesn't execute but parameter types might fail.
            // Let's just try to prepare it.
            // actually we can just pass dummy args or use PREPARE
            // But db.js converts ? to $1 anyway
            // To just check syntax, we can try to prepare the statement
            let dummyQuery = q.replace(/\?/g, 'NULL');
            
            // Wait, EXPLAIN works with NULLs? 
            if (q.toUpperCase().startsWith('SELECT') || q.toUpperCase().startsWith('INSERT') || q.toUpperCase().startsWith('UPDATE') || q.toUpperCase().startsWith('DELETE')) {
                // To avoid running inserts/updates, we wrap in EXPLAIN
                await db.query(`EXPLAIN ${dummyQuery}`);
            }
            
        } catch (err) {
            // We ignore errors like "relation does not exist" or "column does not exist" if they are because of dummy NULL types
            // but we want to catch syntax errors
            if (err.message.includes('syntax error')) {
                console.log(`\n❌ Syntax Error in query ${i}:\n${q}\nError: ${err.message}`);
                errors++;
            }
        }
    }
    console.log(`\nSyntax check finished with ${errors} errors.`);
    process.exit(0);
}

checkQueries().catch(console.error);
