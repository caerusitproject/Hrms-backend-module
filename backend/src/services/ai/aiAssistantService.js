const OpenAI = require("openai");
const AiConversation  = require("../../models/AiConversation");
const aiknowledge = require("./aiKnowledgeBase");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.askAI = async (query, userId = null, context = {} ) => {
  try {
    // Step 1: Try policy-based match
    const policyAnswer = aiknowledge.findPolicyAnswer(query);
    let finalAnswer = "";

    if (policyAnswer) {
      finalAnswer = policyAnswer;
    } else {
      // Step 2: Fall back to AI model
      const messages = [
        {
          role: "system",
          content: `
            You are an HRMS AI assistant.
            Respond politely and precisely to employee queries about payroll, leave, and HR processes.
            Use company policy knowledge when possible.
          `,
        },
        { role: "user", content: query },
      ];

      if (context?.employeeName) {
        messages.push({
          role: "system",
          content: `Employee: ${context.employeeName}, Role: ${context.role}`,
        });
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      });

      finalAnswer = completion.choices[0].message.content.trim();
    }

    // Step 3: Log the interaction
      
      await AiConversation.create({
        empId: userId, 
        question: query, 
        answer: finalAnswer, 
        context: context
      })

    return finalAnswer;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("AI assistant unavailable.");
  }
};

exports.userIfo = async() => {
  const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No access token provided.');
    }
    const accessToken = authHeader.split(' ')[1];

    try {
        // 2. Make a request to the UserInfo endpoint
        const userInfoResponse = await axios.get('https://your-auth-server.com/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // 3. Process the response
        const userData = userInfoResponse.data;
        res.json({ message: 'User profile data', user: userData });

    } catch (error) {
        console.error('Error fetching user info:', error.response ? error.response.data : error.message);
        res.status(500).send('Error fetching user information.');
    }
}
