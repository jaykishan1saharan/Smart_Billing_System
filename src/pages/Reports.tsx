import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const dailySales = [
  { name: 'Mon', sales: 400 },
  { name: 'Tue', sales: 300 },
  { name: 'Wed', sales: 500 },
  { name: 'Thu', sales: 450 },
  { name: 'Fri', sales: 600 },
  { name: 'Sat', sales: 800 },
  { name: 'Sun', sales: 750 },
];

const productCategories = [
  { name: 'Medicine', value: 400 },
  { name: 'First Aid', value: 300 },
  { name: 'Supplements', value: 300 },
  { name: 'Hygiene', value: 200 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const Reports: React.FC = () => {

  const [salesData, setSalesData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    fetchSales();
    fetchDailySales();
    fetchCategorySales();

  }, []);

  const fetchSales = async () => {
    try {

      const res = await fetch(
        'https://smart-billing-system-xmf3.onrender.com/api/dashboard/sales-report'
      );

      const data = await res.json();

      setSalesData(data);

    } catch (error) {

      console.error("Fetch Sales Error:", error);

    }
  };

  const exportCSV = () => {

    if (salesData.length === 0) return;
    const headers = [
      "Sale ID",
      "Customer",
      "Total",
      "Tax",
      "Discount",
      "Date"
    ];
    const rows = salesData.map(row => [
      row.sale_id,
      row.customer_name || "Walk-in",
      row.total_amount,
      row.tax,
      row.discount,
      new Date(row.created_at).toLocaleString()
    ]);
    const csvContent =
      [headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sales_report.csv";

    link.click();
  };

  const exportPDF = () => {

    window.print();

  };

  const fetchDailySales = async () => {

    try {
      const res = await fetch(
        'https://smart-billing-system-xmf3.onrender.com/api/dashboard/daily-sales'
      );
      const data = await res.json();
      setDailyData(data);

    } catch (error) {
      console.error("Daily Sales Fetch Error:", error);
    }

  };

  const fetchCategorySales = async () => {

  try {

    const res = await fetch(
      'https://smart-billing-system-xmf3.onrender.com/api/dashboard/sales-by-category'
    );
    const data = await res.json();
    // Convert value to number
    const formattedData = data.map((item: any) => ({
      name: item.name,
      value: Number(item.value)
    }));
    setCategoryData(formattedData);

  } catch (error) {
    console.error("Category Fetch Error:", error);
  }

};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics & Reports</h1>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
          >
            <FileText size={18} /> Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors font-medium flex items-center gap-2"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Daily Sales (This Week)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Sales by Category</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                {cat.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
