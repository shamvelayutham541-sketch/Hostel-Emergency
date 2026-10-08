const bcrypt = require('bcryptjs');

const generateSeedData = async () => {
  const defaultPasswordHash = await bcrypt.hash('Hostel123!', 10);

  // 1. Hostels
  const hostels = [
    {
      _id: 'hostel_01',
      name: 'Royal Palms Tech Campus Hostel',
      address: 'North Tech Zone, Innovation Way, Bengaluru - 560100',
      contactNumber: '+91 80 2841 9900'
    }
  ];

  // 2. Blocks
  const blocks = [
    { _id: 'block_01', hostelId: 'hostel_01', name: 'Block A - Phoenix', floorCount: 4, description: 'Undergraduate Boys Hostel' },
    { _id: 'block_02', hostelId: 'hostel_01', name: 'Block B - Orion', floorCount: 4, description: 'Undergraduate Girls Hostel' },
    { _id: 'block_03', hostelId: 'hostel_01', name: 'Block C - Zenith', floorCount: 4, description: 'Postgraduate & Research Block' },
  ];

  // 3. 60 Rooms (20 rooms per block, 5 rooms per floor across 4 floors)
  const rooms = [];
  blocks.forEach(b => {
    for (let f = 1; f <= 4; f++) {
      for (let r = 1; r <= 5; r++) {
        const roomNum = `${f}0${r}`;
        rooms.push({
          _id: `room_${b.name.slice(6, 7)}_${roomNum}`,
          blockId: b._id,
          blockName: b.name,
          roomNumber: roomNum,
          floor: f,
          capacity: 2
        });
      }
    }
  });

  // 4. Staff and Admin Users
  const staffUsers = [
    {
      _id: 'user_admin_01',
      email: 'admin@hostelsos.edu',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      name: 'Dean R. K. Verma',
      phone: '+91 98765 00001',
      isActive: true
    },
    {
      _id: 'user_warden_01',
      email: 'warden@hostelsos.edu',
      passwordHash: defaultPasswordHash,
      role: 'warden',
      name: 'Warden S. Mukherjee',
      phone: '+91 98765 00002',
      isActive: true
    },
    {
      _id: 'user_security_01',
      email: 'security@hostelsos.edu',
      passwordHash: defaultPasswordHash,
      role: 'security',
      name: 'Officer Rajesh Kumar',
      phone: '+91 98765 00003',
      isActive: true
    },
    {
      _id: 'user_medical_01',
      email: 'medical@hostelsos.edu',
      passwordHash: defaultPasswordHash,
      role: 'medical',
      name: 'Dr. Priya Sharma (Medical)',
      phone: '+91 98765 00004',
      isActive: true
    },
    {
      _id: 'user_maintenance_01',
      email: 'maintenance@hostelsos.edu',
      passwordHash: defaultPasswordHash,
      role: 'maintenance',
      name: 'Ramesh Patel (Maintenance)',
      phone: '+91 98765 00005',
      isActive: true
    }
  ];

  // 5. 20 Realistic Students
  const rawStudents = [
    { id: 'STU202401', name: 'Aarav Mehta', email: 'student@hostelsos.edu', phone: '+91 98111 00001', block: 'Block A - Phoenix', room: '204', floor: 2, blood: 'O+', allergies: 'Penicillin, Peanuts', condition: 'Mild Asthma' },
    { id: 'STU202402', name: 'Ananya Iyer', email: 'ananya@hostelsos.edu', phone: '+91 98111 00002', block: 'Block B - Orion', room: '102', floor: 1, blood: 'A+', allergies: 'Sulfa drugs', condition: 'None' },
    { id: 'STU202403', name: 'Rohan Sharma', email: 'rohan@hostelsos.edu', phone: '+91 98111 00003', block: 'Block A - Phoenix', room: '305', floor: 3, blood: 'B+', allergies: 'None', condition: 'None' },
    { id: 'STU202404', name: 'Sneha Reddy', email: 'sneha@hostelsos.edu', phone: '+91 98111 00004', block: 'Block B - Orion', room: '201', floor: 2, blood: 'AB+', allergies: 'Dust, Pollen', condition: 'Asthmatic' },
    { id: 'STU202405', name: 'Vikram Joshi', email: 'vikram@hostelsos.edu', phone: '+91 98111 00005', block: 'Block C - Zenith', room: '101', floor: 1, blood: 'O-', allergies: 'None', condition: 'Type 1 Diabetes' },
    { id: 'STU202406', name: 'Pooja Nair', email: 'pooja@hostelsos.edu', phone: '+91 98111 00006', block: 'Block B - Orion', room: '304', floor: 3, blood: 'A-', allergies: 'Shellfish', condition: 'None' },
    { id: 'STU202407', name: 'Karthik Raman', email: 'karthik@hostelsos.edu', phone: '+91 98111 00007', block: 'Block A - Phoenix', room: '402', floor: 4, blood: 'B+', allergies: 'Aspirin', condition: 'None' },
    { id: 'STU202408', name: 'Diya Sen', email: 'diya@hostelsos.edu', phone: '+91 98111 00008', block: 'Block B - Orion', room: '405', floor: 4, blood: 'O+', allergies: 'None', condition: 'Migraine' },
    { id: 'STU202409', name: 'Aditya Gupta', email: 'aditya@hostelsos.edu', phone: '+91 98111 00009', block: 'Block C - Zenith', room: '203', floor: 2, blood: 'B-', allergies: 'Lactose intolerant', condition: 'None' },
    { id: 'STU202410', name: 'Meera Chawla', email: 'meera@hostelsos.edu', phone: '+91 98111 00010', block: 'Block B - Orion', room: '205', floor: 2, blood: 'AB-', allergies: 'None', condition: 'None' },
    { id: 'STU202411', name: 'Kabir Singhania', email: 'kabir@hostelsos.edu', phone: '+91 98111 00011', block: 'Block A - Phoenix', room: '105', floor: 1, blood: 'O+', allergies: 'None', condition: 'None' },
    { id: 'STU202412', name: 'Tanvi Deshmukh', email: 'tanvi@hostelsos.edu', phone: '+91 98111 00012', block: 'Block B - Orion', room: '302', floor: 3, blood: 'A+', allergies: 'Cats/Fur', condition: 'Eczema' },
    { id: 'STU202413', name: 'Siddharth Rao', email: 'siddharth@hostelsos.edu', phone: '+91 98111 00013', block: 'Block C - Zenith', room: '305', floor: 3, blood: 'O+', allergies: 'None', condition: 'None' },
    { id: 'STU202414', name: 'Ishita Banerjee', email: 'ishita@hostelsos.edu', phone: '+91 98111 00014', block: 'Block B - Orion', room: '104', floor: 1, blood: 'B+', allergies: 'Latex', condition: 'None' },
    { id: 'STU202415', name: 'Nikhil Kulkarni', email: 'nikhil@hostelsos.edu', phone: '+91 98111 00015', block: 'Block A - Phoenix', room: '202', floor: 2, blood: 'A-', allergies: 'None', condition: 'None' },
    { id: 'STU202416', name: 'Ritu Agarwal', email: 'ritu@hostelsos.edu', phone: '+91 98111 00016', block: 'Block B - Orion', room: '401', floor: 4, blood: 'O+', allergies: 'None', condition: 'None' },
    { id: 'STU202417', name: 'Devendra Pandey', email: 'devendra@hostelsos.edu', phone: '+91 98111 00017', block: 'Block C - Zenith', room: '404', floor: 4, blood: 'AB+', allergies: 'Ibuprofen', condition: 'Epilepsy history' },
    { id: 'STU202418', name: 'Kavya Pillai', email: 'kavya@hostelsos.edu', phone: '+91 98111 00018', block: 'Block B - Orion', room: '103', floor: 1, blood: 'B+', allergies: 'None', condition: 'None' },
    { id: 'STU202419', name: 'Harshvardhan Jain', email: 'harsh@hostelsos.edu', phone: '+91 98111 00019', block: 'Block A - Phoenix', room: '301', floor: 3, blood: 'O-', allergies: 'None', condition: 'None' },
    { id: 'STU202420', name: 'Zoya Khan', email: 'zoya@hostelsos.edu', phone: '+91 98111 00020', block: 'Block B - Orion', room: '303', floor: 3, blood: 'A+', allergies: 'Pollen', condition: 'Sinusitis' },
  ];

  const studentUsers = [];
  const studentProfiles = [];

  rawStudents.forEach((s, idx) => {
    const userId = `user_student_${idx + 1}`;
    studentUsers.push({
      _id: userId,
      email: s.email,
      passwordHash: defaultPasswordHash,
      role: 'student',
      name: s.name,
      isActive: true
    });

    studentProfiles.push({
      _id: `profile_${idx + 1}`,
      userId,
      studentId: s.id,
      name: s.name,
      phone: s.phone,
      blockName: s.block,
      roomNumber: s.room,
      floor: s.floor,
      emergencyContacts: [
        { name: 'Dr. / Mr. Parent Guardian', phone: '+91 98200 12345', relation: 'Parent' },
        { name: 'Roommate Emergency Contact', phone: '+91 98200 54321', relation: 'Peer' }
      ],
      medicalInfo: {
        bloodGroup: s.blood,
        allergies: s.allergies !== 'None' ? s.allergies.split(', ') : [],
        conditions: s.condition !== 'None' ? [s.condition] : [],
        medication: s.condition.includes('Asthma') ? ['Inhaler (Salbutamol)'] : (s.condition.includes('Diabetes') ? ['Insulin Pen'] : [])
      },
      falseAlarmCount: 0,
      profilePhotoUrl: `https://images.unsplash.com/photo-${1500000000000 + idx * 5000000}?auto=format&fit=crop&w=200&q=80`
    });
  });

  // 6. 40 Realistic Sample Incidents (spanning last 14 days, with varied statuses, types and priorities)
  const incidentCategories = ['medical', 'fire', 'electrical', 'lockout', 'plumbing', 'security', 'other'];
  const sampleIncidents = [];
  const timelines = [];
  const sampleMessages = [];

  const baseDate = new Date();

  for (let i = 1; i <= 40; i++) {
    const student = rawStudents[i % rawStudents.length];
    const cat = incidentCategories[i % incidentCategories.length];
    const priority = ['medical', 'fire', 'security'].includes(cat) ? (i % 2 === 0 ? 'critical' : 'high') : 'normal';
    
    // Status distribution: recent ones pending/acknowledged, older ones resolved
    let status = 'resolved';
    if (i <= 3) status = 'pending';
    else if (i <= 6) status = 'acknowledged';
    else if (i <= 9) status = 'en_route';
    else if (i <= 12) status = 'in_progress';
    else if (i === 13) status = 'false_alarm';

    const hoursAgo = (41 - i) * 6; // spread over 10 days
    const createdDate = new Date(baseDate.getTime() - hoursAgo * 3600 * 1000).toISOString();
    const resolvedDate = ['resolved', 'closed', 'false_alarm'].includes(status) 
      ? new Date(new Date(createdDate).getTime() + (Math.random() * 20 + 4) * 60 * 1000).toISOString() 
      : null;

    const incId = `inc_${String(i).padStart(3, '0')}`;
    const incidentObj = {
      _id: incId,
      reporterId: `user_student_${(i % rawStudents.length) + 1}`,
      studentName: student.name,
      studentPhone: student.phone,
      type: cat,
      priority,
      status,
      location: {
        blockName: student.block,
        roomNumber: student.room,
        floor: student.floor
      },
      gps: { latitude: 12.9716 + (Math.random() - 0.5) * 0.005, longitude: 77.5946 + (Math.random() - 0.5) * 0.005 },
      description: `Reported emergency regarding ${cat} issue. Urgent response dispatched from control room.`,
      isSilent: i === 7,
      isAnonymous: i === 14,
      assignedStaff: ['user_warden_01', cat === 'medical' ? 'user_medical_01' : (cat === 'electrical' ? 'user_maintenance_01' : 'user_security_01')],
      slaDeadline: new Date(new Date(createdDate).getTime() + 5 * 60000).toISOString(),
      slaBreached: i === 2, // incident 2 breached SLA to show flashing badge
      createdAt: createdDate,
      resolvedAt: resolvedDate,
      resolvedBy: resolvedDate ? 'Warden S. Mukherjee' : null
    };

    sampleIncidents.push(incidentObj);

    // Timeline entries
    timelines.push({
      _id: `tl_${incId}_1`,
      incidentId: incId,
      action: 'Emergency SOS Raised',
      performedBy: student.name,
      details: `Alert generated for ${cat.toUpperCase()} at Room ${student.room}, ${student.block}`,
      createdAt: createdDate
    });

    if (status !== 'pending') {
      timelines.push({
        _id: `tl_${incId}_2`,
        incidentId: incId,
        action: 'Acknowledged by Control Room',
        performedBy: 'Officer Rajesh Kumar (Security)',
        details: 'First responders acknowledged alert. Units mobilizing.',
        createdAt: new Date(new Date(createdDate).getTime() + 90000).toISOString()
      });
    }

    if (['in_progress', 'resolved', 'closed'].includes(status)) {
      timelines.push({
        _id: `tl_${incId}_3`,
        incidentId: incId,
        action: 'Responders En Route & Arrived',
        performedBy: 'Warden S. Mukherjee',
        details: 'Assigned staff reached Room site.',
        createdAt: new Date(new Date(createdDate).getTime() + 180000).toISOString()
      });
    }

    if (resolvedDate) {
      timelines.push({
        _id: `tl_${incId}_4`,
        incidentId: incId,
        action: status === 'false_alarm' ? 'Marked as False Alarm' : 'Resolved and Closed',
        performedBy: 'Warden S. Mukherjee',
        details: status === 'false_alarm' ? 'Accidental press confirmed by resident.' : 'Emergency successfully neutralized. All students verified safe.',
        createdAt: resolvedDate
      });
    }

    // Chat messages for live active incidents
    if (i <= 6) {
      sampleMessages.push({
        _id: `msg_${incId}_1`,
        incidentId: incId,
        senderId: 'user_security_01',
        senderName: 'Officer Rajesh Kumar',
        senderRole: 'security',
        content: 'Stay calm! Security team is on the 2nd floor corridor right now.',
        createdAt: new Date(new Date(createdDate).getTime() + 100000).toISOString()
      });
      sampleMessages.push({
        _id: `msg_${incId}_2`,
        incidentId: incId,
        senderId: incidentObj.reporterId,
        senderName: student.name,
        senderRole: 'student',
        content: 'Thank you! The door is unlocked.',
        createdAt: new Date(new Date(createdDate).getTime() + 140000).toISOString()
      });
    }
  }

  // 7. Broadcast Announcements & Fire Drills
  const broadcasts = [
    {
      _id: 'bcast_01',
      title: '🚨 CAMPUS-WIDE FIRE EVACUATION DRILL',
      message: 'Notice: Mandatory fire evacuation drill scheduled at 4:00 PM today. All residents must proceed to designated Assembly Point 1 (Main Football Ground) upon alarm sound.',
      target: 'all',
      isDrill: true,
      createdBy: 'user_warden_01',
      createdByName: 'Warden S. Mukherjee',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledgedBy: [
        { userId: 'user_student_1', name: 'Aarav Mehta', roomNumber: '204', blockName: 'Block A - Phoenix', status: 'safe', timestamp: new Date().toISOString() },
        { userId: 'user_student_2', name: 'Ananya Iyer', roomNumber: '102', blockName: 'Block B - Orion', status: 'safe', timestamp: new Date().toISOString() }
      ]
    },
    {
      _id: 'bcast_02',
      title: '⚡ Scheduled Power Grid Maintenance in Block C',
      message: 'Elevators will be non-operational between 2:00 PM and 3:30 PM for electrical generator backup tests.',
      target: 'block',
      targetId: 'block_03',
      isDrill: false,
      createdBy: 'user_maintenance_01',
      createdByName: 'Ramesh Patel',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      acknowledgedBy: []
    }
  ];

  // 8. Maintenance Tickets
  const maintenanceTickets = [
    {
      _id: 'maint_01',
      reporterId: 'user_student_1',
      reporterName: 'Aarav Mehta',
      roomNumber: '204',
      blockName: 'Block A - Phoenix',
      category: 'Plumbing',
      title: 'Bathroom water tap leaking continuously',
      description: 'The cold water tap valve is worn out and dripping water fast.',
      priority: 'normal',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'maint_02',
      reporterId: 'user_student_4',
      reporterName: 'Sneha Reddy',
      roomNumber: '201',
      blockName: 'Block B - Orion',
      category: 'Electrical',
      title: 'Ceiling fan making clicking sound',
      description: 'Regulator operates only at high speed and motor clicks intermittently.',
      priority: 'normal',
      status: 'open',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    }
  ];

  return {
    hostels,
    blocks,
    rooms,
    users: [...staffUsers, ...studentUsers],
    studentProfiles,
    incidents: sampleIncidents,
    incidentTimelines: timelines,
    incidentMessages: sampleMessages,
    broadcasts,
    maintenanceTickets
  };
};

module.exports = { generateSeedData };
