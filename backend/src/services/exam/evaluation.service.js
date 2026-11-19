/**
 * Evaluates a submitted attempt against the exam's snapshotted correct answers.
 * Returns score fields to be saved on the ExamAttempt document.
 * Uses shuffle map to map shuffled positions back to original question indices.
 */
function evaluate(exam, answers, shuffleMap = []) {
  const totalQuestions = exam.questions.length;
  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const answer = answers.find((a) => a.questionIndex === i);
    const selected = answer?.selectedOptionIndex ?? null;

    if (selected === null) continue;

    attempted++;
    // Map shuffled position to original question index
    const originalIndex = shuffleMap && shuffleMap.length > 0 ? shuffleMap[i] : i;
    const correctIndex = exam.questions[originalIndex].correctOptionIndex;

    if (selected === correctIndex) {
      correct++;
    } else {
      wrong++;
    }
  }

  const unanswered = totalQuestions - attempted;
  const positiveMarks = correct * exam.marksPerQuestion;
  const deduction = exam.negativeMarking ? wrong * exam.negativeMarks : 0;
  const obtainedMarks = Math.max(0, positiveMarks - deduction);
  const percentage =
    exam.totalMarks > 0
      ? Math.round((obtainedMarks / exam.totalMarks) * 10000) / 100
      : 0;

  return {
    totalQuestions,
    attempted,
    correct,
    wrong,
    unanswered,
    obtainedMarks: Math.round(obtainedMarks * 100) / 100,
    totalMarks: exam.totalMarks,
    percentage,
  };
}

module.exports = { evaluate };
