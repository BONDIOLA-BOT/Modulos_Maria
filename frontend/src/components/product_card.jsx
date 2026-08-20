export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="mx-auto bg-blue-50 p-5 rounded-xl shadow min-h-44">
      <h2>{product.name}</h2>
      <p>Stock: {product.stock}</p>
      <p>Precio: {product.price}</p>
      <p>Descripcion: {product.description}</p>
      {product.stock > 0 && (
        <button
          onClick={() => onAddToCart(product.id_product)}
          className="bg-red-500 text-white px-4 py-2 rounded mt-2"
        >
          Agregar
        </button>
      )}
    </div>
  );
}
