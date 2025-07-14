// Configuración de Firebase (REEMPLAZA CON TU CONFIGURACIÓN REAL)
const firebaseConfig = {
  apiKey: "AIzaSyBq_9S4wb-JOmcUbq-eOf5ZErS_JvBSrVA",
  authDomain: "klosetshop-d3064.firebaseapp.com",
  projectId: "klosetshop-d3064",
  storageBucket: "klosetshop-d3064.appspot.com",
  messagingSenderId: "9649538184",
  appId: "1:9649538184:web:86e7050dc70c0ed3774b3d"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Función para generar SKU
function generateSKU(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}`;
}

// Función para agregar un nuevo producto
async function addItem() {
  const file = document.getElementById('camera').files[0];
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);
  const quantity = parseInt(document.getElementById('itemQuantity').value);

  // Validación básica
  if (!file || !name || isNaN(price) || isNaN(quantity)) {
    alert("Por favor, complete todos los campos correctamente.");
    return;
  }

  try {
    // Subir la imagen a Firebase Storage
    const storageRef = storage.ref(`articulos/${file.name}`);
    await storageRef.put(file);
    const imageUrl = await storageRef.getDownloadURL();

    // Generar SKU
    const sku = generateSKU(name);

    // Guardar en Firestore
    await db.collection("inventario").add({
      sku,
      name,
      price,
      quantity,
      imageUrl,
      timestamp: new Date()
    });

    alert(`✅ Producto agregado: ${name} (SKU: ${sku})`);
    
    // Limpiar el formulario
    document.getElementById('camera').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemQuantity').value = '';

  } catch (error) {
    console.error("Error al agregar producto: ", error);
    alert(`❌ Error: ${error.message}`);
  }
}

// Escuchar cambios en el inventario y actualizar la lista
db.collection("inventario").onSnapshot(snapshot => {
  const listDiv = document.getElementById('inventoryList');
  listDiv.innerHTML = ""; // Limpiar lista

  snapshot.forEach(doc => {
    const item = doc.data();
    const itemElement = document.createElement('div');
    itemElement.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" width="50">
      <strong>${item.name}</strong> (SKU: ${item.sku})<br>
      Precio: $${item.price} | Cantidad: ${item.quantity}
    `;
    listDiv.appendChild(itemElement);
  });
}, error => {
  console.error("Error al cargar inventario: ", error);
  document.getElementById('inventoryList').innerHTML = "Error cargando inventario";
});

// Función para generar reporte
function generateReport() {
  const reportDiv = document.getElementById('report');
  reportDiv.innerHTML = "Calculando...";

  db.collection("inventario").get().then(snapshot => {
    let totalItems = 0;
    let totalValue = 0;

    snapshot.forEach(doc => {
      const item = doc.data();
      totalItems += item.quantity;
      totalValue += item.price * item.quantity;
    });

    reportDiv.innerHTML = `
      <p>✅ Total de productos: ${snapshot.size}</p>
      <p>📦 Total de unidades: ${totalItems}</p>
      <p>💰 Valor total del inventario: $${totalValue.toFixed(2)}</p>
    `;
  }).catch(error => {
    reportDiv.innerHTML = `❌ Error: ${error.message}`;
  });
}

// Cargar inventario al iniciar
window.onload = function() {
  generateReport();
};
