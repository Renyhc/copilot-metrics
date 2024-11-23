const mockChartResult = {
  usersChart: {
    chartType: "bar",
    title: "Copilot Users Engagement",
    data: {
      labels: ["2024-11-20", "2024-11-21", "2024-11-22", "2024-11-23"],
      datasets: [
        {
          label: "Active Users",
          data: [1400, 1450, 1480, 1500],
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        },
        {
          label: "Engaged Users",
          data: [700, 720, 740, 750],
          backgroundColor: "rgba(54, 162, 235, 0.6)"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Copilot Users Engagement Over Time"
        }
      }
    },
    filePath: "/exports/charts/usersChart-2024-11-23.png"
  }
};

module.exports = { mockChartResult }; 