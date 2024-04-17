import React, { useEffect, useState } from 'react'
import "./index.css"

interface Product {
  id: number
  name: string
  price: string
  image: string
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [newProduct, setNewProduct] = useState<Product>({ id: 0, name: '', price: '', image: '' })
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddProductForm, setShowAddProductForm] = useState<boolean>(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const totalPrice = cart.reduce((acc, item) => acc + parseFloat(item.price), 0)
    setTotalPrice(totalPrice)
  }, [cart])

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/refaccionaria-87fda/us-central1/app/api/products`)
      if (response.ok) {
        const data: Product[] = await response.json()
        setProducts(data)
      } else {
        console.error('Error al obtener los productos:', response.statusText)
      }
    } catch (error) {
      console.error('Error al obtener los productos:', error)
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const addToCart = (product: Product) => {
    setCart([...cart, product])
  }

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter((item) => item.id !== productId)
    setCart(updatedCart)
  }

  const handleNewProductChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewProduct({ ...newProduct, [name]: value })
  }

  const addNewProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/refaccionaria-87fda/us-central1/app/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })
      if (response.ok) {
        setNewProduct({ id: 0, name: '', price: '', image: '' })
        fetchProducts()
      } else {
        console.error('Error al agregar el producto:', response.statusText)
      }
    } catch (error) {
      console.error('Error al agregar el producto:', error)
    }
  }

  const deleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/refaccionaria-87fda/us-central1/app/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchProducts()
        if (editingProduct && editingProduct.id === productId) {
          setEditingProduct(null)
        }
      } else {
        console.error('Error al eliminar el producto:', response.statusText)
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
    }
  }

  const toggleShowAllProducts = () => {
    setShowAllProducts(!showAllProducts)
  }

  const toggleAddProductForm = () => {
    setShowAddProductForm(!showAddProductForm)
  }

  const startEditingProduct = (product: Product) => {
    setEditingProduct({ ...product })
  }

  const handleEditProductChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setEditingProduct({ ...editingProduct!, [name]: value })
  }

  const saveEditedProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/refaccionaria-87fda/us-central1/app/api/products/${editingProduct!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProduct),
      })
      if (response.ok) {
        setEditingProduct(null)
        fetchProducts()
      } else {
        console.error('Error al editar el producto:', response.statusText)
      }
    } catch (error) {
      console.error('Error al editar el producto:', error)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Refaccionaria ZonAuto</h1>
        <p>¡Encuentra todo lo que necesitas para tu automóvil!</p>
      </div>
      <input
        type="text"
        placeholder="Buscar producto"
        value={searchTerm}
        onChange={handleSearch}
      />
      <div className="product-container">
        {searchTerm && filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <div>{product.name} - ${product.price}</div>
            <button onClick={() => addToCart(product)}>Agregar al carrito</button>
          </div>
        ))}
      </div>
      <h2>Carrito de compras</h2>
      <ul>
        {cart.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => removeFromCart(product.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <p>Total: ${totalPrice.toFixed(2)}</p>
      <button onClick={toggleShowAllProducts}>
        {showAllProducts ? 'Ocultar lista de productos' : 'Mostrar lista de productos'}
      </button>
      {showAllProducts && (
        <div>
          <h2>Lista de productos</h2>
          <div className="product-container">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                {editingProduct && editingProduct.id === product.id ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre del producto"
                      name="name"
                      value={editingProduct.name}
                      onChange={handleEditProductChange}
                    />
                    <input
                      type="text"
                      placeholder="Precio del producto"
                      name="price"
                      value={editingProduct.price}
                      onChange={handleEditProductChange}
                    />
                    <input
                      type="text"
                      placeholder="URL de la imagen"
                      name="image"
                      value={editingProduct.image}
                      onChange={handleEditProductChange}
                    />
                    <button onClick={saveEditedProduct}>Guardar</button>
                  </div>
                ) : (
                  <div>
                    {product.name} - ${product.price}
                    <button onClick={() => startEditingProduct(product)}>Editar</button>
                    <button onClick={() => deleteProduct(product.id)}>Eliminar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <h2>Agregar nuevo producto</h2>
          {showAddProductForm && (
            <div>
              <input
                type="text"
                placeholder="Nombre del producto"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
              />
              <input
                type="text"
                placeholder="Precio del producto"
                name="price"
                value={newProduct.price}
                onChange={handleNewProductChange}
              />
              <input
                type="text"
                placeholder="URL de la imagen"
                name="image"
                value={newProduct.image}
                onChange={handleNewProductChange}
              />
              <button onClick={addNewProduct}>Agregar producto</button>
            </div>
          )}
          <button onClick={toggleAddProductForm}>
            {showAddProductForm ? 'Ocultar formulario de agregar producto' : 'Agregar nuevo producto'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
