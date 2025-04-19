const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Servicio de IA ejecutándose en el puerto ${PORT}`);
});