import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}



export const Billing: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {

    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {

        const formatted = data.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          price: Number(item.price),
          stock: Number(item.quantity)
        }));

        setProducts(formatted);

      })
      .catch(err => {
        console.error("Error loading products:", err);
      });

  }, []);

  useEffect(() => {

    fetch("http://localhost:5000/api/customers")
      .then(res => res.json())
      .then(data => {

        const formatted = data.map((item: any) => ({
          id: item.customer_id,
          name: item.name,
          phone: item.phone
        }));

        setCustomers(formatted);

      })
      .catch(err => {
        console.error("Error loading customers:", err);
      });

  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const discount = 0;
  const total = subtotal + tax - discount;
  // Your UPI Details
  const upiId = "jaikishansaharan@oksbi";
  const shopName = "SmartBill Pharmacy";

  // Dynamic QR string
  const upiString =
    `upi://pay?pa=${upiId}&pn=${shopName}&am=${total}&cu=INR`;

  const handleCheckout = async () => {

    if (!selectedCustomer) {
      alert("Please select a customer first");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const saleData = {
        customer_id: selectedCustomer.id,
        total_amount: total,
        tax: tax,
        discount: discount,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))

      };

      console.log("Saving sale:", saleData);

      const response = await fetch(
        "http://localhost:5000/api/sales",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(saleData)
        }
      );

      const data = await response.json();

      console.log("Sale saved:", data);

      setLastSaleId(data.sale_id);
      // Store invoice data
      setLastInvoice({
        customer: selectedCustomer,
        items: cart,
        subtotal,
        tax,
        discount,
        total
      });
      setIsSuccessModalOpen(true);
      setCart([]);

    } catch (error) {
      console.error("Checkout error:", error);

    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Left Section - Products */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          {/* Customer Select */}
          <select
            onChange={(e) => {
              const customer = customers.find(
                c => c.id === Number(e.target.value)
              );
              setSelectedCustomer(customer);
            }}
            className="w-full mb-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">
              Select Customer
            </option>
            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name} ({customer.phone})
              </option>
            ))}
          </select>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
          {filteredProducts.map((product) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors flex flex-col justify-between h-32"
            >
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{product.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stock: {product.stock}</p>
              </div>
              <p className="font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right Section - Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCartIcon /> Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCartIcon size={48} className="opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-500 hover:text-indigo-600"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm font-medium text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-500 hover:text-indigo-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Tax (5%)</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Discount</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">-${discount.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
            <span className="font-bold text-slate-800 dark:text-white">Total</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => setCart([])}
              className="py-3 px-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              Clear
            </button>
            <button
              disabled={cart.length === 0}
              onClick={() => setShowPaymentModal(true)}
              className="py-3 px-4 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Pay
            </button>
          </div>
        </div>
      </div>
      {/* Payment Success Modal */}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Payment Successful
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Sale ID: #{lastSaleId}
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <div className="flex justify-center gap-3 mt-6">

                {lastInvoice && (

                  <div
                    id="invoice-print-area"
                    className="text-left mt-4 border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white"
                  >

                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                      Invoice Details
                    </h4>

                    <p className="text-sm">
                      Customer: {lastInvoice.customer.name}
                    </p>

                    <p className="text-sm mb-3">
                      Phone: {lastInvoice.customer.phone}
                    </p>

                    <div className="space-y-2 text-sm">

                      {lastInvoice.items.map((item: any, i: number) => (

                        <div key={i} className="flex justify-between">

                          <span>
                            {item.name} × {item.quantity}
                          </span>

                          <span>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>

                        </div>

                      ))}

                    </div>

                    <div className="border-t mt-3 pt-3 text-sm">

                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${lastInvoice.subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${lastInvoice.tax.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${lastInvoice.total.toFixed(2)}</span>
                      </div>

                    </div>

                  </div>

                )}

                <div className="no-print flex justify-center gap-3 mt-6">

                  <button
                    onClick={handlePrintInvoice}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md"
                  >
                    Print Invoice
                  </button>

                  <button
                    onClick={() => setIsSuccessModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                  >
                    New Order
                  </button>

                </div>

              </div>
            </div>
          </div>
        </div>
      )}
      {/* Payment Method Modal */}

      {showPaymentModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-96">

            <h2 className="text-lg font-bold mb-4">
              Select Payment Method
            </h2>

            {/* Payment Options */}

            <div className="flex gap-2 mb-4">

              <button
                onClick={() => setPaymentMethod("upi")}
                className={`flex-1 py-2 border rounded ${paymentMethod === "upi"
                  ? "bg-indigo-600 text-white"
                  : ""
                  }`}
              >
                UPI
              </button>

              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex-1 py-2 border rounded ${paymentMethod === "cash"
                  ? "bg-indigo-600 text-white"
                  : ""
                  }`}
              >
                Cash
              </button>

            </div>

            {/* Show QR */}

            {paymentMethod === "upi" && (

              <div className="text-center space-y-3">

                <QRCodeCanvas
                  value={upiString}
                  size={180}
                />

                <p className="text-sm">
                  UPI ID:
                  <b> {upiId} </b>
                </p>

                <p className="text-lg font-bold text-indigo-600">
                  ₹ {total.toFixed(2)}
                </p>

              </div>

            )}

            {/* Buttons */}

            <div className="flex gap-2 mt-4">

              <button
                onClick={() => {
                  handleCheckout();
                  setShowPaymentModal(false);
                }}
                className="flex-1 bg-indigo-600 text-white py-2 rounded"
              >
                Payment Done
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}
    </div>
  );
};

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
