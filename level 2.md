# Loopify ShelfLife — Food Spoilage Prevention

Purpose: An intelligent frontend application that predicts spoilage risk before waste is created. Helps users make data-driven decisions about food consumption and minimize waste.

Tech: HTML, Tailwind CSS (CDN), JavaScript, Local Storage, Responsive Design.

How to run:
- Open `level 2.html` in your browser (no server required).

How it works:
1. Add a food item with name, purchase date, and storage method.
2. View shelf-life prediction with color-coded safety status.
3. Use the "Simulate time offset" slider to advance time and see risk levels change.
4. Mark items as consumed to track prevention behavior.

Classification system:
- Safe (>=3 days remaining)
- Consume Soon (1-3 days remaining)
- High Spoilage Risk (expired or nearly expired)

Design highlights:
- Animated gradient background for visual appeal.
- Toggle buttons for storage type selection (Room / Refrigerated / Frozen).
- Live preview updates as you fill the form.
- Simulation slider affects predictions in real-time.
- Color-coded badges with animations for risk alerts.
- Smooth transitions and micro-interactions.
- Dark/Light theme toggle with persistence.

This is a prevention-focused module designed to help users act before waste happens.
