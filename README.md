# FD_TCO_Calculator

A dynamic and interactive TCO (Total Cost of Ownership) calculator designed to help potential customers estimate the cost of a SaaS subscription. Built with vanilla HTML, CSS, and JavaScript, it's lightweight, easy to configure, and perfect for hosting on static sites like GitHub Pages.

[Image of the SaaS TCO Calculator interface]

### ✨ [Live Demo](https://your-username.github.io/your-repo-name/)

*(Replace the link above with your actual GitHub Pages URL after deployment.)*

## Key Features

* **Dynamic Cost Calculation:** All costs update in real-time as you adjust the options.
* **Complex Pricing Models:** Supports various pricing structures:
    * Per-agent/user pricing.
    * Pack-based pricing (e.g., AI sessions, tasks).
    * Tiered pricing (e.g., marketing contacts).
* **Flexible Billing Cycles:** Toggle between monthly and annual plans, with specific pricing rules for each.
* **Multi-Currency Support:** Instantly convert estimates between USD, EUR, GBP, and INR.
* **Interactive UI:** Modern, responsive design featuring sliders and custom toggle switches.
* **Conditional Logic:** Add-on options (like Bot Session packs) appear only when needed.
* **Printable Summary:** Generate a clean, professional summary of the selected configuration in a pop-up modal.

## 🛠️ Technology Stack

* **HTML5:** For the structure and content.
* **CSS3:** For all custom styling, toggles, and responsive design.
* **Vanilla JavaScript (ES6):** For all the calculation logic, interactivity, and DOM manipulation. No frameworks or libraries are needed.

## 🚀 How to Use

### Deployment

This project is designed to be hosted on a static web host like **GitHub Pages**.

1.  Push all the files (`index.html`, `style.css`, `script.js`) to a new GitHub repository.
2.  In your repository's settings, navigate to the **Pages** section.
3.  Choose the `main` branch as your source and click **Save**.
4.  Your TCO calculator will be live at the provided URL within a few minutes.

### Local Development

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```
2.  Navigate to the project directory:
    ```bash
    cd your-repo-name
    ```
3.  Open the `index.html` file in your web browser.

## ⚙️ Configuration

All pricing and product details are managed in a single JavaScript object at the top of the `script.js` file. To customize the calculator for your own products, simply edit the `pricingData` object.

```javascript
// Located at the top of script.js
const pricingData = {
    "FD_Omni": { // Product ID
        "annual": { "Growth": 29, "Pro": 59, "Enterprise": 109 }, // Annual prices per plan
        "monthly": { "Growth": 35, "Pro": 71, "Enterprise": 131 } // Monthly prices per plan
    },
    // ... more products
    "addOns": {
        "perAgent": {
            "aiCopilot": { /* ... */ } // Per-agent add-ons
        },
        "packs": {
             "aiAgentSessions": { price: 100, size: 1000 } // Pack-based add-ons
        },
        "tiered": {
            "marketingContacts": [ /* ... */ ] // Tiered add-ons
        }
    }
};
```

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
