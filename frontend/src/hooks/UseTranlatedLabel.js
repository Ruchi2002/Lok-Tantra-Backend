// hooks/useTranslatedLabel.js

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { fallbackTranslations } from "../utils/fallbackTranslation";
import { translateText } from "../utils/translateText";

export const useTranslatedLabel = (section, key) => {
  const { currentLang } = useLanguage();
  const fallback =
    fallbackTranslations?.[section]?.[key]?.[currentLang] ||
    fallbackTranslations?.[section]?.[key]?.en ||
    key;

  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    let isMounted = true;

    const fetchTranslation = async () => {
      try {
        const translated = await translateText(key, currentLang, fallback);
        if (isMounted && translated) setLabel(translated);
      } catch (err) {
        if (isMounted) setLabel(fallback);
      }
    };

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [section, key, currentLang]);

  return label;
};
