const { Chart } = require('chart.js/auto');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

class ChartService {
    async generateLineChart(chartData, options = {}) {
        try {
            // Crear canvas
            const width = options.width || 800;
            const height = options.height || 400;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Configurar el gráfico
            const chart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: false,
                    animation: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: options.title || 'Métricas de Copilot'
                        },
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    }
                }
            });

            // Asegurar que existe el directorio de exportación
            const exportDir = path.join(__dirname, '../exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Generar nombre de archivo único
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `copilot-metrics-${timestamp}.png`;
            const filePath = path.join(exportDir, fileName);

            // Exportar el gráfico como PNG
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filePath, buffer);

            return {
                success: true,
                filePath,
                fileName
            };
        } catch (error) {
            throw new Error(`Error generando gráfico: ${error.message}`);
        }
    }
}

module.exports = new ChartService();
