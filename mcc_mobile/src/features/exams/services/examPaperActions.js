import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { getExam } from './examsApi';
import { generateExamPaperPdf, getExamPaperFilename } from './examPaperPdf';

function isCancelledError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('cancel') || message.includes('dismiss');
}

async function copyToNamedCacheFile(uri, filename) {
  const target = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: target });
  return target;
}

export async function prepareExamPaper(examId, instituteName) {
  const response = await getExam('admin', examId);
  const exam = response.data;
  if (!exam || exam.status !== 'published') {
    const error = new Error(
      'Publish this exam before downloading or sharing its paper.',
    );
    error.code = 'EXAM_NOT_PUBLISHED';
    throw error;
  }

  const generated = await generateExamPaperPdf(exam, instituteName);
  const filename = getExamPaperFilename(exam);
  const uri = await copyToNamedCacheFile(generated.uri, filename);
  return { exam, filename, uri };
}

export async function shareExamPaper(examId, instituteName) {
  const paper = await prepareExamPaper(examId, instituteName);
  try {
    if (!(await Sharing.isAvailableAsync())) {
      const error = new Error(
        'Native sharing is not available on this device.',
      );
      error.code = 'SHARING_UNAVAILABLE';
      throw error;
    }
    await Sharing.shareAsync(paper.uri, {
      mimeType: 'application/pdf',
      dialogTitle: paper.filename,
      UTI: 'com.adobe.pdf',
    });
    return paper;
  } catch (error) {
    if (isCancelledError(error)) return { ...paper, cancelled: true };
    throw error;
  } finally {
    try {
      await FileSystem.deleteAsync(paper.uri, { idempotent: true });
    } catch {
      /* best effort */
    }
  }
}

export async function saveExamPaper(examId, instituteName) {
  const paper = await prepareExamPaper(examId, instituteName);
  try {
    if (Platform.OS === 'android') {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) return { ...paper, cancelled: true };

      const base64 = await FileSystem.readAsStringAsync(paper.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const destination =
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          paper.filename,
          'application/pdf',
        );
      await FileSystem.StorageAccessFramework.writeAsStringAsync(
        destination,
        base64,
        { encoding: FileSystem.EncodingType.Base64 },
      );
      return { ...paper, destination };
    }

    if (!(await Sharing.isAvailableAsync())) {
      const error = new Error('The device cannot open the save/share flow.');
      error.code = 'SAVING_UNAVAILABLE';
      throw error;
    }
    await Sharing.shareAsync(paper.uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Save ${paper.filename}`,
      UTI: 'com.adobe.pdf',
    });
    return paper;
  } catch (error) {
    if (isCancelledError(error)) return { ...paper, cancelled: true };
    throw error;
  } finally {
    try {
      await FileSystem.deleteAsync(paper.uri, { idempotent: true });
    } catch {
      /* best effort */
    }
  }
}
