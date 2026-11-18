import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function temporaryUri(name) {
  return `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${name}`;
}

async function imageAsDataUri(block) {
  if (!block?.url) return null;
  const extension = block.mimeType?.split('/')?.[1] || 'jpg';
  const uri = temporaryUri(
    `exam-image-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`,
  );
  try {
    const downloaded = await FileSystem.downloadAsync(block.url, uri);
    const base64 = await FileSystem.readAsStringAsync(downloaded.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:${block.mimeType || 'image/jpeg'};base64,${base64}`;
  } catch {
    return null;
  } finally {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      /* best effort */
    }
  }
}

async function blockToHtml(block) {
  if (!block) return '';
  if (block.type === 'image') {
    const source = await imageAsDataUri(block);
    if (!source)
      return block.alt
        ? `<span class="missing-image">[${escapeHtml(block.alt)}]</span>`
        : '';
    return `<div class="image-block"><img src="${source}" alt="${escapeHtml(block.alt || '')}" />${block.caption ? `<div class="caption">${escapeHtml(block.caption)}</div>` : ''}</div>`;
  }
  if (block.type === 'table') {
    const headers = (block.headers || [])
      .map((header) => `<th>${escapeHtml(header)}</th>`)
      .join('');
    const rows = (block.rows || [])
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
      )
      .join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  if (block.type === 'formula')
    return `<span class="formula">${escapeHtml(block.value || '')}</span>`;
  return `<span>${escapeHtml(block.value || '')}</span>`;
}

async function blocksToHtml(blocks) {
  const values = await Promise.all(
    (Array.isArray(blocks) ? blocks : []).map(blockToHtml),
  );
  return values.filter(Boolean).join('<br />');
}

function infoRow(label, value) {
  return `<div class="info-row"><span class="info-label">${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}

function filenamePart(value) {
  return (
    String(value || 'Exam')
      .trim()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '') || 'Exam'
  );
}

export function getExamPaperFilename(exam) {
  const date = exam?.startTime ? new Date(exam.startTime) : null;
  const datePart =
    date && !Number.isNaN(date.getTime())
      ? date.toISOString().slice(0, 10)
      : 'undated';
  return `${filenamePart(exam?.name)}_${datePart}.pdf`;
}

export async function generateExamPaperPdf(
  exam,
  instituteName = 'Coaching Institute',
) {
  const questions = Array.isArray(exam?.questions) ? exam.questions : [];
  const questionHtml = await Promise.all(
    questions.map(async (question, index) => {
      const content = await blocksToHtml(question.content);
      const options = await Promise.all(
        (question.options || []).map(async (option, optionIndex) => {
          const optionContent = await blocksToHtml(option.content);
          return `<div class="option"><span class="option-label">${String.fromCharCode(65 + optionIndex)}.</span><span>${optionContent}</span></div>`;
        }),
      );
      const marks = Number(exam?.marksPerQuestion) === 1 ? 'mark' : 'marks';
      return `<section class="question"><div class="question-title"><strong>${index + 1}.</strong><span>${content || 'Question text unavailable'}</span><span class="marks">${escapeHtml(exam?.marksPerQuestion ?? '')} ${marks}</span></div>${options.join('')}</section>`;
    }),
  );

  const negativeMarking = exam?.negativeMarking
    ? `Yes (${exam.negativeMarks ?? 0} mark${Number(exam.negativeMarks) === 1 ? '' : 's'} deducted)`
    : 'No';

  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
@page{margin:32px 28px}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111827;font-size:12px;line-height:1.45}h1{margin:0;font-size:22px}h2{margin:24px 0 10px;font-size:15px;border-bottom:2px solid #f97316;padding-bottom:5px}.header{text-align:center;border-bottom:3px solid #f97316;padding-bottom:14px}.institute{color:#f97316;font-size:15px;font-weight:bold;margin-bottom:5px}.subtitle{color:#4b5563;margin-top:5px}.info{border:1px solid #d1d5db;border-radius:5px;padding:9px 12px}.info-row{display:flex;justify-content:space-between;gap:20px;padding:4px 0;border-bottom:1px solid #e5e7eb}.info-row:last-child{border-bottom:0}.info-label{color:#6b7280;font-weight:bold}.instructions{white-space:pre-wrap;background:#fff7ed;border-left:4px solid #f97316;padding:10px}.question{page-break-inside:avoid;margin:15px 0}.question-title{display:flex;align-items:flex-start;gap:6px;font-size:13px}.question-title>span:nth-child(2){flex:1}.marks{color:#6b7280;font-size:10px;white-space:nowrap}.option{display:flex;gap:8px;margin:7px 0 0 20px}.option-label{color:#f97316;font-weight:bold;min-width:15px}.image-block{margin:7px 0;text-align:center}img{max-width:100%;max-height:260px}.caption{color:#6b7280;font-size:10px}.missing-image{color:#6b7280;font-style:italic}.formula{font-family:monospace;background:#f3f4f6;padding:2px 4px}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #d1d5db;padding:5px;text-align:left}th{background:#f3f4f6}.empty{color:#6b7280;font-style:italic}
</style></head><body>
<div class="header"><div class="institute">${escapeHtml(instituteName)}</div><h1>${escapeHtml(exam?.name || 'Examination')}</h1><div class="subtitle">${escapeHtml(exam?.subjectId?.name || 'Subject not available')} · ${escapeHtml(exam?.batchId?.name || 'Batch not available')}</div></div>
<h2>Exam Information</h2><div class="info">
${infoRow('Examination name', exam?.name || 'Not available')}${infoRow('Subject', exam?.subjectId?.name || 'Not available')}${infoRow('Batch', exam?.batchId?.name || 'Not available')}${infoRow('Date', formatDate(exam?.startTime))}${infoRow('Start time', formatDateTime(exam?.startTime))}${infoRow('End time', formatDateTime(exam?.endTime))}${infoRow('Duration', exam?.durationMinutes ? `${exam.durationMinutes} minutes` : 'Not available')}${infoRow('Total marks', exam?.totalMarks ?? 'Not available')}${infoRow('Number of questions', questions.length)}${infoRow('Marks per question', exam?.marksPerQuestion ?? 'Not available')}${infoRow('Negative marking', negativeMarking)}</div>
${exam?.instructions ? `<h2>Instructions</h2><div class="instructions">${escapeHtml(exam.instructions)}</div>` : ''}<h2>Questions</h2>${questionHtml.length ? questionHtml.join('') : '<div class="empty">No published questions are available for this exam.</div>'}</body></html>`;

  const result = await Print.printToFileAsync({
    html,
    width: 612,
    height: 792,
  });
  return { ...result, filename: getExamPaperFilename(exam) };
}
