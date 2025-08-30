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
        aiAgent: document.getElementById('aiAgent'), aiInsights: document.getElementById('aiInsights'),
        connectorTasksToggle: document.getElementById('connectorTasksToggle'), marketingContactsToggle: document.getElementById('marketingContactsToggle'),
        botSessionsContainer: document.getElementById('botSessionsContainer'), botSessionPacks: document.getElementById('botSessionPacks'),
        connectorTasksContainer: document.getElementById('connectorTasksContainer'), connectorTasks: document.getElementById('connectorTasks'), connectorTasksValue: document.getElementById('connectorTasksValue'),
        marketingContactsContainer: document.getElementById('marketingContactsContainer'), marketingContacts: document.getElementById('marketingContacts'), marketingContactsValue: document.getElementById('marketingContactsValue'),
        totalCost: document.getElementById('totalCost'), currencySymbol: document.getElementById('currencySymbol'), billingFrequency: document.getElementById('billingFrequency'),
        pricePerAgent: document.getElementById('pricePerAgent'), currencySymbolAgent: document.getElementById('currencySymbolAgent'),
        summaryBtn: document.getElementById('summaryBtn'), modal: document.getElementById('summaryModal'), closeBtn: document.querySelector('.close-button'), summaryDetails: document.getElementById('summaryDetails')
    };
    
    // --- LOGIC ---
    function updateCalculator() {
        const isAnnual = elements.billingToggle.checked;
        const billingCycle = isAnnual ? 'annual' : 'monthly';
        const numAgents = parseInt(elements.agentCount.value);
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
        if (elements.aiCopilot.checked) { totalCostUSD += copilotPricePerAgentUSD * numAgents; }

        if (elements.aiAgent.checked) {
            const numPacks = parseInt(elements.botSessionPacks.value) || 0;
            const packInfo = pricingData.addOns.packs.aiAgentSessions;
            if (numPacks > 0) { totalCostUSD += numPacks * packInfo.price; }
        }
        if (elements.connectorTasksToggle.checked) {
            const tasks = parseInt(elements.connectorTasks.value);
            const packInfo = pricingData.addOns.packs.connectorTasks;
            if (tasks > 0) { const numPacks = Math.ceil(tasks / packInfo.size); totalCostUSD += numPacks * packInfo.price; }
        }
        if (elements.marketingContactsToggle.checked) {
            const contacts = parseInt(elements.marketingContacts.value);
            const tiers = pricingData.addOns.tiered.marketingContacts;
            if (contacts > 0) { const foundTier = tiers.find(tier => contacts <= tier.limit) || tiers[tiers.length - 1]; totalCostUSD += foundTier.price; }
        }
        
        let displayTotal = totalCostUSD;
        if (isAnnual) { displayTotal *= 12; }

        let finalConvertedTotal = displayTotal * exchangeRates[currentCurrency];
        
        if (isAnnual && elements.aiCopilot.checked) {
            const totalWithoutCopilot = (totalCostUSD - (copilotPricePerAgentUSD * numAgents)) * 12 * exchangeRates[currentCurrency];
            const fixedCopilotTotal = copilotInfo.annual[currentCurrency] * numAgents * 12;
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
                <li><strong>Freddy AI Copilot:</strong> ${isChecked(elements.aiCopilot)}</li>
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
        if (input.id !== 'aiCopilot') {
            const eventType = (input.type === 'range' || input.type === 'number') ? 'input' : 'change';
            input.addEventListener(eventType, updateCalculator);
        }
    });
    
    elements.aiCopilot.addEventListener('change', () => {
        if (elements.aiCopilot.checked) { elements.aiInsights.checked = true; }
        updateCalculator();
    });
    
    elements.aiAgent.addEventListener('change', () => toggleDependentInput(elements.aiAgent, elements.botSessionsContainer, elements.botSessionPacks));
    elements.connectorTasksToggle.addEventListener('change', () => toggleDependentInput(elements.connectorTasksToggle, elements.connectorTasksContainer, elements.connectorTasks));
    elements.marketingContactsToggle.addEventListener('change', () => toggleDependentInput(elements.marketingContactsToggle, elements.marketingContactsContainer, elements.marketingContacts));
    
    elements.summaryBtn.addEventListener('click', generateSummary);
    elements.modal.style.display = 'none';
    elements.closeBtn.addEventListener('click', () => elements.modal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target == elements.modal) elements.modal.style.display = 'none'; });
    
    // --- INITIAL RUN ---
    updateCalculator();
    toggleDependentInput(elements.aiAgent, elements.botSessionsContainer, elements.botSessionPacks);
    toggleDependentInput(elements.connectorTasksToggle, elements.connectorTasksContainer, elements.connectorTasks);
    toggleDependentInput(elements.marketingContactsToggle, elements.marketingContactsContainer, elements.marketingContacts);
});
