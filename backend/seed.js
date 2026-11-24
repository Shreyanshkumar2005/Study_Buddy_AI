require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Note = require('./models/Note');
const AIRequest = require('./models/AIRequest');

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studybuddy';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoUri}`);

    // Clear existing collections
    await User.deleteMany({});
    await Note.deleteMany({});
    await AIRequest.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create Users
    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@studybuddy.test',
      password: 'Password123!',
      role: 'student'
    });

    const studentUser2 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah.student@university.edu',
      password: 'Password123!',
      role: 'student'
    });

    const adminUser = await User.create({
      name: 'Dr. Evelyn Reed (Admin)',
      email: 'admin@studybuddy.test',
      password: 'AdminPass123!',
      role: 'admin'
    });

    console.log('Seeded Users: student, student2, admin');

    // 2. Create Notes for Alex
    const note1 = await Note.create({
      user: studentUser._id,
      title: 'Cellular Respiration and ATP Synthesis',
      subject: 'Biology',
      tags: ['mitochondria', 'metabolism', 'krebs-cycle', 'exam-prep'],
      content: `Cellular respiration is the fundamental biochemical pathway by which organisms transform chemical energy stored in glucose into usable adenosine triphosphate (ATP). 

The pathway operates in four sequential stages:
1. Glycolysis: Takes place in the cytoplasm without oxygen (anaerobic). A 6-carbon glucose molecule is cleaved into two 3-carbon pyruvate molecules, yielding a net gain of 2 ATP and 2 NADH.
2. Pyruvate Oxidation: Pyruvate moves into the mitochondrial matrix and is converted to acetyl-CoA, releasing CO2 and producing 1 NADH per pyruvate.
3. Citric Acid Cycle (Krebs Cycle): In the mitochondrial matrix, acetyl-CoA combines with oxaloacetate to generate citrate. Through a cyclic series of redox reactions, each turn yields 1 ATP (or GTP), 3 NADH, and 1 FADH2.
4. Oxidative Phosphorylation & Electron Transport Chain: Across the inner mitochondrial membrane, electrons from NADH and FADH2 pass through protein complexes I to IV. This active proton pumping establishes a high electrochemical proton gradient in the intermembrane space. Protons then flow down this gradient through ATP Synthase (chemiosmosis), synthesizing approximately 26-28 ATP.

Total theoretical yield per glucose: 30 to 32 ATP molecules under aerobic conditions.`
    });

    const note2 = await Note.create({
      user: studentUser._id,
      title: 'Binary Search Trees & Self-Balancing Algorithms',
      subject: 'Computer Science',
      tags: ['dsa', 'trees', 'algorithms', 'avl', 'red-black'],
      content: `A Binary Search Tree (BST) is a hierarchical node-based data structure where each node has at most two children. The binary search property dictates that all keys in the left subtree are smaller than the node's key, and all keys in the right subtree are greater.

Key operations on balanced BSTs achieve O(log n) average time complexity for Search, Insertion, and Deletion. However, if keys are inserted in sorted order, an ordinary BST degenerates into a linear linked list with O(n) worst-case time complexity.

Self-balancing binary search trees solve this degeneration:
- AVL Trees: Strictly balanced where the height difference (balance factor) between left and right subtrees is at most 1. Rebalancing is restored via single or double rotations (LL, RR, LR, RL). AVL trees guarantee faster lookups due to strict balance.
- Red-Black Trees: Balanced using node coloring rules (root is black, no two adjacent red nodes, equal number of black nodes along all paths from root to leaves). They perform fewer rotations during frequent insert and delete operations, making them the standard choice for language standard libraries like C++ std::map and Java TreeMap.`
    });

    const note3 = await Note.create({
      user: studentUser2._id,
      title: 'The Industrial Revolution and Urbanization in Britain',
      subject: 'History',
      tags: ['history', 'industrial-revolution', 'steam-engine', 'economics'],
      content: `The Industrial Revolution began in Great Britain in the mid-18th century and marked a profound transition from agrarian, handicraft economies to machine-driven manufacturing.

Key catalysts included:
1. Agricultural improvements increasing food production and freeing agricultural labor.
2. Abundant domestic coal and iron reserves combined with navigable waterways and colonial trading networks.
3. Crucial technological innovations: James Hargreaves' Spinning Jenny, Richard Arkwright's Water Frame, and James Watt's improved steam engine.

Social and economic consequences:
- Rapid urbanization: Cities like Manchester, Birmingham, and Leeds grew exponentially without adequate infrastructure, leading to overcrowding and public health crises.
- Emergence of the industrial working class and subsequent labor reform movements such as the Factory Acts and trade unions.`
    });

    console.log('Seeded Study Notes');

    // 3. Create Sample AI Requests (Historical telemetry for Admin aggregation)
    await AIRequest.create({
      user: studentUser._id,
      note: note1._id,
      requestType: 'summary',
      promptSnapshot: `Title: ${note1.title}\n${note1.content.substring(0, 300)}...`,
      response: {
        summary: `### AI Summary: Cellular Respiration & ATP

**Executive Summary:**
Cellular respiration oxidizes glucose to generate usable ATP via Glycolysis, Pyruvate Oxidation, the Krebs Cycle, and Oxidative Phosphorylation.

**Core Principles:**
• Glycolysis yields 2 ATP anaerobically in the cytoplasm.
• Krebs Cycle produces essential electron carriers (NADH and FADH2) in the mitochondrial matrix.
• Electron transport chain drives chemiosmosis through ATP Synthase to yield ~30-32 total ATP.

**Takeaway:**
Remember that oxidative phosphorylation produces the vast majority of cellular ATP via proton gradients.`
      },
      status: 'success',
      modelUsed: MODEL,
      durationMs: 1250,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    await AIRequest.create({
      user: studentUser._id,
      note: note1._id,
      requestType: 'practice_questions',
      promptSnapshot: `Title: ${note1.title}\n${note1.content.substring(0, 300)}...`,
      response: {
        questions: [
          {
            id: 1,
            question: 'Which stage of cellular respiration occurs in the cytoplasm without oxygen?',
            options: ['Citric Acid Cycle', 'Glycolysis', 'Oxidative Phosphorylation', 'Pyruvate Oxidation'],
            correctIndex: 1,
            explanation: 'Glycolysis takes place in the cytosol/cytoplasm and does not require oxygen.'
          },
          {
            id: 2,
            question: 'What directly powers the rotation of ATP Synthase in the inner membrane?',
            options: ['Direct glucose binding', 'Electrochemical proton gradient', 'Carbon dioxide gas', 'Lactate reduction'],
            correctIndex: 1,
            explanation: 'Chemiosmosis relies on the proton gradient across the inner mitochondrial membrane.'
          }
        ]
      },
      status: 'success',
      modelUsed: MODEL,
      durationMs: 1540,
      createdAt: new Date()
    });

    await AIRequest.create({
      user: studentUser2._id,
      note: note3._id,
      requestType: 'summary',
      promptSnapshot: `Title: ${note3.title}\n${note3.content.substring(0, 300)}...`,
      response: {
        summary: `### AI Summary: Industrial Revolution in Britain

**Executive Summary:**
Shifted Britain from rural agriculture to mechanized factory production, fueled by steam power and mineral reserves.

**Key Concepts:**
• Watt steam engine revolutionized manufacturing efficiency.
• Urban migration caused massive growth in cities like Manchester.
• Led to the emergence of modern labor laws and factory reform.`
      },
      status: 'success',
      modelUsed: MODEL,
      durationMs: 1100,
      createdAt: new Date()
    });

    console.log('Seeded AI Requests for aggregation telemetry');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
