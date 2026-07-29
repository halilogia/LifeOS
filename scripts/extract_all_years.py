import sys
sys.path.append(r"C:\Users\emre_\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\site-packages")

import fitz
import re
import json
import os

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip(' \t\n\r*-_^~|>•[]{}()')

def is_visual_question(question_text):
    """
    Skip geography map/shape questions and math geometry diagrams.
    """
    lower_text = question_text.lower()
    visual_keywords = [
        "şekilde", "şekildeki", "şekilde verilen", "grafikte", "grafiğe göre", "grafikteki",
        "haritada", "haritadaki", "haritaya göre", "taralı alan", "taralı bölge", "boyalı", 
        "numaralandırılmış", "coğrafi koordinat", "harita üzerinde", "yukarıdaki şekil",
        "tabloda", "tablodaki", "tabloya göre", "şemada", "şemadaki", "çizgili"
    ]
    for kw in visual_keywords:
        if kw in lower_text:
            return True
    return False

def parse_answer_key(doc):
    """
    Scans the end pages of the document to extract answer keys.
    Uses sequential occurrence counting to robustly separate Yetenek and Kültür keys.
    """
    yetenek_answers = {}
    kultur_answers = {}
    seen_counts = {}
    
    # Check the last 5 pages of the document
    for page_idx in range(len(doc) - 5, len(doc)):
        if page_idx < 0:
            continue
        text = doc[page_idx].get_text()
        text = text.replace('\xa0', ' ').replace('\r', '')
        
        matches = re.findall(r'\b([1-9][0-9]*)\s*\.\s*([A-E])\b', text)
        for q_num_str, ans in matches:
            q_num = int(q_num_str)
            seen_counts[q_num] = seen_counts.get(q_num, 0) + 1
            if seen_counts[q_num] == 1:
                yetenek_answers[q_num] = ans
            else:
                kultur_answers[q_num] = ans
                    
    return yetenek_answers, kultur_answers

def extract_questions(pdf_path, forced_section=None):
    """
    Extracts Tarih, Coğrafya, and Matematik questions from a PDF.
    """
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return None
        
    doc = fitz.open(pdf_path)
    yetenek_keys, kultur_keys = parse_answer_key(doc)
    
    # Merge keys based on forced_section for separate PDF files
    if forced_section == "YETENEK":
        yetenek_keys = {**kultur_keys, **yetenek_keys}
    elif forced_section == "KÜLTÜR":
        kultur_keys = {**yetenek_keys, **kultur_keys}
        
    tarih_questions = []
    cografya_questions = []
    matematik_questions = []
    
    current_section = "YETENEK"
    if forced_section:
        current_section = forced_section
        
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text()
        
        # Skip answer key page
        if "GENEL YETENEK" in text and ("1.   A" in text or "1. A" in text or "1.  A" in text):
            continue
            
        text_upper = text.upper()
        if not forced_section:
            # Remove joint headers/watermarks to prevent misclassification
            clean_text_detect = text_upper.replace("GYGK", "").replace("GY-GK", "").replace("GENEL YETENEK GENEL KÜLTÜR", "")
            
            if "GENEL YETENEK TESTİ" in text_upper or "GENEL YETENEK" in clean_text_detect or "GY" in clean_text_detect:
                current_section = "YETENEK"
            elif "GENEL KÜLTÜR TESTİ" in text_upper or "GENEL KÜLTÜR" in clean_text_detect or "GK" in clean_text_detect:
                current_section = "KÜLTÜR"
                
        is_yetenek = (current_section == "YETENEK")
        is_kultur = (current_section == "KÜLTÜR")
                    
        blocks = page.get_text("blocks")
        left_blocks = []
        right_blocks = []
        midpoint = 285
        
        for b in blocks:
            x0, y0, x1, y1, block_text, block_no, block_type = b
            if block_type != 0:
                continue
            if x0 < midpoint:
                left_blocks.append((y0, block_text))
            else:
                right_blocks.append((y0, block_text))
                
        left_blocks.sort(key=lambda x: x[0])
        right_blocks.sort(key=lambda x: x[0])
        
        columns = [
            "\n".join([t for _, t in left_blocks]),
            "\n".join([t for _, t in right_blocks])
        ]
        
        for col_text in columns:
            lines = col_text.split("\n")
            q_blocks = []
            current_q = None
            
            for line in lines:
                line_cleaned = line.strip()
                if not line_cleaned:
                    continue
                
                match = re.match(r'^([1-9][0-9]*)\.\s*(.*)', line_cleaned)
                if match:
                    if current_q:
                        q_blocks.append(current_q)
                    current_q = {
                        "num": int(match.group(1)),
                        "text_lines": [match.group(2)],
                        "is_yetenek": is_yetenek,
                        "is_kultur": is_kultur
                    }
                else:
                    if current_q:
                        current_q["text_lines"].append(line_cleaned)
                        
            if current_q:
                q_blocks.append(current_q)
                
            for qb in q_blocks:
                full_block_text = " ".join(qb["text_lines"])
                opt_matches = list(re.finditer(r'\b([A-E])\)\s*', full_block_text))
                if len(opt_matches) < 4:
                    continue
                    
                question_body = full_block_text[:opt_matches[0].start()]
                options = []
                for idx, m in enumerate(opt_matches):
                    start = m.end()
                    end = opt_matches[idx+1].start() if idx + 1 < len(opt_matches) else len(full_block_text)
                    options.append(clean_text(full_block_text[start:end]))
                    
                while len(options) < 5:
                    options.append("")
                    
                question_clean = clean_text(question_body)
                if is_visual_question(question_clean) or is_visual_question(" ".join(options)):
                    continue
                    
                q_num = qb["num"]
                
                if qb["is_yetenek"]:
                    if 31 <= q_num <= 60:
                        ans = yetenek_keys.get(q_num)
                        if ans:
                            matematik_questions.append({
                                "topic": "Genel Matematik",
                                "question": question_clean,
                                "options": options,
                                "correctAnswer": "ABCDE".index(ans),
                                "solution": f"ÖSYM Çıkmış Matematik Sorusu ({q_num}. Soru)."
                            })
                elif qb["is_kultur"]:
                    if 1 <= q_num <= 27:
                        ans = kultur_keys.get(q_num)
                        if ans:
                            tarih_questions.append({
                                "topic": "Genel Tarih",
                                "question": question_clean,
                                "options": options,
                                "correctAnswer": "ABCDE".index(ans),
                                "solution": f"ÖSYM Çıkmış Tarih Sorusu ({q_num}. Soru)."
                            })
                    elif 28 <= q_num <= 45:
                        ans = kultur_keys.get(q_num)
                        if ans:
                            cografya_questions.append({
                                "topic": "Genel Coğrafya",
                                "question": question_clean,
                                "options": options,
                                "correctAnswer": "ABCDE".index(ans),
                                "solution": f"ÖSYM Çıkmış Coğrafya Sorusu ({q_num}. Soru)."
                            })
                            
    return {
        "tarih": tarih_questions,
        "cografya": cografya_questions,
        "matematik": matematik_questions
    }

def process_year(year):
    search_dirs = [r"archives", r"archives/full_exams", r"archives/ai_samples"]
    
    # 1. Check for separate yetenek/kultur files
    yetenek_file = None
    kultur_file = None
    for d in search_dirs:
        y_temp = os.path.join(d, f"{year}kpsscs1genyet.pdf")
        k_temp = os.path.join(d, f"{year}kpsscs1genkul.pdf")
        if os.path.exists(y_temp) and os.path.exists(k_temp):
            yetenek_file = y_temp
            kultur_file = k_temp
            break
            
    if yetenek_file and kultur_file:
        yetenek_res = extract_questions(yetenek_file, forced_section="YETENEK")
        kultur_res = extract_questions(kultur_file, forced_section="KÜLTÜR")
        tarih = kultur_res["tarih"] if kultur_res else []
        cografya = kultur_res["cografya"] if kultur_res else []
        matematik = yetenek_res["matematik"] if yetenek_res else []
        return {"tarih": tarih, "cografya": cografya, "matematik": matematik}
        
    # 2. Check for combined files
    for d in search_dirs:
        if not os.path.exists(d):
            continue
        combined_files = [
            f for f in os.listdir(d) 
            if (f.startswith(str(year)) or f"_{year}_" in f or f"_{year}" in f or f"1_{year}" in f) and f.endswith(".pdf")
        ]
        if combined_files:
            combined_file = os.path.join(d, combined_files[0])
            return extract_questions(combined_file)
            
    return None

def main():
    dest_dir = r"src/data/kpss/exams"
    
    # Loop from 2021 down to 2006
    for year in range(2021, 2005, -1):
        res = process_year(year)
        if res:
            out_path = os.path.join(dest_dir, f"exam{year}.json")
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(res, f, ensure_ascii=False, indent=2)
            print(f"Year {year} -> Tarih: {len(res['tarih'])}, Coğrafya: {len(res['cografya'])}, Matematik: {len(res['matematik'])}")

if __name__ == "__main__":
    main()
