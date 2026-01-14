import { GoogleGenAI, Type } from "@google/genai";
import { CompanyAnalysis, SourcingCriteria, CandidateProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Existing Analysis Function ---
export const analyzeCompany = async (
  companyName: string, 
  context: string = "", 
  useSearch: boolean = false
): Promise<CompanyAnalysis> => {
  const model = "gemini-3-pro-preview"; 
  
  let prompt = "";

  if (useSearch) {
    prompt = `
      You are a senior M&A analyst. 
      Action: Search for the latest "Årsredovisning" (Annual Report), financial news, and the official website for the company: "${companyName}".
      
      Your goal is to extract real financial data from search results to perform a deep financial analysis.
      
      If exact numbers for the most recent year are not yet available, use the most recent available data and estimate based on quarterly reports found in search.
    `;
  } else {
    prompt = `
      Perform a deep financial analysis for the company: "${companyName}".
      ${context ? `Additional context from documents: ${context}` : ''}
      
      You are a senior M&A analyst. Use your internal knowledge base to approximate the financial data for the last 3 years if exact recent reports are not provided in context. 
    `;
  }

  prompt += `
    Provide:
    1. An executive summary suitable for investment committees.
    2. Financial metrics for the last 3 years (Revenue, EBITDA, Net Income in Millions USD, and Profit Margin %).
    3. A detailed SWOT analysis (at least 2 items per category).
    4. A risk assessment covering Financial, Legal, ESG, and Operational risks with risk levels (Low/Medium/High).
    5. Calculate the 3-year CAGR for Revenue based on the data you provide.
    6. The official website URL of the company (if found).
    
    Ensure the tone is professional, concise, and objective.
  `;

  // Define the schema for the structured response
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      companyName: { type: Type.STRING },
      website: { type: Type.STRING, description: "Official company website URL (e.g., https://www.company.com)" },
      executiveSummary: { type: Type.STRING },
      cagr: { type: Type.NUMBER, description: "3-year Revenue CAGR as a percentage (e.g. 15.5)" },
      lastUpdated: { type: Type.STRING, description: "Current date YYYY-MM-DD" },
      metrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            revenue: { type: Type.NUMBER },
            ebitda: { type: Type.NUMBER },
            netIncome: { type: Type.NUMBER },
            profitMargin: { type: Type.NUMBER },
          },
          required: ["year", "revenue", "ebitda", "netIncome", "profitMargin"],
        },
      },
      swot: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            type: { type: Type.STRING, enum: ["strength", "weakness", "opportunity", "threat"] },
            content: { type: Type.STRING },
          },
          required: ["id", "type", "content"],
        },
      },
      risks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["Financial", "Legal", "ESG", "Operational"] },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            description: { type: Type.STRING },
          },
          required: ["category", "riskLevel", "description"],
        },
      },
    },
    required: ["companyName", "executiveSummary", "metrics", "swot", "risks", "cagr", "lastUpdated"],
  };

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    temperature: 0.3,
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const analysis = JSON.parse(text) as CompanyAnalysis;

    const sources: string[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }
    analysis.sources = [...new Set(sources)];

    return analysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// --- New Sourcing Function ---

export const findTargets = async (criteria: SourcingCriteria): Promise<CandidateProfile[]> => {
  const model = "gemini-3-pro-preview";

  const prompt = `
    You are an expert M&A Headhunter specializing in the IT sector.
    
    Task: Find 4-6 real companies that match the following acquisition criteria:
    - Region: ${criteria.region}
    - Industry/Niche: ${criteria.industry}
    - Revenue Range: ${criteria.revenueRange}
    - Desired Tech Stack/Keywords: ${criteria.techStack}

    Action: Search for companies, their "About" pages, their job postings (to deduce tech stack), and financial news.
    
    For each company found:
    1. Estimate their tech stack based on public job listings or tech blogs (e.g., "Hiring React developers" -> Tech Stack: React).
    2. Assign a 'Match Score' (0-100) based on how well they fit the user's specific tech and industry criteria.
    3. Identify growth signals (e.g., "Recently raised Series A", "Expanding to new markets").
    4. Find the official website URL.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        shortDescription: { type: Type.STRING },
        location: { type: Type.STRING },
        estimatedRevenue: { type: Type.STRING, description: "e.g. '50-100 MSEK' or 'Unknown'" },
        techStackTags: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of technologies used, e.g. ['Python', 'AWS', 'React']" 
        },
        matchScore: { type: Type.INTEGER },
        matchRationale: { type: Type.STRING },
        growthSignals: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ["id", "name", "shortDescription", "location", "techStackTags", "matchScore", "matchRationale", "growthSignals"],
    },
  };

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    temperature: 0.4,
    tools: [{ googleSearch: {} }],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as CandidateProfile[];
  } catch (error) {
    console.error("Sourcing failed:", error);
    throw error;
  }
};