export const initialPolls = [
    {
        id: 'a82kf91',
        question: 'Which programming language do you prefer?',
        createdAt: '2026-09-17',
        status: 'active',
        allowOneVote: true,
        options: [
            { id: 'o1', label: 'Java', votes: 54 },
            { id: 'o2', label: 'Python', votes: 40 },
            { id: 'o3', label: 'JavaScript', votes: 24 },
            { id: 'o4', label: 'C++', votes: 10 }
        ]
    },
    {
        id: 'b31xq44',
        question: 'What should we build next?',
        createdAt: '2026-09-11',
        status: 'closed',
        allowOneVote: true,
        options: [
            { id: 'o1', label: 'Mobile app', votes: 34 },
            { id: 'o2', label: 'Public API', votes: 28 },
            { id: 'o3', label: 'Team workspaces', votes: 14 }
        ]
    },
    {
        id: 'c77mm02',
        question: 'Best time for the weekly team standup?',
        createdAt: '2026-09-14',
        status: 'active',
        allowOneVote: true,
        options: [
            { id: 'o1', label: '9:00 AM', votes: 26 },
            { id: 'o2', label: '11:00 AM', votes: 21 },
            { id: 'o3', label: '4:00 PM', votes: 15 }
        ]
    },
    {
        id: 'd12pk88',
        question: 'Which improvement matters most to you?',
        createdAt: '2026-09-08',
        status: 'active',
        allowOneVote: false,
        options: [
            { id: 'o1', label: 'Faster live updates', votes: 61 },
            { id: 'o2', label: 'Better result charts', votes: 44 },
            { id: 'o3', label: 'Poll templates', votes: 22 },
            { id: 'o4', label: 'CSV export', votes: 16 }
        ]
    },
    {
        id: 'e55rt10',
        question: 'How did you hear about LivePoll?',
        createdAt: '2026-08-29',
        status: 'closed',
        allowOneVote: true,
        options: [
            { id: 'o1', label: 'A colleague', votes: 31 },
            { id: 'o2', label: 'Search', votes: 25 },
            { id: 'o3', label: 'Social media', votes: 21 }
        ]
    }
];
export const dashboardStats = {
    totalPolls: 12,
    totalVotes: 486,
    activePolls: 4
};
export const currentUser = {
    name: 'Surya Menon',
    firstName: 'Surya',
    email: 'surya@livepoll.app',
    initials: 'SM'
};
export const heroPoll = {
    question: 'Which programming language do you prefer?',
    options: [
        { id: 'o1', label: 'Java', votes: 54 },
        { id: 'o2', label: 'Python', votes: 40 },
        { id: 'o3', label: 'JavaScript', votes: 24 },
        { id: 'o4', label: 'C++', votes: 10 }
    ]
};
