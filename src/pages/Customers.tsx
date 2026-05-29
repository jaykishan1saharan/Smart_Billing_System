import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

const initialCustomers: Customer[] = [
  { id: 1, name: 'John Doe', phone: '123-456-7890', address: '123 Main St, Cityville', totalOrders: 12 },
  { id: 2, name: 'Jane Smith', phone: '987-654-3210', address: '456 Oak Ave, Townsburg', totalOrders: 5 },
  { id: 3, name: 'Robert Johnson', phone: '555-123-4567', address: '789 Pine Rd, Villageton', totalOrders: 24 },
];

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  useEffect(() => {
    fetch("https://smart-billing-system-xmf3.onrender.com/api/customers")
      .then((res) => res.json())
      .then((data) => {

        const formatted = data.map((item: any) => ({
          id: item.customer_id,
          name: item.name,
          phone: item.phone,
          address: item.address,
          totalOrders: 0   // temporary
        }));

        setCustomers(formatted);

      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
      });
  }, []);

  const handleSaveCustomer = async () => {

    try {

      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `https://smart-billing-system-xmf3.onrender.com/api/customers/${editingId}`
        : "https://smart-billing-system-xmf3.onrender.com/api/customers";

      const response = await fetch(url, {

        method: method,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(newCustomer)

      });

      const data = await response.json();

      console.log("Saved:", data);

      setIsModalOpen(false);
      setEditingId(null);

      window.location.reload();

    } catch (error) {

      console.error("Error saving customer:", error);

    }

  };

  const handleEditCustomer = (customer: Customer) => {

    setEditingId(customer.id);

    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      address: customer.address
    });

    setIsModalOpen(true);

  };

  const handleDeleteCustomer = async () => {

    if (!deleteId) return;

    try {

      console.log("Deleting customer:", deleteId);

      await fetch(
        `https://smart-billing-system-xmf3.onrender.com/api/customers/${deleteId}`,
        {
          method: "DELETE"
        }
      );

      // Remove from UI
      setCustomers(
        customers.filter(c => c.id !== deleteId)
      );

      setIsDeleteModalOpen(false);
      setDeleteId(null);

    } catch (error) {

      console.error("Delete error:", error);

    }

  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Customer ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={customer.id}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">#CUST-{customer.id.toString().padStart(3, '0')}</td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {customer.name.charAt(0)}
                      </div>
                      {customer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{customer.phone}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">{customer.address}</td>
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{customer.totalOrders}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(customer.id);
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingId ? "Edit Customer" : "Add New Customer"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      name: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      phone: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      address: e.target.value
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleSaveCustomer}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
              >
                Save Customer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Customer Modal */}

      {isDeleteModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Delete Customer
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this customer?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCustomer}
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
