import { config } from '../config/config.js';
import { ApiError } from '../utils/errors.js';
import { translateSubtitle } from '../services/translationService.js';

export async function handleTranslation(req, res) {
  if (!req.file) {
    throw new ApiError(1001, 'Dosya yüklenmedi');
  }

  if (req.file.size > config.maxFileSize) {
    throw new ApiError(1004, 'Dosya boyutu çok büyük');
  }

  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

  if (!config.allowedFormats.includes(fileExtension)) {
    throw new ApiError(1002, 'Desteklenmeyen dosya formatı (Sadece SRT/VTT formatı desteklenir)');
  }

  let fileContent;
  try {
    fileContent = req.file.buffer.toString('utf-8');
  } catch (error) {
    throw new ApiError(1003, 'Dosya içeriği okunamadı');
  }

  const translatedContent = await translateSubtitle(fileContent, fileExtension, req.openRouterApiKey);

  const encodedFilename = encodeURIComponent(req.file.originalname);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
  res.send(translatedContent);
}
