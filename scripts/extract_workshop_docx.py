"""One-off: extract text from workshop .docx / .pdf into JSON for verbatim import."""
import json
import os
import sys
import zipfile
import xml.etree.ElementTree as ET

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def docx_text(path: str) -> str:
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    paras = []
    for p in root.iter(W_NS + "p"):
        parts = []
        for node in p.iter():
            if node.tag == W_NS + "t" and node.text:
                parts.append(node.text)
            elif node.tag == W_NS + "tab":
                parts.append("\t")
        if parts:
            paras.append("".join(parts))
    return "\n".join(paras)


def pdf_text(path: str) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            return "[PDF: install pypdf to extract text]\n"
    r = PdfReader(path)
    return "\n".join(page.extract_text() or "" for page in r.pages)


def main() -> None:
    base = r"c:\Users\Main\Downloads\drive-download-20260327T175003Z-1-001"
    mapping = [
        ("Day 1 #3_ Trust and Accountability in Sign Language AI Innovation.docx", "trust-and-accountability-sign-language-ai"),
        ("Day 1 #6 Lessons from Dataset Creation for Sustainable Sign Language AI.docx", "lessons-dataset-creation-sustainable-sl-ai"),
        ("Day 1 #7 Practical Applications of AI Sign Language Translation.docx", "practical-applications-ai-sl-translation"),
        ("Day 1 #9 Bridging the Gap_ Real-Time AI Avatars & Sign Language Animation.docx", "bridging-gap-ai-avatars-sign-language-animation"),
        (None, "human-ai-collaboration-sign-language-technology"),  # resolved by glob below
        ("Day 2 #2 Learning with Signers_ Educational Applications of SLxAI.docx", "learning-with-signers-educational-slxai"),
        ("Day 2 #3 Good enough for whom_ Ethics, power, and accountability in sign language AI deployment.docx", "good-enough-for-whom-ethics-power-accountability"),
        ("Day 1 #2 Ethics_ Where does it stop.docx", "ethics-where-does-it-stop"),
        ("Day 1 #4 Research & Data Collection_ Strengthening Validity Through Partnerships.docx", "research-data-collection-partnerships"),
        ("Day 1 #5 Intentional Design for SL Translation_ AI and Hybrid Approaches.docx", "intentional-design-sl-translation-hybrid"),
        ("Day 1 #8 Beyond Gloss_ A New Framework for Sign Language Data.docx", "beyond-gloss-framework-sign-language-data"),
        ("Day 1 #10 A Better World, Driven by Technology, Shaped by the Deaf.docx", "better-world-technology-shaped-by-deaf"),
        ("Day 1 #11 The Future of Sign Language Translation is Transcription.docx", "future-sl-translation-is-transcription"),
        ("Day 2 #5 ASL, AI, and Authority_ Centering Deaf ASL Experts in Language Technologies.docx", "asl-ai-authority-deaf-experts"),
        ("Day 2 #7 Sign Language AI and International Policy Spaces.docx", "sign-language-ai-international-policy"),
        ("Day 2 #8 Fireside Chat with Federal Communications Commission.docx", "fireside-chat-fcc"),
        ("Day 2 #9 CoSET SAFE AI_ Designing for Communication Success.pdf", "coset-safe-ai-communication-success"),
    ]
    out: dict[str, str] = {}
    import glob as glob_mod

    for item in mapping:
        fn, slug = item
        if fn is None:
            matches = glob_mod.glob(os.path.join(base, "Day 2 #1 Human-AI*.docx"))
            if not matches:
                print("MISSING Human-AI docx", file=sys.stderr)
                continue
            p = matches[0]
        else:
            p = os.path.join(base, fn)
        if not os.path.isfile(p):
            print("MISSING", p, file=sys.stderr)
            continue
        if p.lower().endswith(".pdf"):
            out[slug] = pdf_text(p)
        else:
            out[slug] = docx_text(p)

    out_path = os.path.join(os.path.dirname(__file__), "workshop_verbatim_extracted.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("Wrote", out_path, "keys:", len(out))


if __name__ == "__main__":
    main()
