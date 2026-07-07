# AI Form Filling System Architecture

The AI Form Filling Engine (Phase 3) is designed to replace fragile, hardcoded CSS selectors with a robust, intelligent DOM scanning system coupled with fuzzy matching AI. This ensures maximum compatibility across diverse and highly unstructured job application boards.

## Core Components

The system operates using three core pillars:

### 1. The Supercharged Gemini Resume Parser
When a user uploads a resume, the document text is piped directly into Gemini 1.5 Flash. The prompt explicitly forces the LLM to output a strictly formatted JSON datastructure that tracks strings AND infinite-length Arrays representing candidate metrics.

```json
{
  "name": "Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "address": "Residential Location",
  "linkedin": "LinkedIn URL",
  "portfolio": "GitHub or Website",
  "skills": ["Skill 1", "Skill 2"],
  "education": [{ "degree": "BSc", "school": "University", "year": "2024" }],
  "experience": [{ "job_title": "Role", "company": "Company", "duration": "Dates", "description": "Notes" }]
}
```
This payload is saved directly into MongoDB and tied to the `userId`.

### 2. The Native DOM Extraction Scanner
When the Automation Python Engine opens an application page, rather than blindly attempting to click static `div` or `#id` nodes, it instead executes a raw Javascript payload: `scanScript`.

This script iterates the entire active document collecting all interactive tags (`<input>`, `<textarea>`, `<select>`). For each tag it extracts:
- `id`
- `name`
- `type`
- `placeholder`
- `aria-label`
- `Computed XPath`

This completely flattens complex UI structures into a single easily digestible JSON Array of available form parameters.

### 3. The Local Fuzzy Dictionary Mapper
The extracted DOM nodes are iteratively parsed against a local dictionary algorithm.
It merges all node string indicators into a single lowercase textblock and compares it against explicit fuzzy array strings.

**Example Matrix:**
- Name nodes typically contain: `['name', 'first', 'last', 'identity', 'fullname']`
- Phone nodes typically contain: `['phone', 'mobile', 'tel', 'cell', 'digits']`
- Github variants: `['portfolio', 'website', 'github', 'urls[\"portfolio\"]', 'web']`

If an alignment is triggered, the system extracts the exact relative XPath string of the matched node and passes it to the `typeToXPath()` explicit action which reliably drops the matching MongoDB `parsedData` value directly into the input.

---

### E2E Testing Interface
The easiest way to confirm mapping capabilities is through the Next.js `http://localhost:3001/dashboard` route.
Using the **"Direct AI Link Scanner"** input box, developers can paste raw Job Application URLs (such as `mock_job_form.html`).
This hits the `/api/v1/applications/auto-apply` wrapper endpoint which spawns a synthetic Job Payload and pipelines it directly to the AI Engine for immediate scraping and testing.
