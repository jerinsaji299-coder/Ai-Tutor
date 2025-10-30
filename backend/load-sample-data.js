import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from './models/Plan.js';
import User from './models/User.js';

dotenv.config();

const samplePlans = [
  {
    teacherName: 'Demo Teacher',
    subject: 'Computer Science',
    grade: '10',
    duration: 16,
    syllabusText: 'Comprehensive Computer Science curriculum covering algorithms, programming, OOP, databases, and web development.',
    semesterPlan: [
      { week: 1, topics: "Introduction to Algorithms", activities: "Discussion on real-life algorithms, pseudocode creation, flowchart exercises" },
      { week: 2, topics: "Algorithm Representation", activities: "Practice writing pseudocode and flowcharts, introduction to algorithm efficiency" },
      { week: 3, topics: "Basics of Python Programming: Introduction to Python and Setup", activities: "Setting up Python development environment (IDLE, online compilers). Basic syntax: variables, data types (integers, floats, strings, booleans). Interactive coding session: Printing to the console, simple arithmetic operations." },
      { week: 4, topics: "Python Control Structures", activities: "Conditional statements (if, elif, else), loops (for, while), coding challenges" },
      { week: 5, topics: "Python Functions", activities: "Defining and calling functions, passing arguments, creating calculator program" },
      { week: 6, topics: "Data Structures: Lists", activities: "Creating and modifying lists, list operations, implementing algorithms with lists" },
      { week: 7, topics: "Data Structures: Stacks and Queues", activities: "Understanding LIFO and FIFO, implementing stack and queue operations" },
      { week: 8, topics: "Object-Oriented Programming", activities: "Introduction to OOP concepts, defining classes and creating objects" },
      { week: 9, topics: "OOP: Inheritance and Polymorphism", activities: "Creating subclasses, method overriding, encapsulation, class hierarchies" },
      { week: 10, topics: "Databases and SQL", activities: "Introduction to databases, writing basic SQL queries (SELECT, INSERT, UPDATE)" },
      { week: 11, topics: "Advanced SQL Queries", activities: "Using JOINs, WHERE clause, ORDER BY, GROUP BY with aggregate functions" },
      { week: 12, topics: "Python and Databases", activities: "Connecting Python to databases, executing SQL queries from Python" },
      { week: 13, topics: "Web Development: HTML", activities: "Introduction to HTML, creating web pages with basic tags" },
      { week: 14, topics: "Web Development: CSS", activities: "Styling HTML elements with CSS, creating stylesheets" },
      { week: 15, topics: "Web Development: JavaScript", activities: "Adding interactivity to web pages with JavaScript" },
      { week: 16, topics: "Final Project and Review", activities: "Project development, presentations, review of all topics, exam preparation" }
    ],
    lessonAids: [
      "PowerPoint presentations for all topics",
      "Practice worksheets and exercises",
      "Online coding platforms (repl.it, CodePen)",
      "Python IDE (IDLE or VS Code)",
      "Video tutorials and demonstrations",
      "Sample code repositories",
      "Database management tools (MySQL Workbench)",
      "Web development resources"
    ],
    assessments: [
      "Weekly quizzes (10% each)",
      "Coding assignments every 2-3 weeks (15% each)",
      "Midterm exam covering Weeks 1-8 (20%)",
      "Final project with presentation (25%)",
      "Comprehensive final exam (30%)"
    ]
  },
  {
    teacherName: 'Mathematics Dept',
    subject: 'Mathematics',
    grade: '11',
    duration: 12,
    syllabusText: 'Advanced Mathematics covering Calculus, Algebra, Trigonometry, and Statistics.',
    semesterPlan: [
      { week: 1, topics: "Introduction to Calculus", activities: "Limits and continuity, graphical representations, problem solving" },
      { week: 2, topics: "Derivatives", activities: "Rules of differentiation, applications of derivatives, optimization problems" },
      { week: 3, topics: "Integration", activities: "Indefinite and definite integrals, fundamental theorem of calculus" },
      { week: 4, topics: "Applications of Integration", activities: "Area under curves, volume of solids, real-world applications" },
      { week: 5, topics: "Advanced Algebra", activities: "Polynomial equations, matrix operations, determinants" },
      { week: 6, topics: "Trigonometric Functions", activities: "Sine, cosine, tangent, trigonometric identities" },
      { week: 7, topics: "Trigonometric Applications", activities: "Solving triangles, wave functions, periodic phenomena" },
      { week: 8, topics: "Probability Theory", activities: "Basic probability concepts, counting principles, combinations" },
      { week: 9, topics: "Statistics", activities: "Measures of central tendency, standard deviation, data analysis" },
      { week: 10, topics: "Statistical Inference", activities: "Hypothesis testing, confidence intervals, sampling" },
      { week: 11, topics: "Sequences and Series", activities: "Arithmetic and geometric sequences, series convergence" },
      { week: 12, topics: "Review and Final Exam", activities: "Comprehensive review, practice problems, final assessment" }
    ],
    lessonAids: [
      "Graphing calculators (TI-84 or similar)",
      "Mathematical software (GeoGebra, Desmos)",
      "Formula sheets and reference materials",
      "Practice problem sets",
      "Video lectures and tutorials",
      "Interactive mathematical simulations"
    ],
    assessments: [
      "Weekly homework assignments (20%)",
      "Unit tests after each major topic (30%)",
      "Midterm examination (25%)",
      "Final comprehensive exam (25%)"
    ]
  },
  {
    teacherName: 'Science Department',
    subject: 'Physics',
    grade: '12',
    duration: 14,
    syllabusText: 'Advanced Physics covering Mechanics, Thermodynamics, Electromagnetism, and Modern Physics.',
    semesterPlan: [
      { week: 1, topics: "Classical Mechanics Review", activities: "Newton's laws, kinematics equations, problem-solving sessions" },
      { week: 2, topics: "Work, Energy, and Power", activities: "Energy conservation, kinetic and potential energy, power calculations" },
      { week: 3, topics: "Rotational Motion", activities: "Angular velocity, torque, moment of inertia, laboratory experiments" },
      { week: 4, topics: "Thermodynamics Laws", activities: "First and second laws, heat engines, entropy concepts" },
      { week: 5, topics: "Heat Transfer", activities: "Conduction, convection, radiation, practical demonstrations" },
      { week: 6, topics: "Electric Fields", activities: "Coulomb's law, electric field strength, electric potential" },
      { week: 7, topics: "Electric Circuits", activities: "Ohm's law, series and parallel circuits, circuit analysis" },
      { week: 8, topics: "Magnetism", activities: "Magnetic fields, electromagnetic induction, Faraday's law" },
      { week: 9, topics: "Electromagnetic Waves", activities: "Wave properties, electromagnetic spectrum, applications" },
      { week: 10, topics: "Optics", activities: "Reflection, refraction, lenses, optical instruments" },
      { week: 11, topics: "Modern Physics: Quantum Theory", activities: "Photoelectric effect, wave-particle duality, quantum concepts" },
      { week: 12, topics: "Atomic Structure", activities: "Bohr model, electron configurations, spectroscopy" },
      { week: 13, topics: "Nuclear Physics", activities: "Radioactivity, nuclear reactions, applications in medicine and energy" },
      { week: 14, topics: "Review and Final Assessment", activities: "Comprehensive review, practical exam, written final exam" }
    ],
    lessonAids: [
      "Laboratory equipment and apparatus",
      "Physics simulation software (PhET)",
      "Demonstration materials",
      "Scientific calculators",
      "Reference textbooks and formula sheets",
      "Video demonstrations of experiments",
      "Online physics resources"
    ],
    assessments: [
      "Laboratory reports (20%)",
      "Unit quizzes (20%)",
      "Midterm practical and written exam (25%)",
      "Final project presentation (15%)",
      "Comprehensive final examination (20%)"
    ]
  }
];

const loadSampleData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing sample data (optional)
    const existingCount = await Plan.countDocuments();
    console.log(`📊 Current plans in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  Database already has plans. Do you want to add more samples? (Yes)\n');
    }

    // Add sample plans
    console.log('📝 Adding sample teaching plans...\n');
    
    for (const planData of samplePlans) {
      const plan = await Plan.create(planData);
      console.log(`✅ Added ${planData.subject} - Grade ${planData.grade} (${planData.duration} weeks)`);
      console.log(`   ID: ${plan._id}`);
      console.log(`   Weeks: ${plan.semesterPlan.length}`);
      console.log(`   Lesson Aids: ${plan.lessonAids.length}`);
      console.log(`   Assessments: ${plan.assessments.length}\n`);
    }

    // Display summary
    const totalPlans = await Plan.countDocuments();
    console.log('═'.repeat(60));
    console.log('📈 SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Successfully added ${samplePlans.length} sample plans`);
    console.log(`📊 Total plans in database: ${totalPlans}`);
    console.log('\n📚 Sample Data Loaded Successfully!');
    console.log('\nYou can now:');
    console.log('1. View plans: GET http://localhost:3000/api/planning/saved-plans');
    console.log('2. Get specific plan: GET http://localhost:3000/api/planning/saved-plans/:id');
    console.log('3. Test the frontend: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error loading sample data:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
loadSampleData();
