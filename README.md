# DocuShield AI 
 
> AI-Powered Document Tampering & Risk Analysis System 
 
DocuShield AI is a web-based document analysis platform designed to detect possible tampering, modifications, and suspicious inconsistencies in identity documents and certificates. 
 
The system analyzes uploaded images and PDF documents, identifies suspicious regions, assigns a **Low, Medium, or High Risk** level, and visually highlights potentially modified areas. 
 
It also provides a **Document Comparison** feature to compare an original document with a modified document and identify differences between them. 
 
--- 
## 🚀 Live Demo

🔗 **[DocuShield AI – Live Demo](https://docushield-ai-t1gl.onrender.com)**
 
## 🎯 Purpose 
 
Digital documents and certificates can be modified using image-editing tools, making manual verification difficult. 
 
DocuShield AI provides an automated first-level analysis by examining: 
 
- OCR and extracted text 
- Layout and alignment 
- Font and formatting consistency 
- Image regions 
- Structural patterns 
- Possible editing artifacts 
- Differences between documents 
 
The goal is to make preliminary document verification faster, simpler, and more visual. 
 
--- 
 
## ✨ Key Features 
 
### 🔍 Universal Document Analysis 
 
- Upload images and PDF documents 
- Automatic document classification 
- OCR-based text extraction 
- Image and document forensic analysis 
- Detect suspicious visual and textual inconsistencies 
- Generate an overall risk score 
- Classify results as: 
  - 🟢 Low Risk 
  - 🟡 Medium Risk 
  - 🔴 High Risk 
- Highlight suspicious or modified regions 
- View detailed analysis results 
 
### 🔄 Document Comparison 
 
Upload an **Original/Reference Document** and a **Modified/Suspected Document**. 
 
The system identifies: 
 
- Changed regions 
- Text differences 
- Layout differences 
- Image inconsistencies 
- Suspicious modifications 
- Overall similarity 
 
Detected discrepancy regions are visually highlighted for easier comparison. 
 
### 👤 User Features 
 
- User registration and login 
- Secure password handling 
- User dashboard 
- Scan history 
- Analysis reports 
- Profile and settings 
- Delete unwanted history records 
 
--- 
 
## 🛠️ Tech Stack 
 
**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Motion  
 
**Backend:** Node.js, Express.js, TypeScript  
 
**AI & Analysis:** Google Gemini API, OCR, Image Forensics, Document Classification, Image Comparison, Risk Analysis  
 
**Database & Security:** SQLite, JWT Authentication, bcryptjs  
 
**File Processing:** Multer, Sharp, PDF-Lib, jsQR  
 
--- 
 
## 📊 Risk Analysis 
 
DocuShield AI provides three simple risk levels: 
 
**🟢 Low Risk**   
Little or no significant suspicious evidence is detected. 
 
**🟡 Medium Risk**   
Some inconsistencies are detected and may require further verification. 
 
**🔴 High Risk**   
Significant suspicious regions or multiple inconsistencies are detected. 
 
The risk result is intended to assist with preliminary review and is not a definitive authenticity decision. 
 
--- 
 
## 🧠 Analysis Workflow 
 
```text 
Document Upload 
      ↓ 
File Validation 
      ↓ 
Document Classification 
      ↓ 
OCR / Text Extraction 
      ↓ 
Image & Layout Analysis 
      ↓ 
Forensic Analysis 
      ↓ 
Anomaly Detection 
      ↓ 
Risk Calculation 
      ↓ 
Suspicious Region Highlighting 
      ↓ 
Analysis Results
````

### Comparison Workflow

```text
Original Document + Modified Document
              ↓
       Document Comparison
              ↓
      Difference Detection
              ↓
    Discrepancy Highlighting
              ↓
    Similarity & Risk Analysis
              ↓
       Comparison Results
```

---

## 🌐 Live Demo

**Live Application:**

🔗 **[DocuShield AI – Live Demo](https://docushield-ai-t1gl.onrender.com)**

**GitHub:** [https://github.com/Jasmine-sd/docushield-ai](https://github.com/Jasmine-sd/docushield-ai)

---

## ⚠️ Disclaimer

DocuShield AI is a prototype designed for preliminary document analysis and research purposes. Its results should not be treated as definitive proof that a document is genuine or fraudulent. Real-world verification should always involve appropriate human or official verification.

---

## 👩‍💻 Developer

**Jasmine-sd**
B.Tech – Computer Science & Engineering

```
```
