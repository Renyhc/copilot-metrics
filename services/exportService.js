const fs = require('fs');
const path = require('path');

class ExportService {
    async exportMetricsToJson(data, type) {
        try {
            // Asegurar que existe el directorio de exportación
            const exportDir = path.join(__dirname, '../exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Generar nombre de archivo único con fecha
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0];
            const timestamp = date.toISOString().replace(/[:.]/g, '-');
            const fileName = `copilot-metrics-${type}-${formattedDate}-${timestamp}.json`;
            const filePath = path.join(exportDir, fileName);

            // Exportar los datos como JSON
            await fs.promises.writeFile(
                filePath, 
                JSON.stringify(data, null, 2),
                'utf8'
            );

            return {
                success: true,
                filePath,
                fileName
            };
        } catch (error) {
            throw new Error(`Error exportando métricas a JSON: ${error.message}`);
        }
    }
}

module.exports = new ExportService();
