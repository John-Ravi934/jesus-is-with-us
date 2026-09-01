export const translateText = async (text, targetLang = 'ta') => {
  if (!text) return '';
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text if translation fails
  }
};
