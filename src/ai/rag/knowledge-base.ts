export interface KnowledgeArticle {
  id: string;
  document: string;
  title: string;
  category: 'LEAVE' | 'EXAMINATION' | 'FEES' | 'CODE_OF_CONDUCT' | 'TRANSPORT' | 'ADMISSIONS' | 'ACADEMIC';
  keywords: string[];
  content: string;
}

export const INSTITUTIONAL_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  // 1. Attendance & Leave Policy
  {
    id: 'leave-001',
    document: 'School Leave & Attendance Policy',
    title: 'Minimum Attendance Requirement',
    category: 'LEAVE',
    keywords: ['attendance', 'percentage', 'minimum', 'eligibility', '75%', 'shortage', 'condonation', 'board'],
    content: `
All students must maintain a minimum attendance of 75% of the total instructional days in an academic year to be eligible to sit for final examinations and board assessments. 
Condonation of shortage of attendance up to 15% (bringing threshold down to 60%) may only be granted by the Head of the Institution on medical grounds or representation in national sports/competitions, upon submission of verified medical documentation.
`,
  },
  {
    id: 'leave-002',
    document: 'School Leave & Attendance Policy',
    title: 'Sick Leave and Planned Leave Application',
    category: 'LEAVE',
    keywords: ['sick leave', 'medical certificate', 'leave application', 'absent', 'doctor', 'planned leave', 'apply leave'],
    content: `
1. Any medical absence exceeding three consecutive days requires a registered medical practitioner's fitness certificate and a parent-signed application submitted within 48 hours of returning to school.
2. For planned absence (e.g. family emergencies, religious pilgrimages), parents must submit a formal leave application through the parent portal or school administrative office at least three days in advance.
3. Unnotified continuous absence for 14 consecutive school days may lead to struck-off enrollment under institutional bylaws.
`,
  },

  // 2. Examination Bye-Laws
  {
    id: 'exam-001',
    document: 'Examination Bye-Laws & Grading Policy',
    title: 'Passing Marks and Promotion Criteria',
    category: 'EXAMINATION',
    keywords: ['passing marks', 'pass percentage', 'promotion', 'fail', '33%', 're-exam', 'compartment', 'grades'],
    content: `
1. The minimum qualifying mark for passing any subject is 33% in both internal assessments/practicals and external/term examinations individually.
2. Grading Scale:
   - A1: 91% - 100% (Grade Point: 10.0)
   - A2: 81% - 90% (Grade Point: 9.0)
   - B1: 71% - 80% (Grade Point: 8.0)
   - B2: 61% - 70% (Grade Point: 7.0)
   - C1: 51% - 60% (Grade Point: 6.0)
   - C2: 41% - 50% (Grade Point: 5.0)
   - D:  33% - 40% (Grade Point: 4.0)
   - E:  Below 33% (Needs Improvement / Compartment)
3. Students obtaining Grade E in not more than two subjects are eligible for supplementary/compartment examinations held in July.
`,
  },
  {
    id: 'exam-002',
    document: 'Examination Bye-Laws & Grading Policy',
    title: 'Missed Examination on Medical Grounds',
    category: 'EXAMINATION',
    keywords: ['missed exam', 'sick on exam', 're-test', 'medical certificate exam', 'absent exam'],
    content: `
If a student misses a terminal examination due to severe illness, the parents must inform the examination controller on or before the exam morning and submit a government hospital medical certificate within 3 days. 
A re-test or pro-rata mark assessment will be evaluated exclusively by the Academic Council. Unexcused absence will be scored as zero.
`,
  },

  // 3. Fee Payment Policy
  {
    id: 'fee-001',
    document: 'Fee Payment & Regulation Policy',
    title: 'Quarterly Due Dates and Late Fine',
    category: 'FEES',
    keywords: ['fee due date', 'late fee', 'fine', 'penalty', 'quarterly', 'term fee', '10th', 'instalment', 'payment schedule'],
    content: `
1. Tuition and term fees are payable in four quarterly installments:
   - Quarter 1 (Apr-Jun): Due by April 10th
   - Quarter 2 (Jul-Sep): Due by July 10th
   - Quarter 3 (Oct-Dec): Due by October 10th
   - Quarter 4 (Jan-Mar): Due by January 10th
2. A grace period of 5 calendar days is provided. 
3. Payments received after the 15th will incur a late surcharge of ₹50 per day up to the 30th of the due month.
4. If fees remain unpaid after 45 days, access to the student portal and administrative records may be temporarily restricted until cleared.
`,
  },
  {
    id: 'fee-002',
    document: 'Fee Payment & Regulation Policy',
    title: 'Approved Payment Modes and Receipts',
    category: 'FEES',
    keywords: ['payment modes', 'how to pay', 'upi', 'netbanking', 'card', 'razorpay', 'cash fee', 'receipt'],
    content: `
School fees can be settled 24/7 via the Alpha Edu Hub Parent Portal using UPI, NetBanking, Debit/Credit Cards (secured via Razorpay). 
Instant automated digital receipts are generated and permanently archived in the parent invoice portal. 
Cash payments are accepted strictly at the school accounts counter on working days between 9:00 AM and 1:30 PM.
`,
  },

  // 4. Code of Conduct & Handbook
  {
    id: 'conduct-001',
    document: 'Student Handbook & Code of Conduct',
    title: 'Uniform Guidelines and School Timings',
    category: 'CODE_OF_CONDUCT',
    keywords: ['uniform', 'dress code', 'timings', 'school hours', 'shoes', 'grooming', 'punctuality'],
    content: `
1. School instructional hours are 8:00 AM to 2:15 PM (Monday through Friday). All students must arrive by 7:50 AM for morning assembly.
2. Regular uniform is mandatory on Mondays, Tuesdays, Thursdays, and Fridays. House T-shirts and sports tracks are worn on Wednesdays and designated sports days.
3. Polished black leather shoes with standard navy socks are compulsory. Ornaments, wristbands, and non-prescribed accessories are strictly prohibited.
`,
  },
  {
    id: 'conduct-002',
    document: 'Student Handbook & Code of Conduct',
    title: 'Digital Device and Mobile Phone Policy',
    category: 'CODE_OF_CONDUCT',
    keywords: ['mobile phone', 'phone allowed', 'smartwatch', 'devices', 'electronics', 'confiscation'],
    content: `
Mobile phones, smartwatches with cellular connectivity, and portable gaming devices are strictly forbidden on school premises. 
If an unauthorized digital device is brought to school, it will be confiscated and retained in the administrative locker for a minimum of 30 days and handed over solely to the parent/guardian with a written undertaking.
`,
  },

  // 5. Transport Safety
  {
    id: 'transport-001',
    document: 'Transport Safety Regulations',
    title: 'Bus Pass and Change of Stops Protocol',
    category: 'TRANSPORT',
    keywords: ['school bus', 'transport', 'bus stop', 'change stop', 'bus pass', 'route', 'fleet'],
    content: `
1. Every bus student must carry an authorized RFID transport badge. 
2. Temporary stop changes are not permitted without 24 hours prior written consent from the transport manager.
3. In case of emergency delays or vehicle breakdown, real-time push alerts and SMS notifications are broadcast to parents via the ERP communication gateway.
`,
  },

  // 6. Admissions & Transfer
  {
    id: 'admissions-001',
    document: 'Admission & Transfer Certificate Bye-Laws',
    title: 'Procedure for Obtaining Transfer Certificate (TC)',
    category: 'ADMISSIONS',
    keywords: ['transfer certificate', 'tc', 'withdrawal', 'leaving school', 'security deposit', 'clearance'],
    content: `
Parents intending to withdraw their ward must submit a written TC application at least 15 working days prior to the end of the ongoing term. 
All dues (library books, laboratory equipment, fee balances) must receive clearance certificates before the digital Transfer Certificate is generated and sealed.
`,
  },
];
