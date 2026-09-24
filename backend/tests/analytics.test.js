jest.mock('../src/queues/examQueue', () => ({
  scheduleAutoSubmit: jest.fn().mockResolvedValue('job-1'),
  cancelAutoSubmit: jest.fn().mockResolvedValue(true),
}));

const { evaluate } = require('../src/services/exam/evaluation.service');
const { calcGrade } = require('../src/models/Result');

describe('analytics helpers', () => {
  const exam = {
    questions: [
      { correctOptionIndex: 1, topic: 'Algebra', difficulty: 'easy' },
      { correctOptionIndex: 2, topic: 'Algebra', difficulty: 'medium' },
      { correctOptionIndex: 0, topic: 'Geometry', difficulty: 'hard' },
    ],
    totalMarks: 6,
    marksPerQuestion: 2,
    negativeMarking: false,
    negativeMarks: 0,
  };

  function questionWise(attempts) {
    return exam.questions.map((q, i) => {
      let correct = 0;
      let attempted = 0;
      for (const attempt of attempts) {
        const ans = attempt.answers.find((a) => a.questionIndex === i);
        if (
          ans?.selectedOptionIndex !== null &&
          ans?.selectedOptionIndex !== undefined
        ) {
          attempted++;
          if (ans.selectedOptionIndex === q.correctOptionIndex) correct++;
        }
      }
      return {
        index: i,
        topic: q.topic,
        attempted,
        correct,
        accuracy:
          attempted > 0 ? Math.round((correct / attempted) * 10000) / 100 : 0,
      };
    });
  }

  test('question-wise accuracy with two attempts', () => {
    const attempts = [
      {
        answers: [
          { questionIndex: 0, selectedOptionIndex: 1 }, // correct
          { questionIndex: 1, selectedOptionIndex: 0 }, // wrong
          { questionIndex: 2, selectedOptionIndex: 0 }, // correct
        ],
      },
      {
        answers: [
          { questionIndex: 0, selectedOptionIndex: 1 }, // correct
          { questionIndex: 1, selectedOptionIndex: 2 }, // correct
          // q2 skipped
        ],
      },
    ];

    const qw = questionWise(attempts);
    expect(qw[0].accuracy).toBe(100);
    expect(qw[1].correct).toBe(1);
    expect(qw[1].accuracy).toBe(50);
    expect(qw[2].attempted).toBe(1);
    expect(qw[2].correct).toBe(1);
  });

  test('grade distribution across results', () => {
    const percentages = [95, 80, 60, 45, 30, 75];
    const grades = percentages.map(calcGrade);
    const dist = grades.reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    expect(dist['A+']).toBe(1);
    expect(dist['A']).toBe(2);
    expect(dist['B']).toBe(1);
    expect(dist['C']).toBe(1);
    expect(dist['F']).toBe(1);
  });

  test('evaluate with no negative marking', () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndex: 0 }, // wrong
      { questionIndex: 1, selectedOptionIndex: 2 }, // correct
    ];
    const result = evaluate(exam, answers);
    expect(result.obtainedMarks).toBe(2);
    expect(result.percentage).toBeCloseTo(33.33, 1);
  });
});
