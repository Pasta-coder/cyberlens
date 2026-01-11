import spacy
import gc # <--- Memory management

def extract_named_entities(text):
    """
    Extracts organizations, dates, and geopolitical entities using Spacy.
    Optimized for low-RAM environments (Load -> Predict -> Unload).
    """
    if not text:
        return []

    nlp = None
    doc = None
    entities = []

    try:
        print("⏳ Loading NER Model...")
        # Load the small English model. 
        # Ensure you have 'en_core_web_sm' installed in your requirements.txt
        nlp = spacy.load("en_core_web_sm")
        
        # Process text
        doc = nlp(text)

        # Extract specific entities relevant to scams
        target_labels = ["ORG", "GPE", "DATE", "MONEY", "PERSON"]
        
        entities = [
            {
                "value": ent.text,      # Changed from "text" to match risk_assessor.py
                "type": ent.label_,     # Changed from "label" to match risk_assessor.py
                "start": ent.start_char, 
                "end": ent.end_char
            }
            for ent in doc.ents
            if ent.label_ in target_labels
        ]

        print(f"✅ NER Found {len(entities)} entities")

    except Exception as e:
        print(f"⚠️ NER Extraction Failed: {e}")
        # Return empty list instead of crashing
        return []

    finally:
        # --- AGGRESSIVE CLEANUP ---
        if nlp:
            del nlp
        if doc:
            del doc
        
        gc.collect() # Force RAM release
        print("✅ NER Model Unloaded")

    return entities