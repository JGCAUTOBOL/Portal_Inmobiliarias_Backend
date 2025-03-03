const axios = require('axios');

class SolicitudService {
  constructor() {
    this.apiUrl = 'https://c6pnzhv62c.execute-api.us-east-1.amazonaws.com/stage/solicitud/api/v1/consultarsolicitudes/';
  }

  dividirRangoFechas(fechaInicio, fechaFin) {
    const intervalos = [];
    let fechaActual = new Date(fechaFin); // Comenzamos desde la fecha final (hoy)

    while (fechaActual > fechaInicio) {
      const fechaFinIntervalo = this.formatoFecha(new Date(fechaActual)); // Fecha final del intervalo
      fechaActual.setDate(fechaActual.getDate() - 15); // Retroceder 15 días
      const fechaInicioIntervalo = this.formatoFecha(new Date(Math.max(fechaActual, fechaInicio))); // Fecha inicial del intervalo
      intervalos.unshift({ fechaInicio: fechaInicioIntervalo, fechaFin: fechaFinIntervalo }); // Agregar al inicio del array
    }

    return intervalos;
  }

  formatoFecha(fecha) {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
    const año = fecha.getFullYear();
    return `${dia}${mes}${año}`;
  }

  transformDataToDataTable(data) {
    const flattenedData = data.flat();
    return flattenedData.map(item => [
      item.poliza || 'No Registra',
      item.solicitud || 'No Registra',
      item.tipoIdentificacion || 'No Registra',
      item.identificacionInquilino || 'No Registra',
      item.estadoGeneral || 'No Registra',
      item.direccionInmueble || 'No Registra',
      item.correoInquilino || 'No Registra',
      item.telefonoInquilino || 'No Registra',
      item.canon || 'No Registra',
      item.destinoInmueble || 'No Registra',
      item.ciudadInmueble || 'No Registra',
      item.fechaRadicacion || 'No Registra',
      item.fechaResultado || 'No Registra'
    ]);
  }

  async getSolicitudes(numeroPoliza) {
    const hoy = new Date(); // Fecha actual
    const haceDosMeses = new Date(hoy);
    haceDosMeses.setMonth(haceDosMeses.getMonth() - 2); // Restar 2 meses desde hoy

    // Dividir el rango de fechas en intervalos de 15 días
    const intervalos = this.dividirRangoFechas(haceDosMeses, hoy);

    try {
      // Construir la URL base con el número de póliza
      const baseUrl = `${this.apiUrl}${numeroPoliza}/`;

      // Realizar todas las solicitudes simultáneamente
      const solicitudesPromises = intervalos.map(async ({ fechaInicio, fechaFin }) => {
        const url = `${baseUrl}${fechaInicio}/${fechaFin}`;
        console.log("fechaInicio: ", fechaInicio, "fechaFin: ", fechaFin);
        const response = await axios.get(url);
        return response.data; // Devolver los datos de cada solicitud
      });

      // Esperar a que todas las solicitudes se completen
      const resultados = await Promise.all(solicitudesPromises);

      // Unificar los datos en un solo array
      const solicitudesUnificadas = this.transformDataToDataTable(resultados)
      console.log(solicitudesUnificadas)
      return solicitudesUnificadas;
    } catch (error) {
      console.error('Error al consumir la API externa:', error.message);
      throw new Error('Error al obtener las solicitudes');
    }
  }
}

module.exports = new SolicitudService();