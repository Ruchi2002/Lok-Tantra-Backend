const translationCache = {}; // Format: { "en|hi|Resolved": "अनुरोधित" }

export const translateText = async (input, source = "en", target = "hi") => {
  const isBatch = Array.isArray(input);
  const texts = isBatch ? input : [input];

  // Normalize whitespace
  const normalizedTexts = texts.map(text => text.trim());

  // Build cache keys and lookup
  const keys = normalizedTexts.map(text => `${source}|${target}|${text}`);
  const cachedResults = {};
  const uncachedTexts = [];

  keys.forEach((key, i) => {
    const original = normalizedTexts[i];
    if (translationCache[key]) {
      cachedResults[original] = translationCache[key];
    } else {
      uncachedTexts.push(original);
    }
  });

  // ✅ All cached? Return early
  if (uncachedTexts.length === 0) {
    const result = normalizedTexts.map(text => cachedResults[text]);
    return isBatch ? result : result[0];
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: uncachedTexts,
        source_lang: source,
        target_lang: target,
      }),
    });

    const data = await res.json();

    const newTranslations = data.translations || {};

    // ✅ Safely update cache and combine results
    uncachedTexts.forEach((original) => {
      const translated = newTranslations[original] || original;
      const key = `${source}|${target}|${original}`;
      translationCache[key] = translated;
      cachedResults[original] = translated;
    });

    const finalResult = normalizedTexts.map(text => cachedResults[text]);
    return isBatch ? finalResult : finalResult[0];

  } catch (error) {
    console.error("Translation failed:", error);

    // Fallback: return original texts
    return isBatch ? normalizedTexts : normalizedTexts[0];
  }
};
