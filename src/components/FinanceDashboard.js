import React, { useState, useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const FinanceDashboard = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState("Fevereiro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Dados de transações
  const transactionsData = {
    "2024-Fevereiro": [
      {
        id: 1,
        date: "01/02/2024",
        value: 25.0,
        category: "Comida",
        description: "Supermercado",
      },
      {
        id: 2,
        date: "05/02/2024",
        value: 150.0,
        category: "Casa",
        description: "Conta de luz",
      },
      {
        id: 3,
        date: "10/02/2024",
        value: 67.0,
        category: "Carro",
        description: "Combustível",
      },
      {
        id: 4,
        date: "15/02/2024",
        value: 50.0,
        category: "Lazer",
        description: "Cinema",
      },
    ],
  };

  const key = `${selectedYear}-${selectedMonth}`;
  const transactions = transactionsData[key] || [];

  // Categorias e configurações visuais
  const categories = ["Todas", "Carro", "Casa", "Comida", "Lazer"];
  const years = [2023, 2024, 2025];
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"];
  const categoryColors = {
    Carro: "#4A90E2",
    Casa: "#50E3C2",
    Comida: "#F5A623",
    Lazer: "#D0021B",
  };

  const getCategoryColor = (category) => categoryColors[category] || "#777777";

  // Filtragem e ordenação de transações
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(
        (t) => selectedCategory === "Todas" || t.category === selectedCategory
      )
      .sort((a, b) => {
        let comparison =
          sortBy === "value" ? a.value - b.value : a.date.localeCompare(b.date);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [transactions, selectedCategory, sortBy, sortDirection]);

  // Cálculo de despesas por categoria para o gráfico
  const expensesByCategory = useMemo(() => {
    const expenses = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.value;
      return acc;
    }, {});

    // Formato para o gráfico de pizza
    return Object.keys(expenses).map((category) => ({
      name: category,
      value: expenses[category],
      color: getCategoryColor(category),
    }));
  }, [transactions]);

  // Total de gastos
  const totalExpenses = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.value, 0);
  }, [transactions]);

  // Alternância de ordenação
  const toggleSort = useCallback(
    (column) => {
      setSortDirection(
        sortBy === column ? (sortDirection === "asc" ? "desc" : "asc") : "asc"
      );
      setSortBy(column);
    },
    [sortBy, sortDirection]
  );

  // Formatação de moeda
  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto w-full rounded-lg border border-gray-700 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition">
            Login
          </button>
        </header>

        {/* Seletores de ano e mês */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex space-x-6">
            {years.map((year) => (
              <button
                key={year}
                className={`text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded ${
                  selectedYear === year ? "text-blue-400" : "text-white"
                }`}
                onClick={() => setSelectedYear(year)}
                aria-pressed={selectedYear === year}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onClick={() => setShowMonthSelector(!showMonthSelector)}
              aria-haspopup="true"
              aria-expanded={showMonthSelector}
            >
              {selectedMonth} {showMonthSelector ? "▲" : "▼"}
            </button>
            {showMonthSelector && (
              <div className="absolute mt-2 bg-gray-800 rounded shadow-lg z-10 w-full">
                {months.map((month) => (
                  <button
                    key={month}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
                    onClick={() => {
                      setSelectedMonth(month);
                      setShowMonthSelector(false);
                    }}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo e gráfico */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl mb-4 font-semibold">Resumo de Gastos</h2>
            <p className="text-2xl font-bold mb-2">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-gray-400">Total de gastos em {selectedMonth}</p>
            <div className="mt-4">
              {expensesByCategory.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center my-2"
                >
                  <div className="flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span>{item.name}</span>
                  </div>
                  <span>{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center">
            <h2 className="text-xl mb-4 font-semibold">
              Distribuição de Gastos
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filtro de Categorias */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  selectedCategory === category
                    ? "bg-white text-black font-bold"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl mb-4 font-semibold">
            Detalhamento de Transações
          </h2>
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse"
              aria-label="Transações financeiras"
            >
              <thead>
                <tr className="border-b border-gray-600">
                  {[
                    { key: "date", label: "Data" },
                    { key: "value", label: "Valor" },
                    { key: "category", label: "Categoria" },
                    { key: "description", label: "Descrição" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="py-3 px-4 text-left cursor-pointer"
                      onClick={() => toggleSort(column.key)}
                    >
                      <button className="font-semibold flex items-center focus:outline-none focus:text-blue-400">
                        {column.label}
                        <span className="ml-1">
                          {sortBy === column.key
                            ? sortDirection === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-700 hover:bg-gray-700 transition"
                    >
                      <td className="py-3 px-4">{t.date}</td>
                      <td className="py-3 px-4">{formatCurrency(t.value)}</td>
                      <td className="py-3 px-4 flex items-center">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: getCategoryColor(t.category),
                          }}
                          aria-hidden="true"
                        ></span>
                        {t.category}
                      </td>
                      <td className="py-3 px-4">{t.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-700">
                    <td colSpan="4" className="py-6 text-center text-gray-400">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
