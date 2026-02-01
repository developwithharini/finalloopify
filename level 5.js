// Fetch real data from API
async function loadData() {
    try {
        const response = await fetch('http://localhost:3000/api/impact/dashboard');
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.warn('Using fallback data:', error.message);
        return {
            metrics: {
                items_reused: 150,
                waste_diverted: 250,
                co2_saved: 50,
                reuse_transactions: 45
            },
            waste_outcomes: {
                reused: 60,
                recycled: 30,
                composted: 10
            },
            growth_data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [10, 25, 40, 55, 70, 85]
            }
        };
    }
}

// Update metrics on page
function updateMetrics(data) {
    const metrics = data.metrics;
    document.getElementById('items-reused').textContent = metrics.items_reused;
    document.getElementById('waste-diverted').textContent = metrics.waste_diverted;
    document.getElementById('food-saved').textContent = metrics.co2_saved; // CO2 saved (kg)
    document.getElementById('reuse-transactions').textContent = metrics.reuse_transactions;
}

// Render charts
function renderCharts(data) {
    const outcomes = data.waste_outcomes;
    
    // Waste Outcomes Pie Chart
    const wasteCtx = document.getElementById('waste-chart').getContext('2d');
    new Chart(wasteCtx, {
        type: 'pie',
        data: {
            labels: ['Reused', 'Recycled', 'Composted'],
            datasets: [{
                data: [outcomes.reused, outcomes.recycled, outcomes.composted],
                backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Growth Chart
    const growthCtx = document.getElementById('growth-chart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: data.growth_data.labels,
            datasets: [{
                label: 'Growth',
                data: data.growth_data.data,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: document.body.classList.contains('dark') ? '#FFFFFF' : '#374151'
                    },
                    grid: {
                        color: document.body.classList.contains('dark') ? '#4B5563' : '#E5E7EB'
                    }
                },
                x: {
                    ticks: {
                        color: document.body.classList.contains('dark') ? '#FFFFFF' : '#374151'
                    },
                    grid: {
                        color: document.body.classList.contains('dark') ? '#4B5563' : '#E5E7EB'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark') ? '#FFFFFF' : '#374151'
                    }
                }
            }
        }
    });
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark');
    const button = document.getElementById('theme-toggle');
    const icon = button.querySelector('i');
    if (document.body.classList.contains('dark')) {
        icon.className = 'fas fa-sun';
        button.innerHTML = '<i class="fas fa-sun"></i> Toggle Theme';
    } else {
        icon.className = 'fas fa-moon';
        button.innerHTML = '<i class="fas fa-moon"></i> Toggle Theme';
    }
    // Re-render charts for theme change
    const data = loadData();
    renderCharts(data);
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    const data = await loadData();
    updateMetrics(data);
    renderCharts(data);

    document.getElementById('theme-toggle').addEventListener('click', async function() {
        toggleTheme();
        const newData = await loadData();
        renderCharts(newData);
    });
});