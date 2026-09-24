jest.mock('../src/queues/examQueue', () => ({
  scheduleAutoSubmit: jest.fn().mockResolvedValue('job-1'),
  cancelAutoSubmit: jest.fn().mockResolvedValue(true),
}));

const { calcGrade } = require('../src/models/Result');
const { evaluate } = require('../src/services/exam/evaluation.service');

describe('calcGrade', () => {
  const cases = [
    [95, 'A+'],
    [90, 'A+'],
    [80, 'A'],
    [75, 'A'],
    [65, 'B'],
    [60, 'B'],
    [50, 'C'],
    [45, 'C'],
    [40, 'D'],
    [33, 'D'],
    [32, 'F'],
    [0, 'F'],
  ];
  test.each(cases)('%i%% → %s', (pct, expected) => {
    expect(calcGrade(pct)).toBe(expected);
  });
});

describe('evaluate + grade integration', () => {
  const exam = {
    questions: [
      { correctOptionIndex: 0 },
      { correctOptionIndex: 1 },
      { correctOptionIndex: 2 },
      { correctOptionIndex: 0 },
    ],
    totalMarks: 8,
    marksPerQuestion: 2,
    negativeMarking: true,
    negativeMarks: 0.5,
  };

  test('all correct → 100%', () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndex: 0 },
      { questionIndex: 1, selectedOptionIndex: 1 },
      { questionIndex: 2, selectedOptionIndex: 2 },
      { questionIndex: 3, selectedOptionIndex: 0 },
    ];
    const result = evaluate(exam, answers);
    expect(result.correct).toBe(4);
    expect(result.wrong).toBe(0);
    expect(result.obtainedMarks).toBe(8);
    expect(result.percentage).toBe(100);
    expect(calcGrade(result.percentage)).toBe('A+');
  });

  test('mixed answers with negative marking', () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndex: 0 }, // correct
      { questionIndex: 1, selectedOptionIndex: 0 }, // wrong
      { questionIndex: 2, selectedOptionIndex: 2 }, // correct
      // q3 unanswered
    ];
    const result = evaluate(exam, answers);
    expect(result.correct).toBe(2);
    expect(result.wrong).toBe(1);
    expect(result.unanswered).toBe(1);
    // 2*2 - 1*0.5 = 3.5
    expect(result.obtainedMarks).toBe(3.5);
    expect(result.percentage).toBe(43.75);
    expect(calcGrade(result.percentage)).toBe('D');
  });

  test('all wrong with negative marking never goes below 0', () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndex: 3 },
      { questionIndex: 1, selectedOptionIndex: 3 },
      { questionIndex: 2, selectedOptionIndex: 3 },
      { questionIndex: 3, selectedOptionIndex: 3 },
    ];
    const result = evaluate(exam, answers);
    expect(result.obtainedMarks).toBe(0);
    expect(calcGrade(result.percentage)).toBe('F');
  });
});
