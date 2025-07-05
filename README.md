# 🤖 Personal Finance AI - FMEA Analysis Tool

A professional **Failure Mode and Effects Analysis (FMEA)** tool designed for Personal Finance Management systems powered by AI, featuring interactive fault tree visualization, built with modern web technologies and Apple-style design.

![FMEA Tool Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Performance](https://img.shields.io/badge/Performance-Optimized-orange) ![Industry](https://img.shields.io/badge/Industry-FinTech_AI-gold) ![Demo](https://img.shields.io/badge/Data-Demo_Only-orange)

## ✨ Features

### 📊 **FMEA Analysis**
- **Component Management**: Add, edit, and organize system components
- **Failure Mode Analysis**: Comprehensive failure analysis with severity, occurrence, and detection ratings
- **RPN Calculation**: Automatic Risk Priority Number calculation with visual indicators
- **Results Dashboard**: Sortable tables with color-coded risk levels

### 🌳 **Interactive Fault Tree**
- **Auto-Generation**: Automatically creates fault trees from FMEA data
- **Canvas-Based Rendering**: High-performance 60fps visualization
- **Interactive Controls**: Zoom, pan, expand/collapse nodes
- **Risk Visualization**: Color-coded nodes and connections based on RPN values
- **Failure Propagation**: Visual representation of how failures flow through systems

### 🎨 **Apple-Style Design**
- **Frosted Glass Effects**: Beautiful translucent backgrounds with backdrop blur
- **Smooth Animations**: Buttery-smooth transitions and micro-interactions
- **Light/Dark Themes**: Seamless theme switching
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices

## 🚀 Quick Start

### **Option 1: Direct Download**
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start analyzing! Sample data is pre-loaded for demonstration

### **Option 2: Local Server**
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000`

## 📱 Usage

### **1. Component Management**
- Navigate to the **Components** tab
- Add system components that you want to analyze
- Manage your component library

### **2. FMEA Analysis**
- Go to the **Analysis** tab
- Select a component and describe its function
- Define failure modes, effects, and causes
- Rate severity (1-10), occurrence (1-10), and detection (1-10)
- RPN is automatically calculated

### **3. Results Review**
- Check the **Results** tab for analysis summary
- Sort by RPN to prioritize high-risk items
- Export data for reporting

### **4. Fault Tree Visualization**
- Visit the **Fault Tree** tab
- Interactive tree automatically generates from your FMEA data
- Use zoom/pan controls for navigation
- Click nodes to expand/collapse branches

## 🛠️ Technical Details

### **Performance Optimized**
- **Canvas Rendering**: Hardware-accelerated graphics for smooth interactions
- **Efficient Algorithms**: Optimized layout and hit-testing
- **Memory Management**: Proper cleanup and resource management
- **60fps Animations**: Smooth user experience

### **Technologies Used**
- **HTML5 Canvas**: High-performance graphics rendering
- **Vanilla JavaScript**: No framework dependencies, fast loading
- **CSS3**: Advanced styling with backdrop-filter effects
- **Local Storage**: Data persistence between sessions

### **Browser Support**
- ✅ Chrome 88+
- ✅ Firefox 94+
- ✅ Safari 14+
- ✅ Edge 88+

## 📊 Sample Data

⚠️ **IMPORTANT**: All data shown is for demonstration purposes only and does not represent real financial information or actual AI system failures.

The tool comes with pre-loaded Personal Finance AI examples:
- **AI Expense Categorization**: Machine learning transaction classification failures
- **Smart Budget Advisor**: AI-powered budget recommendation issues
- **Fraud Detection AI**: Real-time suspicious activity detection problems
- **Investment Recommendation Engine**: AI-driven portfolio suggestion risks
- **Credit Score Predictor**: AI analytics prediction accuracy issues

## 🎯 Use Cases

- **FinTech AI Systems**: AI-powered personal finance application analysis
- **Machine Learning Models**: Financial AI model reliability assessment
- **Robo-Advisors**: Automated investment platform risk analysis
- **AI Fraud Detection**: Machine learning security system evaluation
- **Personal Finance Apps**: AI-driven budgeting and expense tracking analysis
- **Credit Scoring AI**: Predictive model accuracy and bias assessment
- **Regulatory Compliance**: AI system risk management for financial regulations

## 🔧 Customization

The tool is designed to be easily customizable:
- Modify RPN calculation formulas in `script.js`
- Adjust visual themes in `styles.css`
- Extend fault tree algorithms in `fault-tree.js`

## 📄 License

MIT License - feel free to use in commercial and personal projects.

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## ⚠️ Data Disclaimer

**All sample data in this tool is fictional and for demonstration purposes only.** The Personal Finance AI scenarios, failure modes, and risk assessments shown do not represent real financial systems, actual AI failures, or genuine risk data. This tool is designed for educational and demonstration purposes to showcase FMEA methodology in the context of AI-powered financial applications.

## 🌟 Acknowledgments

- Inspired by professional FMEA methodologies for AI systems
- Apple Human Interface Guidelines for design principles
- Modern web performance best practices
- AI/ML risk management frameworks and standards

---

**Built with ❤️ for AI engineers, FinTech professionals, and personal finance system developers**
