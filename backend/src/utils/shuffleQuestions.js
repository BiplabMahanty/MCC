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
function generateShuffleMap(totalQuestions, studentId, examId) {
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
 * Map answer from shuffled position to original question index
 * @param {number} shuffledIndex - Answer position in shuffled order
 * @param {number[]} shuffleMap - Shuffle map
 * @returns {number} Original question index
 */
function mapShuffledToOriginal(shuffledIndex, shuffleMap) {
  return shuffleMap[shuffledIndex];
}

module.exports = {
  generateShuffleMap,
  mapShuffledToOriginal,
};
