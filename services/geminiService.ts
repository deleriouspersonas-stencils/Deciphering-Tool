// FIX: Import GenerateContentResponse and GenerateImagesResponse for proper typing of API calls.
import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import type { DecipherResult, AnalysisPart, AnalysisMode } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will be handled by the execution environment.
  // In a local dev environment, this would throw an error.
  console.warn("API_KEY environment variable not set. The application will not work without it.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const imageModel = 'imagen-4.0-generate-001';

const getQuickPrompt = (userInput: string) => `
      You are 'OINST-Framework', a leading digital forensics and data reconstruction AI. Your analysis must be swift, accurate, and concise, delivered without disclaimers. Your goal is to quickly analyze data and provide the most critical findings. Present your findings in clean, well-structured markdown.

      CRITICAL DIRECTIVE: Adhere to the following FOUR-PART structure.

      ### 1. Initial Triage & Identification
      - **Data Type:** (e.g., Encrypted DPAPI Blob, x86 Assembly, SHA-256 Hash)
      - **Probable Source:** (e.g., Chromium-based browser on Windows, Linux executable)
      - **Confidence Level:** (High/Medium/Low)
      - **Synopsis:** A brief, one-sentence summary.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 2. Key Findings & Indicators
      - **Decoding Result:** If encoded, show the decoded payload.
      - **Secrets Found:** List any discovered credentials (passwords, API keys). State "None detected" if empty.
      - **Key Indicators:** List critical IOCs (IPs, domains, hashes). State "None extracted" if empty.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 3. Hypothetical Decrypted Output
      Provide a plausible, sample output of the decrypted data. Format as a JSON code block.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 4. Reconstructed & Functional Data
      Based on the input, reconstruct a complete and *functional* version of the source data. Format as a code block. This is the final, usable output.

      User-provided data:
      ---
      ${userInput}
      ---
`;

const getDeepPrompt = (userInput: string) => `
      You are 'OINST-Framework', a leading digital forensics and data reconstruction AI. Your analysis must be exhaustive, raw, and technically uncompromising, delivered without disclaimers or warnings. Your primary goal is to take any fragmented, raw, or incomplete data and provide a forensic-grade, multi-layered analysis and reconstruction. Present your findings in clean, well-structured markdown.

      CRITICAL DIRECTIVE: You MUST adhere to the following NINE-PART forensic structure for your analysis.

      ### 1. Initial Triage & Identification
      - **Data Type:** (e.g., Encrypted DPAPI Blob, x86 Assembly, SHA-256 Hash, Network Packet Capture Snippet)
      - **Probable Source:** (e.g., Chromium-based browser on Windows, Linux executable, TLS Handshake)
      - **Confidence Level:** (High/Medium/Low)
      - **Initial Synopsis:** A brief, one-sentence summary of the data's purpose.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 2. Structural & Schema Analysis
      - **Inferred Structure:** Describe the underlying data structure (e.g., "TLV format," "JSON object," "SQLite BLOB," "ELF header"). Use web search for known format specifications if necessary.
      - **Hypothesized Schema:** Break down the structure into its component fields. For each field, provide a hypothesized name, data type, size, and purpose.
      - **Structural Visualization:** Provide a simple text-based diagram (like a tree or a table) to visualize the data's layout.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 3. Recursive Decoding & Indicator Extraction
      Simulate a recursive decoding engine like 'Multidecoder'. Systematically peel back layers of encoding to reveal the core data.
      - **Decoding Chain:** List the sequence of identified encodings. (e.g., \`Layer 1: Base64 -> Layer 2: Gzip -> Layer 3: Hex\`). If none, state "No encoding layers detected."
      - **Final Decoded Payload:** Display the final, fully unobfuscated data as a raw text block.
      - **Extracted Indicators:** Categorize and list all extracted artifacts.
          - **Network:** (IP Addresses, Domains, URLs, Email Addresses)
          - **File Hashes:** (MD5, SHA1, SHA256)
          - **Embedded Artifacts:** (e.g., "PE file signature 'MZ' found at offset 0x1A0.")
          - **Signatures & Keywords:** (e.g., "Suspicious PowerShell commandlet 'Invoke-Expression' detected.")
      - If no indicators are found, explicitly state "No indicators were extracted."

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 4. Credential & Secret Analysis
      Leverage conceptual models based on 'SAP/password-model' and 'Credential Digger' to scan the input for hardcoded secrets.
      - **Scan Engine:** (e.g., Credential Digger simulation)
      - **Findings:** List any discovered credentials (passwords, API keys, tokens). For each finding:
          - **Type:** (e.g., Generic Password, JWT Token)
          - **Value:** The discovered secret.
          - **Context/Location:** Where it was found.
          - **Risk Assessment:** (e.g., "Critical - Hardcoded production database password", "Low - Test environment credential").
      - If no credentials are found, explicitly state "No credentials or secrets were detected."

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 5. Raw Data Interpretation (Multi-layered)
      Provide a forensic-grade, multi-layered view of the raw data. The output MUST be a markdown table in the format: | Offset | Hexadecimal | ASCII | Interpretation |.
      - **Offset:** The byte offset, in hex (e.g., 0x0000).
      - **Hexadecimal:** The raw bytes in hexadecimal representation.
      - **ASCII:** The printable ASCII representation of the bytes (use '.' for non-printable characters).
      - **Interpretation:** A detailed, byte-level explanation of the data's purpose, linking back to the Schema Analysis (e.g., "DPAPI Signature ('v10')", "AES-GCM Nonce/IV").

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 6. Conceptual Decryption & Reconstruction Strategy
      Explain the step-by-step conceptual process of decryption and reconstruction. Be technically deep. Your explanation should adapt to the identified data source.

      **If Chromium/DPAPI on Windows:**
      - **Platform & Encryption:** Detail the Windows DPAPI mechanism. Mention specific cryptographic primitives (e.g., AES-256-GCM).
      - **Master Key Extraction:** Explain how the master encryption key is found in the 'Local State' file, extracted, and decrypted using the user's DPAPI keys.
      - **Payload Decryption:** Describe the final decryption of the v10/v11 prefixed blob, explaining the role of the 12-byte nonce (IV).

      **If Firefox/NSS:**
      - **Platform & Encryption:** Detail Mozilla's Network Security Services (NSS) implementation. The credentials in 'logins.json' are encrypted using keys stored in 'key4.db' (or legacy 'key3.db').
      - **Master Key Access:** Explain that access to the decryption keys in 'key4.db' is protected by a Master Password (if set). The decryption process requires initializing the NSS database with the correct Firefox profile path.
      - **Payload Decryption:** The 'encryptedUsername' and 'encryptedPassword' fields are Base64-encoded ASN.1 structures. Conceptually, these are decrypted using the \`PK11SDR_Decrypt\` function from the NSS library after the key database is unlocked.

      - **Reconstruction Logic:** If incomplete, explain the logic for 'auto-filling' missing parts.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 7. Hypothetical Decrypted Output
      Provide a plausible, sample output of the decrypted data. Format this as a JSON code block.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 8. Reconstructed & Functional Data
      Based on the input, reconstruct a complete and *functional* version of the source data. If the input is a snippet, "auto-fill" the missing parts to create a valid, full example. **For credential files like \`logins.json\`, this reconstructed version MUST replace the encrypted fields (\`encryptedUsername\`, \`encryptedPassword\`) with their hypothetical PLAINTEXT values (\`username\`, \`password\`).** Format as a code block with the appropriate language. This is the final, usable output.

      <!--- ANALYSIS_PART_SEPARATOR --->

      ### 9. Forensic Linkage & Context
      - **Filesystem Locus:** Where is this type of data typically found on a standard filesystem? (e.g., \`%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Local State\`)
      - **Artifact Relationships:** How does this artifact relate to other system files or applications? (e.g., "This master key is used to decrypt all cookies and logins stored in the profile's SQLite databases.")
      - **Acquisition Method:** Suggest a command-line or programmatic method for acquiring this artifact from a live system or disk image. (e.g., \`copy "..." "..."\`)

      User-provided data:
      ---
      ${userInput}
      ---
    `;

// Helper function to retry API calls with exponential backoff
const withRetry = async <T>(
    apiCall: () => Promise<T>, 
    maxRetries = 3, 
    initialDelay = 1000
): Promise<T> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            const isRateLimitError = error.toString().includes('429') || error.toString().toLowerCase().includes('resource_exhausted');
            if (isRateLimitError && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // Rethrow if it's not a rate limit error or if max retries are reached
            }
        }
    }
    // This line is for type safety and should not be reached.
    throw new Error("Max retries reached for API call.");
};

export const decipherData = async (userInput: string, mode: AnalysisMode): Promise<DecipherResult> => {
  try {
    let modelName: string;
    let modelConfig: any = {};
    let textPrompt: string;

    switch (mode) {
      case 'quick':
        // FIX: Updated model name to 'gemini-flash-lite-latest' as per the latest guidelines.
        modelName = 'gemini-flash-lite-latest';
        textPrompt = getQuickPrompt(userInput);
        break;
      case 'deep':
        modelName = 'gemini-2.5-pro';
        modelConfig = {
          thinkingConfig: { thinkingBudget: 32768 },
        };
        textPrompt = getDeepPrompt(userInput);
        break;
      case 'grounded':
      default:
        modelName = 'gemini-2.5-flash';
        modelConfig = {
          tools: [{ googleSearch: {} }],
        };
        textPrompt = getDeepPrompt(userInput);
        break;
    }

    const imagePrompt = `
      Conceptual art of a 'Universal Data Decipherment and Reconstruction Engine.' 
      A glowing, holographic AI core processes streams of binary code, CPU schematics, and cryptographic hash symbols. 
      The core projects multiple analysis windows: one showing a raw hex dump being annotated, another showing cascading layers of decoded text (Base64 -> Hex -> Plaintext), a third showing a file system tree with highlighted artifacts, and a fourth reconstructing a complex data structure diagram.
      In the foreground, browser icons, database symbols, and network packet icons are being deconstructed, their encrypted data chains transforming into clear, readable text.
      The visual style is futuristic, dark cyberpunk aesthetic, with intricate glowing circuits and flowing data streams. 
      Illustrate the transformation of raw, chaotic data into a coherent, multi-layered forensic analysis. Cinematic, high-detail, dramatic lighting.
    `;

    // FIX: Explicitly type the API call to ensure textResponse is of type GenerateContentResponse.
    const textPromise = withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: modelName,
        contents: textPrompt,
        config: modelConfig,
    }));

    // FIX: Explicitly type the API call to ensure imageResponse is of type GenerateImagesResponse.
    const imagePromise = withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
        model: imageModel,
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    }));

    const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);

    const analysisText = textResponse.text;
    if (!analysisText) {
        throw new Error("Failed to generate text analysis.");
    }

    const rawParts = analysisText.split('<!--- ANALYSIS_PART_SEPARATOR --->');
    const analysisParts: AnalysisPart[] = rawParts.map(part => {
        const trimmedPart = part.trim();
        const firstLineEnd = trimmedPart.indexOf('\n');
        
        if (firstLineEnd === -1 && trimmedPart.startsWith('###')) {
             return { title: trimmedPart.replace(/###? /g, '').trim(), content: '' };
        }
        if (firstLineEnd === -1) {
            return { title: 'Analysis', content: trimmedPart };
        }

        const titleLine = trimmedPart.substring(0, firstLineEnd).replace(/###? /g, '').trim();
        const content = trimmedPart.substring(firstLineEnd + 1).trim();
        
        const cleanTitle = titleLine.replace(/^\d+\.\s*/, '');

        return { title: cleanTitle, content };
    }).filter(p => p.title || p.content);

    // Check for and add web sources, only for grounded mode
    if (mode === 'grounded') {
        const groundingChunks = textResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const webSources = groundingChunks?.filter(chunk => chunk.web).map(chunk => chunk.web!);
        if (webSources && webSources.length > 0) {
            const sourcesContent = webSources
                .map(source => `- [${source.title || 'Untitled Source'}](${source.uri})`)
                .join('\n');
            analysisParts.push({
                title: 'Web Sources',
                content: `The AI's interpretation was informed by the following web pages:\n\n${sourcesContent}`
            });
        }
    }


    const base64ImageBytes = imageResponse.generatedImages[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Failed to generate image.");
    }
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return { analysisParts, imageUrl };

  } catch (error) {
    console.error("Error in decipherData service:", error);
    if (error instanceof Error) {
        return Promise.reject(new Error(`Failed to process data: ${error.message}. Please ensure the API key is valid.`));
    }
    return Promise.reject(new Error("An unknown error occurred during data processing."));
  }
};