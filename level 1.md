# Loopify WasteLens — Professional Waste Classification

A professional-grade, real-time waste classification system powered by machine learning. Loopify analyzes waste items through camera feeds, gallery uploads, or file uploads and provides instant classification with high-confidence predictions.

## Features

### Input Methods (All Supported)
- **Real-time Camera**: Live preview with instant frame capture
- **Gallery Upload**: Select images from device storage
- **File Upload**: Browse and upload image files from your system
- **Seamless Switching**: Switch between input modes effortlessly

### Classification Output
- **Waste Category**: Compostable, Recyclable, Reusable, or Landfill
- **Confidence Score**: 70-99% classification confidence with visual indicator
- **Disposal Guidance**: Actionable, location-aware disposal instructions
- **Environmental Impact**: Summary of the environmental benefits of proper disposal

### ML Model Features
- **Feature Extraction**: Analyzes color distribution, texture, and edge detection
- **Preprocessing**: Automatic image normalization and resizing (224x224)
- **SVM Classification**: Support Vector Machine-inspired decision boundaries
- **Explainability**: Clear reasoning for every classification decision

## How to Use

### Mobile & Desktop
1. Open `level1.html` in your browser
2. Choose an input method: Camera, Upload, or File
3. Provide an image of waste
4. Click "Scan Waste"
5. View instant classification results with guidance

### Camera
- Press "Start Camera" to enable live video feed
- Position waste item in frame
- Click "Capture Frame" to freeze and classify

### Upload / File
- Click to select image from gallery or file system
- System automatically detects and classifies
- Results appear instantly

## Classification Categories

### 🌱 Compostable
Food scraps, organic materials, yard waste. Check local compost programs for accepted items.

### ♻️ Recyclable
Paper, cardboard, glass, metal, plastics. Rinse and sort per local guidelines.

### 🔁 Reusable
Items in good condition suitable for donation or reuse centers.

### 🗑️ Landfill
Items that cannot be recycled. Dispose in regular waste or hazardous waste if applicable.