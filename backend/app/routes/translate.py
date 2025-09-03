# backend/app/routes/translate.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Union, List, Dict
import argostranslate.translate

router = APIRouter()

class TranslateRequest(BaseModel):
    text: Union[str, List[str]]
    source_lang: str
    target_lang: str

@router.post("/translate")
def translate_text(req: TranslateRequest):
    try:
        if isinstance(req.text, list):
            result: Dict[str, str] = {}
            for item in req.text:
                translated = argostranslate.translate.translate(
                    item, req.source_lang, req.target_lang)
                result[item] = translated
            return {"translations": result}
        else:
            translated = argostranslate.translate.translate(
                req.text, req.source_lang, req.target_lang)
            return {"translatedText": translated}
    except Exception as e:
        print("Translation error:", e)
        if isinstance(req.text, list):
            return {"translations": {item: item for item in req.text}}
        return {"translatedText": req.text}
