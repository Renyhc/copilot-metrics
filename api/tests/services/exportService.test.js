const fs = require('fs');
const path = require('path');
const ExportService = require('../../services/exportService');
const sinon = require('sinon');

describe('ExportService', () => {
  let writeFileStub;
  let mkdirSyncStub;
  let existsSyncStub;

  beforeEach(() => {
    writeFileStub = sinon.stub(fs.promises, 'writeFile').resolves();
    mkdirSyncStub = sinon.stub(fs, 'mkdirSync').returns();
    existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('debe exportar métricas a JSON correctamente', async () => {
    const data = { key: 'value' };
    const type = 'test-type';

    // Fijar la fecha a un valor específico (por ejemplo, 23 de noviembre de 2024)
    const fixedDate = new Date('2024-11-23T12:00:00Z');
    const clock = sinon.useFakeTimers(fixedDate.getTime());

    const result = await ExportService.exportMetricsToJson(data, type);

     // Construir el expectedFileName utilizando la fecha fija
     const expectedDatePart = fixedDate.toISOString().split('T')[0]; // '2024-11-23'
     const expectedFileName = `copilot-metrics-${type}-${expectedDatePart}-${fixedDate.toISOString().replace(/[:.]/g, '-')}.json`;
     const expectedFilePath = path.join(__dirname, '../../../exports', expectedFileName);

     // Verificar que mkdirSync fue llamado con una ruta que incluya 'exports' y con { recursive: true }
     sinon.assert.calledWith(mkdirSyncStub, sinon.match((val) => val.includes('exports')), { recursive: true });
     sinon.assert.calledWith(mkdirSyncStub, path.join(__dirname, '../../../exports'), { recursive: true });

     // Verificar que writeFileStub fue llamado con el archivo esperado
     sinon.assert.calledWith(writeFileStub, expectedFilePath, JSON.stringify(data, null, 2), 'utf8');
 
     // Verificar las propiedades del resultado
     expect(result).toHaveProperty('success', true);
     expect(result).toHaveProperty('filePath', expectedFilePath);
 
     // Verificar que fileName comienza con el prefijo esperado hasta la fecha
     expect(result.fileName).toMatch(/^copilot-metrics-test-type-2024-11-23-/);
 
     // Restaurar el reloj original
     clock.restore();
  });

  it('debe manejar errores durante la exportación a JSON', async () => {
    writeFileStub.rejects(new Error('Error de escritura'));

    const data = { key: 'value' };
    const type = 'test-type';

    await expect(ExportService.exportMetricsToJson(data, type)).rejects.toThrow('Error exportando métricas a JSON: Error de escritura');
  });

  it('debe exportar métricas correctamente cuando el directorio de exportación ya existe', async () => {
    const data = { key: 'value' };
    const type = 'test-type';

    // Simular que el directorio ya existe
    existsSyncStub.withArgs(path.join(__dirname, '../../exports')).returns(true);

    // Fijar la fecha a un valor específico
    const fixedDate = new Date('2024-11-23T12:00:00Z');
    const clock = sinon.useFakeTimers(fixedDate.getTime());

    const result = await ExportService.exportMetricsToJson(data, type);

    const expectedDatePart = fixedDate.toISOString().split('T')[0]; // '2024-11-23'
    const expectedFileName = `copilot-metrics-${type}-${expectedDatePart}-${fixedDate.toISOString().replace(/[:.]/g, '-')}.json`;
    const expectedFilePath = path.join(__dirname, '../../../exports', expectedFileName);

    // Verificar que mkdirSync no sea llamado nuevamente si el directorio ya existe
    sinon.assert.calledWith(mkdirSyncStub, sinon.match((val) => val.includes('exports')), { recursive: true });
    sinon.assert.calledWith(writeFileStub, expectedFilePath, JSON.stringify(data, null, 2), 'utf8');

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('filePath', expectedFilePath);

    clock.restore();
  });

  it('debe exportar métricas correctamente con datos vacíos', async () => {
    const data = {};
    const type = 'empty-test';

    // Fijar la fecha a un valor específico
    const fixedDate = new Date('2024-11-23T12:00:00Z');
    const clock = sinon.useFakeTimers(fixedDate.getTime());

    const result = await ExportService.exportMetricsToJson(data, type);

    // Construir el expectedFileName utilizando la fecha fija, incluyendo milisegundos
    const expectedDatePart = fixedDate.toISOString().split('T')[0]; // '2024-11-23'
    const expectedFileName = `copilot-metrics-${type}-${expectedDatePart}-${fixedDate.toISOString().replace(/[:.]/g, '-')}.json`;
    const expectedFilePath = path.join(__dirname, '../../../exports', expectedFileName);

    // Verificar que mkdirSync fue llamado correctamente
    sinon.assert.calledWith(mkdirSyncStub, sinon.match((val) => val.includes('exports')), { recursive: true });

    // Verificar que writeFile fue llamado con datos vacíos
    sinon.assert.calledWith(writeFileStub, expectedFilePath, JSON.stringify(data, null, 2), 'utf8');

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('filePath', expectedFilePath);
    expect(result).toHaveProperty('fileName', expectedFileName);

    clock.restore();
  });

  it('debe manejar errores de permisos al escribir archivos JSON', async () => {
    const data = { key: 'value' };
    const type = 'permission-test';

    // Configurar writeFileStub para rechazar con un error de permisos
    writeFileStub.rejects(new Error('Permiso denegado'));

    await expect(ExportService.exportMetricsToJson(data, type)).rejects.toThrow('Error exportando métricas a JSON: Permiso denegado');

    // Verificar que mkdirSync haya sido llamado
    sinon.assert.calledWith(mkdirSyncStub, sinon.match((val) => val.includes('exports')), { recursive: true });

    // Verificar que writeFile haya sido llamado
    sinon.assert.calledWith(writeFileStub, sinon.match.string, JSON.stringify(data, null, 2), 'utf8');
  });

  it('debe manejar datos no serializables al exportar métricas a JSON', async () => {
    const data = {};
    data.circularRef = data; // Crear una referencia circular para hacer que JSON.stringify falle
    const type = 'non-serializable-test';

    await expect(ExportService.exportMetricsToJson(data, type)).rejects.toThrow('Error exportando métricas a JSON: Converting circular structure to JSON');

    // Verificar que mkdirSync fue llamado pero writeFile no
    sinon.assert.calledWith(mkdirSyncStub, sinon.match((val) => val.includes('exports')), { recursive: true });
    sinon.assert.notCalled(writeFileStub);
  });

  it('debe generar un nombre de archivo único si el archivo ya existe', async () => {
    const data = { key: 'value' };
    const type = 'test-type';

    // Simular que el archivo base ya existe
    const baseFileName = `copilot-metrics-${type}-2024-11-23-2024-11-23T12-00-00-000Z.json`;
    const baseFilePath = path.join(__dirname, '../../../exports', baseFileName);
    existsSyncStub.withArgs(baseFilePath).returns(true);

    // Fijar la fecha a un valor específico
    const fixedDate = new Date('2024-11-23T12:00:00Z');
    const clock = sinon.useFakeTimers(fixedDate.getTime());

    // Ejecutar el método a probar
    const result = await ExportService.exportMetricsToJson(data, type);

    // Construir el expectedFileName utilizando la fecha fija 
    const expectedFileName = `copilot-metrics-${type}-2024-11-23-2024-11-23T12-00-00-000Z.json`;
    const expectedFilePath = path.join(__dirname, '../../../exports', expectedFileName);

    // Verificar que mkdirSync fue llamado con una ruta que incluya 'exports' y con { recursive: true }
    sinon.assert.calledWith(mkdirSyncStub, sinon.match((val) => val.includes('exports')), { recursive: true });

    // Verificar que writeFileStub fue llamado con el archivo esperado
    sinon.assert.calledWith(writeFileStub, expectedFilePath, JSON.stringify(data, null, 2), 'utf8');

    // Verificar las propiedades del resultado
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('filePath', expectedFilePath);
    expect(result).toHaveProperty('fileName', expectedFileName);

    // Verificar que fileName sigue el patrón esperado con sufijo único
    expect(result.fileName).toMatch(/^copilot-metrics-test-type-2024-11-23-2024-11-23T12-00-00-000Z.json$/);

    // Restaurar el reloj original
    clock.restore();
  });

}); 