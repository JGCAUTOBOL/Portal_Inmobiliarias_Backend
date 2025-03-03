const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const key = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDeQoq1qtE/4hau\nfSVwA0jbfruq9YVvWF6ahQUXOs4hlQal4Bni+cDgUWTE46cwMKP7FfXMH9s1uLcI\ndXpPSGcrU7+/edJHIBBgfVWjTN78kTjDbI00/WZ49XcOMJM+paNa2kFuacIkQbEl\n6Z549r/lDyAPgPi50duVSYHKOz5/0npQYk2ndlw8FnI442ih1g+PpJpD8apMoeEx\nfqCQTqD2SOChGUVwgtSA72PJvzF+H/sn+aK8Yl8+BQ5Eb0Ei7TQ2lO5gWyIQoM5v\nGUIoEqfsBk5EKuiNgUSg/dDMxqC7klZSwN7X7AYrMdHkYl+sbaK2zJdujB10KquS\nATG/1jxnAgMBAAECggEABLJxTf+LJod3pT5d0S0wl/roqmc/56d9cFSJVAFZI9qL\nZmwDAAn5KoRt1b9d5CXTAVZoeGTf9BWwQIyDBjPogkDl130SlZA26GMdsTLJr5q+\nEVs07L7CMKI3XuRl6DgF6MCeC2BOywdcYAm84J+OVJ/qNImsN/kYY+JGzOhNnNPi\nzJIYYlxdUVgxa6CvB7D2dPi8cdsbopoSkfHAhG7oM5IUCSoOOJ0huSxf2o5mNPsR\ngPTDeJpOau1anW9CldL5oCdaGbBjWpTvDiK9uiKTm7you3FqJ0XmE0HKyvD1JARX\nzHKVWKHaNJuyMO83FgrcNBT7oUXykoNmxfKMJxql0QKBgQD4vmyHLuibuGKB2BY/\nxDtfKX/JSU8hJdGXIBdVXNfM68dHq/bAMFnlNlmjwhCR734FCmJhvL1lBFi9HBTx\nn8hGUX1958lCGTwU/ac4tO8IFzS48jtoZJwfwwqTYuQ1aJwH+HfDgv5Zf6BV6i7G\nd7bba+oTKJp3o6XWdM6dYX36WQKBgQDkvlcxaFWe7YU38YKMbHwp2XJfAnsTGBSl\nvolnQxjQQYk/ot2BPs0CFqCmiQWKalqGSMsdQduAMHkzn2lHXSYj1/jk6Tr+SQnZ\n9jJLFwivfAwXDqCmS0Pmu5hKZsnSGTQTbZ92yVbghj/SvAVioZfde9UTqOj9KFJR\noUwRkWWUvwKBgBR86sd/r50T5Nk5CSwbZ6CA9IuJxEDAsrC17fYT/ZpdWT6oBVzz\nHpRok52PYHoEteaIYm4Wc6scXorFA1ybgo14LNPwAX22QmKgOePL01xhPPB20znX\n/5wGHprhLFbR1Pg7GPI7meOZRYWOEmg6eA8+pjsJvx9XlVNCr7n6y7uRAoGBAKto\njsIxYufDKS7wxVkg+jIKBhB4NW3rf51sGF7PAsscMRMEomP1gX5tIllpGEPOyqMR\n7VKxRSDcMhajACs//BKkBpjSxShD5yPzv2BRlGqb1Bt7FJtIj0tZjBdEyzurM0DT\nxskmuvlo4G60An0Uhk6sOtGOo3kBPB57dhs8DxjVAoGBAPNBmupBk24nojEsSfGS\nrnSjWIctwkMCDK/sLwYi3nKimt9UCtN7X/ZR/4glP79LZr0YkS8oqDYSmq/kq3Ij\nzoJe6KOrZHovfX9n3+Rclahf3c5Rh3z8wl3WrEjT3NtWNRV+56W8fT95uhN8SN0T\nJTzdIPQQ2c04VRjxtzprLZTd\n-----END PRIVATE KEY-----";

class GoogleSheetsService {
  constructor() {
    this.credentials = {
      // Aquí van tus credenciales de Google Sheets API
      client_email: "desarrollo-inmobiliairias-libe@proyecto-ia-servicios-bolivar.iam.gserviceaccount.com",
      private_key: key.replace(/\\n/g, '\n'),
    };
    this.spreadsheetId = '15B96Q2cpw5XYFV3Pe8grBqYSL1G6i4cFBjXNl3qtUYc'; // ID de la hoja de cálculo
  }

  async getDataUsers() {
    const auth = new GoogleAuth({
      credentials: this.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/A1:C`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken().then((res) => res.token)}`,
        },
      });
      return response.data.values; // Retorna los datos de la hoja
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error.message);
      throw new Error('Error al obtener datos de Google Sheets');
    }
  }

  async validateEmail(correo) {
    try {
      const data = await this.getDataUsers();
      const dataFilter = data.slice(1).filter((row) => row[2] === correo); // Filtra por el correo en la columna 3
  
      if (dataFilter.length > 0) {
        const [poliza, nombre] = dataFilter[0]; // Extrae los datos de las columnas 1 y 2
        return { status: 'Access', poliza, nombre };
      } else {
        return { status: 'Restriction' };
      }
    } catch (error) {
      console.error('Error al validar el correo:', error.message);
      throw new Error('Error al validar el correo');
    }
  }
}

module.exports = new GoogleSheetsService();