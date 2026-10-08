const store = require('../models/dataStore');
const { generateSeedData } = require('./seedData');

const runSeed = async () => {
  console.log('🌱 [HostelSOS Seed] Commencing comprehensive database seeding...');
  const data = await generateSeedData();

  store.clearAll();

  await store.hostels.insertMany(data.hostels);
  await store.blocks.insertMany(data.blocks);
  await store.rooms.insertMany(data.rooms);
  await store.users.insertMany(data.users);
  await store.studentProfiles.insertMany(data.studentProfiles);
  await store.incidents.insertMany(data.incidents);
  await store.incidentTimelines.insertMany(data.incidentTimelines);
  await store.incidentMessages.insertMany(data.incidentMessages);
  await store.broadcasts.insertMany(data.broadcasts);
  await store.maintenanceTickets.insertMany(data.maintenanceTickets);

  console.log(`✅ [HostelSOS Seed] Seed successfully applied:`);
  console.log(`   - Hostels: ${data.hostels.length}`);
  console.log(`   - Blocks: ${data.blocks.length}`);
  console.log(`   - Rooms: ${data.rooms.length}`);
  console.log(`   - Users: ${data.users.length} (Students: 20, Staff/Admin: 5)`);
  console.log(`   - Sample Incidents: ${data.incidents.length}`);
  console.log(`   - Broadcasts: ${data.broadcasts.length}`);
  console.log(`   - Maintenance Tickets: ${data.maintenanceTickets.length}`);
  console.log('\n🔑 Demo Login Credentials:');
  console.log('   Student:     student@hostelsos.edu     / Hostel123!');
  console.log('   Warden:      warden@hostelsos.edu      / Hostel123!');
  console.log('   Security:    security@hostelsos.edu    / Hostel123!');
  console.log('   Medical:     medical@hostelsos.edu     / Hostel123!');
  console.log('   Maintenance: maintenance@hostelsos.edu / Hostel123!');
  console.log('   Admin:       admin@hostelsos.edu       / Hostel123!\n');
};

if (require.main === module) {
  runSeed().then(() => {
    console.log('🎉 Seeding completed successfully.');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { runSeed };
