const db = require('./db');

(async () => {
    try {
        await db.initPool();
        console.log("Adding address_id to food_items...");
        
        try {
            await db.query('ALTER TABLE food_items ADD COLUMN address_id INT NULL;');
            console.log("Column address_id added.");
        } catch(e) {
            console.log("address_id already exists or error: ", e.message);
        }

        if (db.isPostgres) {
            try {
                await db.query('ALTER TABLE food_items ADD CONSTRAINT fk_address_id FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL;');
                console.log("FK added to PG.");
            } catch(e) {
                console.log("FK already exists or error (PG): ", e.message);
            }
        } else {
            try {
                await db.query('ALTER TABLE food_items ADD CONSTRAINT fk_address_id FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL;');
                console.log("FK added to MySQL.");
            } catch(e) {
                console.log("FK already exists or error (MySQL): ", e.message);
            }
        }
        
        // Update existing food items to use the primary address of the provider
        console.log("Migrating existing food items...");
        if (db.isPostgres) {
            await db.query(`
                UPDATE food_items
                SET address_id = (
                    SELECT id FROM addresses 
                    WHERE addresses.user_id = food_items.provider_id AND is_primary = 1
                    LIMIT 1
                )
                WHERE address_id IS NULL;
            `);
        } else {
            await db.query(`
                UPDATE food_items f
                JOIN addresses a ON f.provider_id = a.user_id AND a.is_primary = 1
                SET f.address_id = a.id
                WHERE f.address_id IS NULL;
            `);
        }
        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Failed:", error);
        process.exit(1);
    }
})();
