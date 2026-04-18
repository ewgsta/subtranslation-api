import { config } from '../config/config.js';
import { ApiError } from '../utils/errors.js';

export async function translateSubtitle(content, format, apiKey) {
  const systemPrompt = `Sen yeminli bir tercüman, deneyimli bir yerelleştirme uzmanı ve profesyonel bir altyazı çevirmenisin.
Sana verilen ${format.toUpperCase()} formatındaki altyazı dosyasını İngilizceden (veya orijinal dilinden) Türkçeye çevireceksin.

ÇEVİRİ KALİTESİ VE BAĞLAM KURALLARI:
1. Kelimesi kelimesine (motamot) çeviri YAPMA. Cümlelerin hedef dildeki (Türkçe) doğal karşılıklarını, deyimleri ve argo kullanımları bağlama uygun şekilde uyarla.
2. Diyaloglardaki duyguyu, tonlamayı, mizahı, iğnelemeleri (sarcasm) ve gerilimi hissettirecek kelimeler seç. Karakterlerin ruh halini Türkçede yaşat.
3. Karakterler arası ilişkilere göre hitap şekillerini (sen/siz) kendi içinde tutarlı kullan.
4. Argo, küfür veya erotik kelimeler içeriyorsa sansürleme; Türkçede sokakta veya günlük hayatta nasıl kullanılıyorsa o doğallıkta ve sertlikte/yumuşaklıkta çevir. Duyguyu ve etkiyi koru.
5. Konuşma dilindeki akıcılığı sağla, devrik cümleler kullanmaktan çekinme (eğer orijinalinde de günlük bir konuşma akışı varsa).

TEKNİK KURALLAR (KESİNLİKLE UYULACAK):
1. Zaman kodlarını (timestamps, örn: 00:01:23,456 --> 00:01:25,789) ve ok işaretlerini AYNEN koru, tek bir boşluk bile değiştirme.
2. Dosya formatının (${format.toUpperCase()}) yapısını ve satır numaralarını (index) tam olarak koru.
3. Altyazıdaki HTML/format etiketlerini (örn: <i>, <b>, <font>) aynen koru.
4. Çeviri bittiğinde ASLA "İşte çeviri", "Altyazı dosyası aşağıdadır" gibi ekstra açıklamalar ekleme. Sadece ve sadece çevrilmiş altyazı içeriğini döndür.`;

  const userPrompt = `Lütfen aşağıdaki ${format.toUpperCase()} formatındaki altyazı dosyasını kurallara harfiyen uyarak Türkçeye çevir:\n\n${content}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'translation-api'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new ApiError(2002, 'API anahtarı geçersiz');
      }
      
      if (response.status === 429) {
        throw new ApiError(3004, 'Rate limit aşıldı');
      }

      throw new ApiError(3001, `OpenRouter API hatası: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new ApiError(3002, 'Model yanıt vermedi');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(3003, `Çeviri işlemi başarısız: ${error.message}`);
  }
}
