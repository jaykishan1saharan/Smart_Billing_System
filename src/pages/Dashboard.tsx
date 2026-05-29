import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const salesData = [
  { name: 'Jan', total: 4000 },
  { name: 'Feb', total: 3000 },
  { name: 'Mar', total: 5000 },
  { name: 'Apr', total: 4500 },
  { name: 'May', total: 6000 },
  { name: 'Jun', total: 5500 },
  { name: 'Jul', total: 7000 },
];

export const Dashboard: React.FC = () => {

  const [todaySales, setTodaySales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);

  const handleRestock = async (productId: number) => {
    try {
      await fetch(
        `http://localhost:5000/api/products/restock/${productId}`,
        {
          method: "PUT"
        }
      );

      // Refresh list
    fetchLowStock();

    } catch (error) {
      console.error("Restock failed:", error);
    }

  };

  const fetchLowStock = async () => {

    try {
      const res = await fetch(
        "http://localhost:5000/api/dashboard/low-stock-products"
      );
      const data = await res.json();
      setLowStockProducts(data);

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    // Today's Sales
    fetch("http://localhost:5000/api/dashboard/today-sales")
      .then(res => res.json())
      .then(data => {
        setTodaySales(data.totalSales || 0);
      });

    // Today's Orders
    fetch("http://localhost:5000/api/dashboard/today-orders")
      .then(res => res.json())
      .then(data => {
        setTotalOrders(data.totalOrders || 0);
      });

    // Total Products
    fetch("http://localhost:5000/api/dashboard/total-products")
      .then(res => res.json())
      .then(data => {
        setTotalProducts(data.totalProducts || 0);
      });

    // Low Stock Items
    fetch("http://localhost:5000/api/dashboard/low-stock")
      .then(res => res.json())
      .then(data => {
        setLowStockCount(data.lowStockCount || 0);
      });

    // Recent Transactions
    fetch("http://localhost:5000/api/dashboard/recent-transactions")
      .then(res => res.json())
      .then(data => {

        setRecentTransactions(data || []);

      });


    // Monthly Revenue
    fetch("http://localhost:5000/api/dashboard/monthly-revenue")
      .then(res => res.json())
      .then(data => {
        setMonthlyRevenue(data || []);
      });

    // Top Selling Products
    fetch("http://localhost:5000/api/dashboard/top-products")
      .then(res => res.json())
      .then(data => {

        if (Array.isArray(data)) {
          setTopProductsData(data);
        } else {
          setTopProductsData([]);
        }
      })
      .catch(err => {
        console.error("Top products fetch error:", err);
        setTopProductsData([]);
      });

      fetchLowStock();

  }, []);

  const cards = [
    {
      title: 'Total Sales Today',
      value: `$${Number(todaySales || 0).toFixed(2)}`,
      icon: <DollarSign size={24} />,
      color: 'bg-emerald-500',
      trend: '+12.5%'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: <ShoppingBag size={24} />,
      color: 'bg-indigo-500',
      trend: '+5.2%'
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: <Package size={24} />,
      color: 'bg-blue-500',
      trend: '+2.1%'
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      icon: <AlertTriangle size={24} />,
      color: 'bg-rose-500',
      trend: '-1.5%'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors font-medium">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{card.value}</h3>
              </div>
              <div className={`${card.color} text-white p-3 rounded-xl shadow-lg`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp size={16} className="text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">{card.trend}</span>
              <span className="text-slate-400 ml-2">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Selling Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="sales" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions.map((tx, i) => (
                  <tr
                    key={tx.sale_id}
                    className="border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                  >
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">
                      #ORD-{tx.sale_id}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-400">
                      {tx.customer_name || "Walk-in Customer"}
                    </td>
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">
                      ${Number(tx.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-medium">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Low Stock Alerts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">

                {lowStockProducts.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                  >
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">
                      {item.product_name}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${item.quantity === 0
                          ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                      >
                        {item.quantity} left
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleRestock(item.product_id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
