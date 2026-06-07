// AI lead processing using Claude API
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ParsedLead {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  neighborhood?: string;
  minRooms?: number;
  maxRooms?: number;
  minBudget?: number;
  maxBudget?: number;
  propertyType?: string;
  requireParking?: boolean;
  requireElevator?: boolean;
  moveInDate?: string;
  aiSummary: string;
  aiQuestions: string[];
}

export async function processLeadWithAI(rawText: string): Promise<ParsedLead> {
  const prompt = `אתה מסייע לסוכן נדל"ן לעבד לידים חדשים. קרא את הטקסט הבא ממשתמש שמחפש נכס להשכרה/קנייה וחלץ את המידע הרלוונטי.

טקסט הליד:
"""
${rawText}
"""

החזר JSON בדיוק בפורמט הבא (כל שדה אופציונלי - מלא רק מה שמוזכר במפורש):
{
  "name": "שם מלא או null",
  "phone": "מספר טלפון או null",
  "email": "כתובת אימייל או null",
  "city": "עיר מבוקשת או null",
  "neighborhood": "שכונה מבוקשת או null",
  "minRooms": מספר חדרים מינימלי או null,
  "maxRooms": מספר חדרים מקסימלי או null,
  "minBudget": תקציב מינימלי בש"ח או null,
  "maxBudget": תקציב מקסימלי בש"ח או null,
  "propertyType": "APARTMENT/PENTHOUSE/GARDEN_APARTMENT/STUDIO/DUPLEX/COMMERCIAL/OTHER או null",
  "requireParking": true/false/null,
  "requireElevator": true/false/null,
  "moveInDate": "תאריך בפורמט ISO או null",
  "aiSummary": "סיכום קצר של הדרישות בעברית (2-3 משפטים)",
  "aiQuestions": ["שאלת השלמה 1", "שאלת השלמה 2", "שאלת השלמה 3"]
}

בשדה aiQuestions - כתוב עד 3 שאלות ברורות בעברית שיעזרו להבין טוב יותר את הצרכים. התמקד בפרטים חסרים שחשובים להתאמה.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    return JSON.parse(jsonMatch[0]) as ParsedLead;
  } catch {
    return {
      aiSummary: "לא ניתן לעבד את הליד אוטומטית",
      aiQuestions: ["מהי העיר המבוקשת?", "מה התקציב?", "כמה חדרים נדרשים?"],
    };
  }
}
