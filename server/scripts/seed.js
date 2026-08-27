const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const providersData = require('../data/providers');

// Load env variables
dotenv.config();

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Service.deleteMany();
    await Provider.deleteMany();

    console.log('Inserting Services...');
    const services = [
      { name: 'Electrician', slug: 'electrician', icon: 'bolt', description: 'Wiring, repairs, installations', color: 'bg-primary/10 text-primary' },
      { name: 'Plumber', slug: 'plumber', icon: 'water_drop', description: 'Pipes, leaks, bathroom fitting', color: 'bg-secondary/10 text-secondary' },
      { name: 'Carpenter', slug: 'carpenter', icon: 'carpenter', description: 'Furniture, doors, woodwork', color: 'bg-tertiary/10 text-tertiary' },
      { name: 'Tailor', slug: 'tailor', icon: 'styler', description: 'Stitching, alterations, designs', color: 'bg-primary/10 text-primary' },
      { name: 'Maintenance', slug: 'maintenance', icon: 'handyman', description: 'General repairs and upkeep', color: 'bg-secondary/10 text-secondary' },
    ];
    await Service.insertMany(services);

    console.log('Inserting Providers...');
    // We map out the data to match the Schema (though Mongoose handles extra fields gracefully)
    await Provider.insertMany(providersData);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
