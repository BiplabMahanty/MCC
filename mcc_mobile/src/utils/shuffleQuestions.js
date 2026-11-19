/**
 * Seeded shuffle utility for deterministic question randomization
 * Same student always gets same shuffle for same exam
 */

/**
 * Simple seeded random number generator
 * Returns value between 0 and 1
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate shuffle map using seeded random
 * @param {number} totalQuestions - Total number of questions
 * @param {string} studentId - Student ID
 * @param {string} examId - Exam ID
 * @returns {number[]} Array mapping shuffled position to original position
 */
export function generateShuffleMap(totalQuestions, studentId, examId) {
  // Create seed from studentId + examId
  const seedString = `${studentId}${examId}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed += seedString.charCodeAt(i);
  }

  // Create array of original indices
  const indices = Array.from({ length: totalQuestions }, (_, i) => i);

  // Fisher-Yates shuffle with seeded random
  for (let i = totalQuestions - 1; i > 0; i--) {
    const randomValue = seededRandom(seed + i);
    const j = Math.floor(randomValue * (i + 1));

    // Swap
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

/**
 * Shuffle questions array based on shuffle map
 * @param {Array} questions - Original questions array
 * @param {number[]} shuffleMap - Shuffle map from generateShuffleMap
 * @returns {Array} Shuffled questions
 */
export function shuffleQuestions(questions, shuffleMap) {
  return shuffleMap.map((originalIndex) => questions[originalIndex]);
}

/**
 * Reconstruct shuffled questions from original questions and shuffle map
 * Used when resuming exam
 * @param {Array} originalQuestions - Original questions from exam
 * @param {number[]} shuffleMap - Stored shuffle map
 * @returns {Array} Shuffled questions in same order as original attempt
 */
export function reconstructShuffledQuestions(originalQuestions, shuffleMap) {
  return shuffleQuestions(originalQuestions, shuffleMap);
}
