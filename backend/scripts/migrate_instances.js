const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const SectionContent = require('../src/models/SectionContent');
const ComponentInstance = require('../src/models/ComponentInstance');

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-saas');
        console.log('Connected to MongoDB');

        const settings = await SectionContent.findOne({ identifier: 'home_settings' });
        if (!settings || !settings.content) {
            console.log('No home settings found to migrate');
            process.exit(0);
        }

        const homeSettings = settings.content.toObject ? settings.content.toObject() : settings.content;
        const types = [
            'hero',
            'featuredSection',
            'collections',
            'banner',
            'advantageSection',
            'campaignSection'
        ];

        let migratedCount = 0;

        for (const type of types) {
            if (homeSettings[type]) {
                // Ensure there is no existing migration
                const existing = await ComponentInstance.findOne({ type, name: 'Default Global' });
                if (!existing) {
                    await ComponentInstance.create({
                        type,
                        name: 'Default Global',
                        data: homeSettings[type]
                    });
                    migratedCount++;
                    console.log(`[Success] Migrated global ${type} to a ComponentInstance`);
                } else {
                    console.log(`[Skipped] Default global instance for ${type} already exists`);
                }
            }
        }

        console.log(`\nMigration complete. Total new instances created: ${migratedCount}`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
