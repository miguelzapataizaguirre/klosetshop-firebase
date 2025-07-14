// 🔥 REEMPLAZA ESTO CON TU CONFIGURACIÓN REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Generador de SKU
function generateSKU(name) {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}`;
}

// Agregar nuevo producto
async function addItem() {
  const file = document.getElementById('camera').files[0];
  const name = document.getElementById('itemName').value;
  const price = parseFloat(document.getElementById('itemPrice').value);
  const quantity = parseInt(document.getElementById('itemQuantity').value);

  if (!file || !name) {
    alert("Por favor agrega foto y nombre.");
    return;
  }

  try {
    // Subir imagen a Storage
    const storageRef = storage.ref(`articulos/${file.name}`);
    await storageRef.put(file);
    const imageUrl = await storageRef.getDownloadURL();

    // Crear registro en Firestore
    const sku = generateSKU(name);
    await db.collection("inventario").add({
      sku,
      name,
      price,
      quantity,
      imageUrl,
      timestamp: new Date()
    });

    alert(`✅ Producto agregado (SKU: ${sku})`);
    location.reload();
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
}

// Mostrar inventario en tiempo real
db.collection("inventario").onSnapshot(snapshot => {
  const listDiv = document.getElementById('inventoryList');
  listDiv.innerHTML = "";
  
  snapshot.forEach(doc => {
    const item = doc.data();
    listDiv.innerHTML += `
      <div>
        <img src="${item.imageUrl}" alt="${item.name}" width="50">
        <strong>${item.name}</strong> (SKU: ${item.sku})<br>
        $${item.price} | Cantidad: ${item.quantity}
      </div>
    `;
  });
});

// Generar reporte
function generateReport() {
  const reportDiv = document.getElementById('report');
  reportDiv.innerHTML = "📊 Calculando...";
  
  db.collection("inventario").get().then(snapshot => {
    let total = 0;
    snapshot.forEach(doc => {
      const item = doc.data();
      total += item.price * item.quantity;
    });
    
    reportDiv.innerHTML = `
      <p>✅ Total de productos: ${snapshot.size}</p>
      <p>💰 Valor total del inventario: $${total.toFixed(2)}</p>
    `;
  }).catch(error => {
    reportDiv.innerHTML = `❌ Error: ${error.message}`;
  });
}