const nodemailer = require('nodemailer');

class GmailService {
    constructor() {
        // Configurar el transporte de correo con SMTP
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'desarrollocrmlibertador@ellibertador.co', // Tu cuenta de Gmail
                pass: 'ilrr eivw dtqj qdee', // Reemplaza con tu contraseña de aplicación
            },
        });
    }

    async sendEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: '"noreply@ellibertador.co"<desarrollocrmlibertador@ellibertador.co>', // Mismo correo que en `user`
                to,
                subject,
                html: htmlContent,
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Error al enviar el correo:', error.message);
            throw error;
        }
    }
    generateEmailHTML(code) {
        return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código OTP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 10px;
          }
          p {
            color: #555555;
            font-size: 16px;
            line-height: 1.5;
          }
          .otp-code {
            font-size: 20px;
            font-weight: bold;
            color: #007bff;
            background-color: #e7f3ff;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888888;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tu Código OTP</h1>
          <p>Hemos generado un código OTP para ti. Por favor, no lo compartas con nadie.</p>
          <div class="otp-code">${code}</div>
          <p>Este código es válido por 10 minutos.</p>
          <div class="footer">
            <p>Gracias por usar nuestros servicios.</p>
            <p>&copy; 2023 Seguros Bolívar. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}



module.exports = new GmailService();