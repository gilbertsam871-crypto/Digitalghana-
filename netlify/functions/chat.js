const OpenAI = require("openai");

exports.handler = async function (event) {
  try {
    // Make sure request has a body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "Bad request." }),
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "Invalid JSON format." }),
      };
    }

    const { messages } = parsed;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "Invalid messages format." }),
      };
    }

    // Trim message history to avoid token overflow
    const trimmed = messages.slice(-20);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: trimmed,
      temperature: 0.7,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: completion.choices[0].message.content,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error. Please try again.",
      }),
    };
  }
};
