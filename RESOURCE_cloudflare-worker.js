// Copy this code into your Cloudflare Worker script
// This version includes:
// - Proper CORS headers on OPTIONS preflight responses
// - Defensive JSON parsing with error handling
// - Clear error messages for debugging

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // or restrict to 'https://alyosnfgdf.github.io'
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests (no body parsing needed)
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204, 
        headers: corsHeaders 
      });
    }

    // Only attempt to parse JSON for POST/PUT requests
    let userInput;
    try {
      if (request.method === 'POST' || request.method === 'PUT') {
        userInput = await request.json();
      }
    } catch (err) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body', 
        details: err.message 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Validate the messages array exists
    if (!userInput || !Array.isArray(userInput.messages)) {
      return new Response(JSON.stringify({ 
        error: 'Missing or malformed `messages` array in request body' 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    try {
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set. Configure it in Cloudflare Workers dashboard.');
      }

      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const requestBody = {
        model: 'gpt-4o',
        messages: userInput.messages,
        max_tokens: 300,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Read response as text first to handle non-JSON responses
      const respText = await response.text();

      if (!response.ok) {
        return new Response(JSON.stringify({ 
          error: 'OpenAI API error',
          status: response.status,
          details: respText 
        }), {
          status: response.status >= 500 ? 502 : response.status,
          headers: corsHeaders
        });
      }

      // Parse JSON safely
      let data;
      try {
        data = JSON.parse(respText || '{}');
      } catch (parseErr) {
        return new Response(JSON.stringify({ 
          error: 'Failed to parse OpenAI response as JSON',
          details: parseErr.message,
          raw: respText.substring(0, 200)
        }), {
          status: 502,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify(data), { 
        status: 200,
        headers: corsHeaders 
      });

    } catch (err) {
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        details: err.message 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
