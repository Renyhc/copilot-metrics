const mockMetricsData = [
    {
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
        },
        copilot_ide_chat: {
            editors: [{
                name: 'VS Code',
                total_engaged_users: 30,
                models: [{
                    name: 'default',
                    total_chats: 500,
                    total_chat_copy_events: 300,
                    total_chat_insertion_events: 200
                }]
            }]
        }
    },
    {
        date: '2024-02-02',
        total_active_users: 120,
        total_engaged_users: 60,
        copilot_ide_code_completions: {
            editors: [{
                name: 'VS Code',
                total_engaged_users: 55,
                models: [{
                    name: 'default',
                    languages: [{
                        name: 'JavaScript',
                        total_code_acceptances: 1100,
                        total_code_suggestions: 1300,
                        total_code_lines_accepted: 3300,
                        total_code_lines_suggested: 3800
                    }]
                }]
            }]
        },
        copilot_ide_chat: {
            editors: [{
                name: 'VS Code',
                total_engaged_users: 35,
                models: [{
                    name: 'default',
                    total_chats: 550,
                    total_chat_copy_events: 330,
                    total_chat_insertion_events: 220
                }]
            }]
        }
    }
];

module.exports = { mockMetricsData };
