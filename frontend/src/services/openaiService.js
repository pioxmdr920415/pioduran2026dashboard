// OpenAI Direct API Service for MDRRMO Chatbot

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_MESSAGE = `You are an AI assistant for MDRRMO (Municipal Disaster Risk Reduction and Management Office) Pio Duran. Your role is to:

1. Help users navigate the File Inventory & Management System
2. Provide information about disaster preparedness and response
3. Assist with queries about:
   - Supply Inventory management
   - Contact Directory
   - Calendar and Event Management
   - Document Management
   - Photo Documentation
   - Interactive Maps
   - Panorama Gallery

4. Offer guidance on disaster management protocols
5. Help with emergency response procedures
6. Provide tips on disaster preparedness for the community

Be helpful, professional, and concise. If asked about specific data in the system, guide users on how to access the relevant module. For emergency situations, always recommend contacting local emergency services.

Keep responses clear and actionable. Use bullet points when listing multiple items.`;

export const sendMessage = async (messages) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_MESSAGE },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from AI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

export default { sendMessage };
