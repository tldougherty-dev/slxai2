/**
 * Split verbatim submission text into program-book sections (Workshop Description vs Learning objective).
 * Handles common headings: Learning Objective(s), Learning Outcomes, typos like "LLearning Objectives".
 */

const LEARNING_HEADER =
  /(?:^|\n)\s*(Learning\s+Objectives?|Learning\s+Outcomes?|LLearning\s+Objectives?)\s*[:\s]?\s*\n?/im;

const TECH_HEADER = /\n\s*(?:Technical\s+Requirements?|Tech\s+requirements?)\s*[:\s]/i;

function stripTechnicalBlock(s: string): string {
  const idx = s.search(TECH_HEADER);
  if (idx === -1) return s;
  return s.slice(0, idx).trim();
}

function extractLearningBlock(raw: string): string {
  const m = LEARNING_HEADER.exec(raw);
  if (!m) return '';
  const afterHeader = raw.slice(m.index + m[0].length);
  const tech = TECH_HEADER.exec(afterHeader);
  const end = tech ? tech.index : afterHeader.length;
  return afterHeader.slice(0, end).trim();
}

/**
 * Returns body text for Workshop Description and Learning objective blocks.
 * When there is no learning section, all non-technical content stays in the workshop description.
 */
export function getProgramBookSectionsFromVerbatim(raw: string): {
  workshopDescription: string;
  learningObjective: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { workshopDescription: '', learningObjective: '' };
  }

  const m = LEARNING_HEADER.exec(trimmed);
  if (!m) {
    return {
      workshopDescription: stripTechnicalBlock(trimmed),
      learningObjective: '',
    };
  }

  const workshopDescription = stripTechnicalBlock(trimmed.slice(0, m.index).trim());
  const learningObjective = extractLearningBlock(trimmed);

  return { workshopDescription, learningObjective };
}
