// generate-site.js

const fs = require('fs');
const path = require('path');

const talksData = [
    {
        title: "Introduction to AI in Web Development",
        speakers: ["Alice Johnson"],
        category: ["AI", "Web Development", "Frontend"],
        duration: 60, // minutes
        description: "Explore how AI is revolutionizing web development, from intelligent user interfaces to automated code generation."
    },
    {
        title: "Mastering React Hooks",
        speakers: ["Bob Williams", "Carol Davis"],
        category: ["Frontend", "React", "JavaScript"],
        duration: 60,
        description: "Dive deep into React Hooks, understanding their power and how to build efficient and reusable components."
    },
    {
        title: "Node.js Performance Optimization",
        speakers: ["David Lee"],
        category: ["Backend", "Node.js", "Performance"],
        duration: 60,
        description: "Learn advanced techniques to optimize your Node.js applications for maximum performance and scalability."
    },
    {
        title: "Containerization with Docker and Kubernetes",
        speakers: ["Eve Martinez", "Frank White"],
        category: ["DevOps", "Cloud", "Containers"],
        duration: 60,
        description: "Understand the fundamentals of Docker and Kubernetes for deploying and managing modern applications."
    },
    {
        title: "Building Scalable Microservices with Go",
        speakers: ["Grace Taylor"],
        category: ["Backend", "Go", "Microservices"],
        duration: 60,
        description: "Discover how to design and implement highly scalable microservices using the Go programming language."
    },
    {
        title: "Security Best Practices for Web Applications",
        speakers: ["Henry Clark"],
        category: ["Security", "Web Development"],
        duration: 60,
        description: "A comprehensive guide to securing your web applications against common vulnerabilities and threats."
    }
];

// Event schedule calculation
const EVENT_START_HOUR = 10; // 10:00 AM
const TALK_DURATION_MINUTES = 60;
const TRANSITION_MINUTES = 10;
const LUNCH_BREAK_DURATION_MINUTES = 60; // 1 hour

let currentHour = EVENT_START_HOUR;
let currentMinute = 0;

const schedule = [];

// Helper to format time
function formatTime(hour, minute) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? '0' + minute : minute;
    return `${displayHour}:${displayMinute} ${period}`;
}

// Add talks and transitions
for (let i = 0; i < talksData.length; i++) {
    const talk = talksData[i];
    const startTime = formatTime(currentHour, currentMinute);

    currentMinute += TALK_DURATION_MINUTES;
    if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
    }

    const endTime = formatTime(currentHour, currentMinute);

    schedule.push({
        type: 'talk',
        ...talk,
        startTime,
        endTime
    });

    // Add transition after each talk, except the last one
    if (i < talksData.length - 1) {
        currentMinute += TRANSITION_MINUTES;
        if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute %= 60;
        }

        // Insert lunch break after the 3rd talk (index 2)
        if (i === 2) {
            const lunchStartTime = formatTime(currentHour, currentMinute);
            currentMinute += LUNCH_BREAK_DURATION_MINUTES;
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute %= 60;
            }
            const lunchEndTime = formatTime(currentHour, currentMinute);
            schedule.push({
                type: 'break',
                title: 'Lunch Break',
                startTime: lunchStartTime,
                endTime: lunchEndTime,
                description: 'Enjoy a delicious lunch!',
                category: ['Break']
            });

             currentMinute += TRANSITION_MINUTES; // Add transition after lunch too
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute %= 60;
            }
        }
    }
}


const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Event Schedule</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 20px auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .search-container {
            margin-bottom: 30px;
            text-align: center;
        }
        .search-container input {
            width: 70%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            max-width: 400px;
        }
        .schedule-item {
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 6px;
            margin-bottom: 20px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .schedule-item:hover {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        .schedule-item.break {
            background-color: #e0f2f7; /* Light blue for breaks */
            border-color: #b2ebf2;
            text-align: center;
            font-weight: bold;
        }
        .item-time {
            font-size: 1.1em;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
            display: block;
        }
        .item-title {
            font-size: 1.5em;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        .item-speakers {
            font-style: italic;
            color: #7f8c8d;
            margin-bottom: 10px;
        }
        .item-category {
            font-size: 0.9em;
            color: #555;
            margin-bottom: 15px;
        }
        .item-description {
            line-height: 1.6;
            color: #666;
        }
        .no-results {
            text-align: center;
            color: #e74c3c;
            font-size: 1.2em;
            margin-top: 50px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>1-Day Tech Event Schedule</h1>

        <div class="search-container">
            <input type="text" id="categorySearch" placeholder="Search by category (e.g., Frontend, AI, Backend)">
        </div>

        <div id="scheduleList">
            <!-- Schedule items will be rendered here by JavaScript -->
        </div>
    </div>

    <script>
        const scheduleData = ${JSON.stringify(schedule, null, 2)};

        function renderSchedule(filterCategory = '') {
            const scheduleList = document.getElementById('scheduleList');
            scheduleList.innerHTML = ''; // Clear previous results

            let hasResults = false;

            scheduleData.forEach(item => {
                if (filterCategory === '' || (item.category && item.category.some(cat => cat.toLowerCase().includes(filterCategory.toLowerCase())))) {
                    hasResults = true;
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('schedule-item');
                    if (item.type === 'break') {
                        itemDiv.classList.add('break');
                        itemDiv.innerHTML = '<span class="item-time">' + item.startTime + ' - ' + item.endTime + '</span>' +
                                            '<div class="item-title">' + item.title + '</div>' +
                                            '<div class="item-description">' + item.description + '</div>';
                    } else {
                        itemDiv.innerHTML = '<span class="item-time">' + item.startTime + ' - ' + item.endTime + '</span>' +
                                            '<div class="item-title">' + item.title + '</div>' +
                                            '<div class="item-speakers">' + item.speakers.join(' and ') + '</div>' +
                                            '<div class="item-category">Categories: ' + item.category.join(', ') + '</div>' +
                                            '<div class="item-description">' + item.description + '</div>';
                    }
                    scheduleList.appendChild(itemDiv);
                }
            });

            if (!hasResults) {
                scheduleList.innerHTML = '<div class="no-results">No talks found for this category.</div>';
            }
        }

        // Initial render
        renderSchedule();

        // Search functionality
        document.getElementById('categorySearch').addEventListener('keyup', (event) => {
            renderSchedule(event.target.value);
        });
    </script>
</body>
</html>
`;