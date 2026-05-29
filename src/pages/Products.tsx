import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { useLocation } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: 'active' | 'out_of_stock';
}

const initialProducts: Product[] = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Medicine', price: 5.50, quantity: 120, status: 'active' },
  { id: 2, name: 'Band-Aid Pack', category: 'First Aid', price: 2.00, quantity: 50, status: 'active' },
  { id: 3, name: 'Vitamin C 1000mg', category: 'Supplements', price: 15.00, quantity: 0, status: 'out_of_stock' },
  { id: 4, name: 'Cough Syrup', category: 'Medicine', price: 8.50, quantity: 45, status: 'active' },
  { id: 5, name: 'Hand Sanitizer 50ml', category: 'Hygiene', price: 3.50, quantity: 200, status: 'active' },
];

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation(); 
  const highlightProduct =
    location.state?.highlightProduct;

  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);


  const [newProduct, setNewProduct] = useState({
    product_name: "",
    category: "",
    price: "",
    quantity: ""
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          category: item.category,
          price: Number(item.price),
          quantity: Number(item.quantity),
          status: item.quantity > 0 ? "active" : "out_of_stock"
        }));

        setProducts(formatted);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  useEffect(() => {

    if (highlightedRowRef.current) {

      highlightedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }

  }, [products]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = async () => {

    try {

      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity),
          status: "active"
        })
      });

      const data = await response.json();

      console.log("Saved:", data);

      setIsModalOpen(false);
      setEditingId(null);

      window.location.reload();

    } catch (error) {

      console.error("Error saving:", error);

    }
  };

  const handleEditProduct = (product: Product) => {

    setEditingId(product.id);

    setNewProduct({
      product_name: product.name,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });

    setIsModalOpen(true);
  };

  const confirmDeleteProduct = async () => {

    if (!deleteId) return;

    try {

      console.log("Deleting:", deleteId);

      await fetch(
        `http://localhost:5000/api/products/${deleteId}`,
        {
          method: "DELETE"
        }
      );

      // Remove from UI
      setProducts(products.filter(p => p.id !== deleteId));

      setIsDeleteModalOpen(false);
      setDeleteId(null);

    } catch (error) {

      console.error("Delete error:", error);

    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Products Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Product ID</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  ref={
                    highlightProduct === product.name
                      ? highlightedRowRef
                      : null
                  }
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={product.id}
                  className={`border-b border-slate-100 dark:border-slate-800/50 transition-colors
                    ${highlightProduct === product.name
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                    }`}
                >
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">#{product.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.category}</td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${product.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                      {product.status === 'active' ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(product.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingId ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.product_name}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      product_name: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: e.target.value
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        quantity: e.target.value
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
              >
                Save Product
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Delete Product
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-md"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
