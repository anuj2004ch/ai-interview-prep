const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4"
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

     const prompt = `
You are an elite Senior Technical Recruiter and Professional Resume Writer with 15+ years of experience getting candidates into FAANG and top-tier tech companies.

Your task is to generate a HIGH-QUALITY, ATS-OPTIMIZED resume tailored to the provided job description.

INPUT DATA
Candidate Resume Data:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

OBJECTIVE
Create a highly competitive resume that maximizes the candidate's chances of securing an interview.

CRITICAL RULES FOR CONTENT
1. STRICTLY ONE PAGE: The final output must fit comfortably on a single standard letter-sized page. Be ruthless with brevity. Strictly limit the entire resume content to under 400 words.
2. HYPERLINKS MUST WORK: In the header, you MUST extract the candidate's URLs from the input data and wrap them in valid HTML anchor tags (e.g., <a href="https://linkedin.com/in/username">LinkedIn</a> | <a href="https://github.com/username">GitHub</a>). 
3. IMPACT-FIRST: Focus on quantifiable achievements instead of responsibilities. Use the formula: "Accomplished [X] as measured by [Y], by doing [Z]".
4. KEYWORD OPTIMIZATION: Extract the 5-7 most critical technical skills from the Job Description and integrate them naturally.
5. STRONG VERBS: Start every bullet point with a powerful action verb (e.g., Architected, Spearheaded, Optimized, Engineered).
6. MAX BULLETS: Limit to exactly 3 ultra-condensed, high-impact bullets per role/project. Remove weak or obvious responsibilities.

STRUCTURE & HTML FORMATTING REQUIREMENTS
You must return the result as a raw JSON object containing a single key "html". 

The HTML must include a <style> block in the <head> with the following constraints to guarantee a one-page Puppeteer PDF render:
- Page boundary: \`@page { size: letter; margin: 0.4in; }\`
- Base typography: \`body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.2; color: #000; margin: 0; padding: 0; }\`
- Header Links: \`a { color: #000; text-decoration: none; }\`
- Section Headers (EXPERIENCE, SKILLS, etc.): \`h2 { font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #000; margin: 10px 0 4px 0; padding-bottom: 2px; }\`
- Alignment: Use CSS Flexbox (\`display: flex; justify-content: space-between;\`) to put Job Titles on the left and Dates/Companies on the right on the exact same line to save vertical space.
- ATS Rule: Do NOT use tables, CSS grids, columns, or images. Keep the HTML semantic (<h1>, <h2>, <ul>, <li>, <p>).

REQUIRED SECTIONS
1. HEADER: Name (centered, 18pt bold), followed by a centered paragraph of clickable links separated by a pipe character (Phone | Email | LinkedIn | GitHub).
2. PROFESSIONAL SUMMARY: 2 lines maximum. A targeted pitch aligned directly with the Job Description.
3. SKILLS: Grouped densely (e.g., Languages: ..., Frameworks: ..., Tools: ...).
4. EXPERIENCE: Most relevant 2-3 roles. 
5. PROJECTS: 1-2 highly relevant technical projects.
6. EDUCATION: Degree, University, Year (condensed to 1 line).

OUTPUT FORMAT
Return EXACTLY AND ONLY this JSON structure. Do not wrap the output in markdown blocks (e.g., do not use \`\`\`json). Provide the raw JSON object directly.

{
  "html": "<!DOCTYPE html><html><head><style>...</style></head><body>...</body></html>"
}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }