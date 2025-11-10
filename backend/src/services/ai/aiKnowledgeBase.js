// src/services/aiKnowledgeBase.js
const policies = [
  {
    keywords: ["leave policy", "casual leave", "sick leave"],
    answer: "Employees are entitled to 12 casual and 10 sick leaves annually. Any unused leaves can be carried forward up to 5 days.",
  },
  {
    keywords: ["work from home", "remote policy"],
    answer: "Work-from-home is permitted twice a week with manager approval.",
  },
  {
    keywords: ["probation period", "confirmation"],
    answer: "All new employees have a probation period of 3 months before confirmation.",
  },
  {
    keywords: ["holiday list", "public holidays"],
    answer: "Company observes all national holidays and two optional regional holidays.",
  },
  {
    keywords: ["payslip", "salary slip", "payroll"],
    answer: "Payslips are generated automatically on the 1st of each month and emailed to employees.",
  },
];

exports.findPolicyAnswer = (query) => {
  query = query.toLowerCase();
  for (const p of policies) {
    if (p.keywords.some(k => query.includes(k))) {
      return p.answer;
    }
  }
  return null; // fallback to OpenAI
};
