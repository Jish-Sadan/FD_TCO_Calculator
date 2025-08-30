document.addEventListener('DOMContentLoaded', () => {
    // --- PRICING DATA STRUCTURE ---
    const pricingData = {
        "FD_Omni": { "annual": { "Growth": 29, "Pro": 59, "Enterprise": 109 }, "monthly": { "Growth": 35, "Pro": 71, "Enterprise": 131 } },
        "FD": { "annual": { "Growth": 15, "Pro": 49, "Enterprise": 79 }, "monthly": { "Growth": 18, "Pro": 59, "Enterprise": 95 } },
        "FC": { "annual": { "Growth": 15, "Pro": 39, "Enterprise": 69 }, "monthly": { "Growth": 18, "Pro": 47, "Enterprise": 83 } },
        "addOns": {
            "perAgent": { "aiCopilot": { "monthly": 35, "annual": { "USD": 29, "EUR": 29, "GBP": 23, "INR": 2399 } }, "aiInsights": 0 },
            "packs": { "aiAgentSessions": { price: 100, size: 1000 }, "connectorTasks": { price: 80, size: 5000 } },
            "tiered": { "marketingContacts": [ { limit: 5000, price: 75 }, { limit: 10000, price: 150 }, { limit: 25000, price: 400 }, { limit: 50000, price: 850 }, { limit: 100000, price: 1400 } ] }
        }
    };
    const exchangeRates = { "USD": 1, "EUR": 0.92, "GBP": 0.79, "INR": 83.5 };
    const currencySymbols = { "USD": "$", "EUR": "€", "GBP": "£", "INR": "₹" };

    // --- ELEMENT REFERENCES ---
    const elements = {
        currency: document.getElementById('currency'), product: document.getElementById('product'), plan: document.getElementById('plan'),
        billingToggle: document.getElementById('billingToggle'), billingMonthlyLabel: document.getElementById('billingMonthlyLabel'), billingAnnualLabel: document.getElementById('billingAnnualLabel'),
        agentCount: document.getElementById('agentCount'), agentCountValue: document.getElementById('agentCountValue'),
        aiCopilot: document.getElementById('aiCopilot'), copilotPriceDisplay: document.getElementById('copilotPriceDisplay'),
        copilotAgentContainer: document.getElementById('copilotAgentContainer'), // NEW
        copilotAgentCount: document.getElementById('copilotAgentCount'),       // NEW
        aiAgent: document.getElementById('aiAgent'), aiInsights: document.getElementById('aiInsights'),
        connectorTasksToggle: document.getElementById('connectorTasksToggle'), marketingContactsToggle: document.getElementById('marketingContactsToggle'),
        botSessionsContainer: document.getElementById('botSessionsContainer'), botSessionPacks: document.getElementById('botSessionPacks'),
        connectorTasksContainer: document.getElementById('connectorTasksContainer'), connectorTasks: document.getElementById('connectorTasks'), connectorTasksValue: document.getElementById('connectorTasksValue'),
        marketingContactsContainer: document.getElementById('marketingContactsContainer'), marketingContacts: document.getElementById('marketingContacts'), marketingContactsValue: document.getElementById('marketingContactsValue'),
        totalCost: document.getElementById('totalCost'), currencySymbol: document.getElementById('currencySymbol'), billingFrequency: document.getElementById('billingFrequency'),
        pricePerAgent: document.getElementById('pricePerAgent'), currencySymbolAgent: document.getElementById('currencySymbolAgent'),
        summaryBtn: document.getElementById('summaryBtn'), modal: document.getElementById('summaryModal'), closeBtn: document.querySelector('.close-button'), summaryDetails: document.getElementById('summaryDetails')
    };
    
    // --- HELPER FUNCTIONS ---

    // NEW: Populates the copilot dropdown based on the main agent count
    function populateCopilotDropdown() {
        const numAgents = parseInt(elements.agentCount.value);
        const currentSelection = parseInt(elements.copilotAgentCount.value) || 1;
        elements.copilotAgentCount.innerHTML = ''; // Clear existing options
        for (let i = 1; i <= numAgents; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            elements.copilotAgentCount.appendChild(option);
        }
        // Try to keep the previous selection if it's still valid
        elements.copilotAgentCount.value = Math.min(currentSelection, numAgents);
    }

    // --- MAIN CALCULATION LOGIC ---
    function updateCalculator() {
        const isAnnual = elements.billingToggle.checked;
        const billingCycle = isAnnual ? 'annual' : 'monthly';
        const numAgents = parseInt(elements.agentCount.value);
        const numCopilotAgents = parseInt(elements.copilotAgentCount.value) || 0; // UPDATED
        const currentCurrency = elements.currency.value;

        elements.agentCountValue.textContent = numAgents;
        elements.connectorTasksValue.textContent = parseInt(elements.connectorTasks.value).toLocaleString();
        elements.marketingContactsValue.textContent = parseInt(elements.marketingContacts.value).toLocaleString();
        elements.billingMonthlyLabel.classList.toggle('active-billing-label', !isAnnual);
        elements.billingAnnualLabel.classList.toggle('active-billing-label', isAnnual);

        const basePricePerAgentUSD = pricingData[elements.product.value][billingCycle][elements.plan.value];
        let totalCostUSD = basePricePerAgentUSD * numAgents;

        if (elements.aiInsights.checked) { totalCostUSD += pricingData.addOns.perAgent.aiInsights * numAgents; }

        const copilotInfo = pricingData.addOns.perAgent.aiCopilot;
        let copilotPricePerAgentUSD = 0;
        if (billingCycle === 'annual') {
            copilotPricePerAgentUSD = copilotInfo.annual.USD;
            const localPrice = copilotInfo.annual[currentCurrency];
            elements.copilotPriceDisplay.textContent = `${currencySymbols[currentCurrency]}${localPrice.toLocaleString()} / agent`;
        } else {
            copilotPricePerAgentUSD = copilotInfo.monthly;
            const localPrice = copilotPricePerAgentUSD * exchangeRates[currentCurrency];
            elements.copilotPriceDisplay.textContent = `${currencySymbols[currentCurrency]}${localPrice.toFixed(0)} / agent`;
        }
        if (elements.aiCopilot.checked) {
            totalCostUSD += copilotPricePerAgentUSD * numCopilotAgents; // UPDATED
        }

        if (elements.aiAgent.checked) { /* ... */ }
        if (elements.connectorTasksToggle.checked) { /* ... */ }
        if (elements.marketingContactsToggle.checked) { /* ... */ }
        
        let displayTotal = totalCostUSD;
        if (isAnnual) { displayTotal *= 12; }

        let finalConvertedTotal = displayTotal * exchangeRates[currentCurrency];
        
        if (isAnnual && elements.aiCopilot.checked) {
            const totalWithoutCopilot = (totalCostUSD - (copilotPricePerAgentUSD * numCopilotAgents)) * 12 * exchangeRates[currentCurrency]; // UPDATED
            const fixedCopilotTotal = copilotInfo.annual[currentCurrency] * numCopilotAgents * 12; // UPDATED
            finalConvertedTotal = totalWithoutCopilot + fixedCopilotTotal;
        }
        
        elements.currencySymbol.textContent = currencySymbols[currentCurrency];
        elements.totalCost.textContent = finalConvertedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const convertedPricePerAgent = basePricePerAgentUSD * exchangeRates[currentCurrency];
        elements.currencySymbolAgent.textContent = currencySymbols[currentCurrency];
        elements.pricePerAgent.textContent = convertedPricePerAgent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    function generateSummary() {
        const getSelectedText = (el) => el.options[el.selectedIndex].text;
        const isChecked = (el) => el.checked ? 'Yes' : 'No';
        const numPacks = parseInt(elements.botSessionPacks.value) || 0;
        const packSize = pricingData.addOns.packs.aiAgentSessions.size;
        
        const summary = `
            <ul>
                <li><strong>Product:</strong> ${getSelectedText(elements.product)}</li>
                <li><strong>Plan:</strong> ${getSelectedText(elements.plan)}</li>
                <li><strong>Billing:</strong> ${elements.billingToggle.checked ? 'Annual' : 'Monthly'}</li>
                <li><strong>Currency:</strong> ${elements.currency.value}</li>
                <br>
                <li><strong>Base Price:</strong> ${elements.currencySymbolAgent.textContent}${elements.pricePerAgent.textContent} / agent</li>
                <li><strong>Agent Count:</strong> ${elements.agentCount.value}</li>
                <br>
                <li><strong>Freddy AI Copilot:</strong> ${isChecked(elements.aiCopilot)} (${elements.copilotAgentCount.value} licenses)</li>
                <li><strong>Freddy AI Insights:</strong> ${isChecked(elements.aiInsights)}</li>
                <li><strong>AI Agent Sessions:</strong> ${isChecked(elements.aiAgent)} (${numPacks} packs / ${(numPacks * packSize).toLocaleString()} sessions)</li>
                <li><strong>Connector Tasks:</strong> ${isChecked(elements.connectorTasksToggle)} (${parseInt(elements.connectorTasks.value).toLocaleString()} tasks)</li>
                <li><strong>Marketing Contacts:</strong> ${isChecked(elements.marketingContactsToggle)} (${parseInt(elements.marketingContacts.value).toLocaleString()} contacts)</li>
                <br>
                <li><strong>Final Cost:</strong> ${elements.currencySymbol.textContent}${elements.totalCost.textContent} ${elements.billingFrequency.textContent}</li>
            </ul>
        `;
        elements.summaryDetails.innerHTML = summary;
        elements.modal.style.display = 'block';
    }

    function toggleDependentInput(checkbox, container, numericInput) {
        container.classList.toggle('hidden', !checkbox.checked);
        if (!checkbox.checked && numericInput) { numericInput.value = 0; }
        updateCalculator();
    }

    // --- EVENT LISTENERS ---
    const allInputs = document.querySelectorAll('.calculator select, .calculator input');
    allInputs.forEach(input => {
        if (!['aiCopilot', 'agentCount'].includes(input.id)) {
            const eventType = (input.type === 'range' || input.type === 'number') ? 'input' : 'change';
            input.addEventListener(eventType, updateCalculator);
        }
    });

    elements.agentCount.addEventListener('input', () => {
        populateCopilotDropdown();
        updateCalculator();
    });
    
    elements.aiCopilot.addEventListener('change', () => {
        if (elements.aiCopilot.checked) { elements.aiInsights.checked = true; }
        toggleDependentInput(elements.aiCopilot, elements.copilotAgentContainer, elements.copilotAgentCount);
    });
    
    elements.aiAgent.addEventListener('change', () => toggleDependentInput(elements.aiAgent, elements.botSessionsContainer, elements.botSessionPacks));
    elements.connectorTasksToggle.addEventListener('change', () => toggleDependentInput(elements.connectorTasksToggle, elements.connectorTasksContainer, elements.connectorTasks));
    elements.marketingContactsToggle.addEventListener('change', () => toggleDependentInput(elements.marketingContactsToggle, elements.marketingContactsContainer, elements.marketingContacts));
    
    elements.summaryBtn.addEventListener('click', generateSummary);
    elements.modal.style.display = 'none';
    elements.closeBtn.addEventListener('click', () => elements.modal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target == elements.modal) elements.modal.style.display = 'none'; });
    
    // --- INITIAL RUN ---
    populateCopilotDropdown();
    updateCalculator();
    toggleDependentInput(elements.aiCopilot, elements.copilotAgentContainer, null);
    toggleDependentInput(elements.aiAgent, elements.botSessionsContainer, elements.botSessionPacks);
    toggleDependentInput(elements.connectorTasksToggle, elements.connectorTasksContainer, elements.connectorTasks);
    toggleDependentInput(elements.marketingContactsToggle, elements.marketingContactsContainer, elements.marketingContacts);
});
