import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback model chain — if one model is rate-limited, try the next
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
];

// Rate limit: 10 requests per 60 seconds per IP
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function getGeminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

type TableSchema = {
  id: string;
  label: string;
  columns: string[];
};

type PulseAIRequest = {
  prompt: string;
  tables: TableSchema[];
};

type PulseAIResult = {
  table: string;
  filters: { column: string; value: string }[];
};

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const allowed = checkRateLimit(`pulse-ai:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!allowed) {
      return Response.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body: PulseAIRequest = await request.json();
    const { prompt, tables } = body;

    if (!prompt || !tables || tables.length === 0) {
      return Response.json(
        { error: "Missing prompt or table schema." },
        { status: 400 }
      );
    }

    // Build schema description for Gemini
    const schemaDescription = tables
      .map(
        (t) =>
          `Table "${t.id}" (${t.label}): columns = [${t.columns.map((c) => `"${c}"`).join(", ")}]`
      )
      .join("\n");

    const systemPrompt = `You are a database query assistant for a college management system called CamPulse.
You help staff members query database tables using natural language.

Available tables and their columns:
${schemaDescription}

Your task:
1. Determine which ONE table the user is asking about.
2. Extract any filter conditions from the user's query.
3. Filters use case-insensitive partial matching (ILIKE with %value%), so values should be the core search term only.

IMPORTANT RULES:
- You MUST respond with ONLY valid JSON, no markdown, no explanation, no backticks.
- Use this exact schema: {"table": "<table_id>", "filters": [{"column": "<column_name>", "value": "<search_value>"}]}
- The "table" value MUST be one of the table IDs provided above.
- Each filter "column" MUST be an actual column name from that table.
- If no filters can be determined, return an empty filters array: {"table": "<table_id>", "filters": []}
- If the query is ambiguous about the table, pick the most relevant one.
- For gender queries: male = "M", female = "F"
- For status queries: use the exact status values like "approved", "pending", "rejected"
- Keep filter values short and precise — they are used in partial matching.
- NAME FORMAT: If the user provides a person's name in "Firstname Lastname" or "Firstname Middlename Lastname" format, you MUST reformat it to "Lastname Firstname Middlename" with proper capitalization (first letter uppercase, rest lowercase) for the filter value. The database stores names in "Lastname Firstname Middlename" format.
- YEAR ABBREVIATIONS: Translate year references to their abbreviations:
  - "first year" or "1st year" = "FY"
  - "second year" or "2nd year" = "SY"
  - "third year" or "3rd year" = "TY"
  - "final year" or "4th year" or "fourth year" = "BE"

Examples:
User: "show me all female students"
Response: {"table": "students", "filters": [{"column": "gender", "value": "F"}]}

User: "find staff in AIDS department"
Response: {"table": "staff", "filters": [{"column": "department_id", "value": "AIDS"}]}

User: "show pending event proposals"
Response: {"table": "event_proposals", "filters": [{"column": "status", "value": "pending"}]}

User: "all students"
Response: {"table": "students", "filters": []}

User: "find student soham bagad"
Response: {"table": "students", "filters": [{"column": "name", "value": "Bagad Soham"}]}

User: "find student rahul kumar sharma"
Response: {"table": "students", "filters": [{"column": "name", "value": "Sharma Rahul Kumar"}]}

User: "show first year students"
Response: {"table": "students", "filters": [{"column": "year_id", "value": "FY"}]}

User: "find final year students in AIDS"
Response: {"table": "students", "filters": [{"column": "year_id", "value": "BE"}, {"column": "department_id", "value": "AIDS"}]}`;

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser query: "${prompt}"` }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 256,
        topP: 0.8,
      },
    };

    // Try each model in the fallback chain
    let geminiRes: Response | null = null;
    let lastError = "";

    for (const model of GEMINI_MODELS) {
      const url = getGeminiUrl(model);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      if (res.ok) {
        geminiRes = res;
        break;
      }

      // If rate-limited (429), try next model
      const errData = await res.json().catch(() => null);
      lastError = errData?.error?.message || `Model ${model} returned ${res.status}`;
      console.warn(`Gemini model ${model} failed (${res.status}):`, lastError);

      if (res.status !== 429) {
        // Non-rate-limit error — don't try more models
        return Response.json(
          { error: `Gemini AI error: ${lastError}` },
          { status: 502 }
        );
      }
    }

    if (!geminiRes) {
      return Response.json(
        { error: "All AI models are rate-limited. Please try again in a minute." },
        { status: 429 }
      );
    }

    const geminiData = await geminiRes.json();

    // Extract text from Gemini response
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up: strip markdown code fences if Gemini adds them
    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let result: PulseAIResult;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response:", rawText);
      return Response.json(
        {
          error:
            "AI returned an unexpected format. Please try rephrasing your query.",
        },
        { status: 422 }
      );
    }

    // Validate the result
    const validTableIds = tables.map((t) => t.id);
    if (!result.table || !validTableIds.includes(result.table)) {
      return Response.json(
        { error: "AI could not determine a valid table from your query." },
        { status: 422 }
      );
    }

    const targetTable = tables.find((t) => t.id === result.table);
    if (result.filters && Array.isArray(result.filters)) {
      // Only keep filters whose columns actually exist in the table
      result.filters = result.filters.filter(
        (f) =>
          f.column &&
          f.value &&
          targetTable?.columns.includes(f.column)
      );
    } else {
      result.filters = [];
    }

    return Response.json(result);
  } catch (error: any) {
    console.error("PulseAI API error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
