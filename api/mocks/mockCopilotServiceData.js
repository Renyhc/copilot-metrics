const mockApiResponse = {
    data: {
        date: '2024-02-01',
        total_active_users: 100,
        total_engaged_users: 50,
        copilot_ide_code_completions: {
            editors: [{
                name: 'VS Code',
                total_engaged_users: 45,
                models: [{
                    name: 'default',
                    languages: [{
                        name: 'JavaScript',
                        total_code_acceptances: 1000,
                        total_code_suggestions: 1200,
                        total_code_lines_accepted: 3000,
                        total_code_lines_suggested: 3500
                    }]
                }]
            }]
        }
    }
};

const mockTransformedUsers = {
    labels: ['01/02/2024'],
    activeUsers: [100],
    engagedUsers: [50]
};

const mockIdeActivity = {
    labels: ['2024-02-01'],
    accepted: [1000],
    suggestions: [1200],
    average: ['83.33']
};

const mockChartResult = {
    usersChart: {
        labels: ['01/02/2024'],
        datasets: [{
            label: 'Usuarios Activos',
            data: [100]
        }]
    },
    activityIdeChart: {
        labels: ['2024-02-01'],
        datasets: [{
            label: 'Aceptación Diaria',
            data: [1000]
        }]
    }
};

module.exports = {
    mockApiResponse,
    mockTransformedUsers,
    mockIdeActivity,
    mockChartResult
};
