process.env.NODE_ENV = 'test';

const { evaluate } = require('../src/services/exam/evaluation.service');

const exam = {
  totalMarks: 100,
  marksPerQuestion: 2,
  negativeMarking: true,
  negativeMarks: 0.5,
  questions: [
    { correctOptionIndex: 0 },
    { correctOptionIndex: 1 },
    { correctOptionIndex: 2 },
    { correctOptionIndex: 0 },
    { correctOptionIndex: 3 },
  ],
};

describe('evaluation.service', () => {
  test('calculates correct/wrong/unanswered and marks', () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndex: 0, clientTs: 1 }, // correct
      { questionIndex: 1, selectedOptionIndex: 2, clientTs: 1 }, // wrong
      { questionIndex: 2, selectedOptionIndex: 2, clientTs: 1 }, // correct
      // q3 and q4 unanswered
    ];

    const result = evaluate(exam, answers);

    expect(result.totalQuestions).toBe(5);
    expect(result.attempted).toBe(3);
    expect(result.correct).toBe(2);
    expect(result.wrong).toBe(1);
    expect(result.unanswered).toBe(2);
    // 2*2 - 1*0.5 = 3.5
    expect(result.obtainedMarks).toBe(3.5);
    expect(result.totalMarks).toBe(100);
    expect(result.percentage).toBe(3.5);
  });

  test('no negative marking when disabled', () => {
    const noNeg = { ...exam, negativeMarking: false };
    const answers = [
      { questionIndex: 0, selectedOptionIndex: 0, clientTs: 1 }, // correct
      { questionIndex: 1, selectedOptionIndex: 0, clientTs: 1 }, // wrong
    ];

    const result = evaluate(noNeg, answers);
    expect(result.obtainedMarks).toBe(2); // only positive marks
  });

  test('obtainedMarks never goes below 0', () => {
    const allWrong = exam.questions.map((_, i) => ({
      questionIndex: i,
      selectedOptionIndex: 99,
      clientTs: 1,
    }));

    const result = evaluate(exam, allWrong);
    expect(result.obtainedMarks).toBeGreaterThanOrEqual(0);
  });

  test('all unanswered returns zero marks', () => {
    const result = evaluate(exam, []);
    expect(result.attempted).toBe(0);
    expect(result.obtainedMarks).toBe(0);
    expect(result.unanswered).toBe(5);
  });
});
