import React, { useState, useEffect } from "react";

const FinanceDashboard = () => {
  // Estados para controle
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState("Fevereiro");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Dados de transações por período
  const transactionsData = {
    "2023-Janeiro": [
      {
        id: 1,
        date: "05/01/2023",
        value: 35.0,
        category: "Comida",
        description: "Restaurante",
      },
      {
        id: 2,
        date: "12/01/2023",
        value: 120.0,
        category: "Casa",
        description: "Internet",
      },
      {
        id: 3,
        date: "18/01/2023",
        value: 80.0,
        category: "Carro",
        description: "Estacionamento",
      },
      {
        id: 4,
        date: "25/01/2023",
        value: 45.0,
        category: "Lazer",
        description: "Livros",
      },
    ],
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
      {
        id: 5,
        date: "20/02/2024",
        value: 45.0,
        category: "Comida",
        description: "Delivery",
      },
      {
        id: 6,
        date: "25/02/2024",
        value: 120.0,
        category: "Casa",
        description: "Internet",
      },
    ],
  };

  // Estado para transações filtradas
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Dados de despesas por categoria (calculados das transações)
  const [expenses, setExpenses] = useState({});

  // Efeito para recalcular dados quando os filtros mudam
  useEffect(() => {
    const key = `${selectedYear}-${selectedMonth}`;
    let transactions = transactionsData[key] || [];

    // Aplicar filtro de categoria
    if (selectedCategory !== "Todas") {
      transactions = transactions.filter(
        (t) => t.category === selectedCategory
      );
    }

    // Ordenar transações
    transactions.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        // Converter datas para formato comparável (DD/MM/YYYY)
        const dateA = a.date.split("/").reverse().join("");
        const dateB = b.date.split("/").reverse().join("");
        comparison = dateA.localeCompare(dateB);
      } else if (sortBy === "value") {
        comparison = a.value - b.value;
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === "description") {
        comparison = a.description.localeCompare(b.description);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredTransactions(transactions);

    // Calcular totais por categoria
    const categoryTotals = {};
    transactionsData[key]?.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.value;
    });

    setExpenses(categoryTotals);
  }, [selectedYear, selectedMonth, selectedCategory, sortBy, sortDirection]);

  // Total de gastos
  const total =
    Object.values(expenses).reduce((sum, value) => sum + value, 0) || 0;

  // Calcula porcentagens e ângulos para o gráfico
  const calculateSectorData = () => {
    let startAngle = 0;
    const sectors = [];

    Object.entries(expenses).forEach(([category, value]) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const endAngle = startAngle + angle;

      // Converte ângulos para radianos para os cálculos de coordenadas
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const r = 150; // raio do círculo
      const cx = 300; // centro x
      const cy = 300; // centro y

      // Calcula pontos para o caminho do arco
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      // Determina se é um arco maior que 180 graus
      const largeArcFlag = angle > 180 ? 1 : 0;

      // Constrói o path SVG para o setor
      const path = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

      // Calcula posição do texto
      const textAngle = startAngle + angle / 2;
      const textRad = ((textAngle - 90) * Math.PI) / 180;
      const textDistance = r * 0.7; // 70% do raio
      const textX = cx + textDistance * Math.cos(textRad);
      const textY = cy + textDistance * Math.sin(textRad);

      // Calcula posição do valor
      const valueDistance = r * 0.5; // 50% do raio
      const valueX = cx + valueDistance * Math.cos(textRad);
      const valueY = cy + valueDistance * Math.sin(textRad);

      sectors.push({
        category,
        value,
        percentage,
        path,
        textX,
        textY,
        valueX,
        valueY,
      });

      startAngle = endAngle;
    });

    return sectors;
  };

  const sectorData = calculateSectorData();

  // Lista de anos e meses para os filtros
  const years = [2023, 2024, 2025];
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Categorias disponíveis
  const categories = ["Todas", "Carro", "Casa", "Comida", "Lazer"];

  // Função para alternar a ordenação
  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Categoria para cores
  const getCategoryColor = (category) => {
    const colors = {
      Carro: "#4A90E2",
      Casa: "#50E3C2",
      Comida: "#F5A623",
      Lazer: "#D0021B",
    };
    return colors[category] || "#777777";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto w-full rounded-lg border border-gray-700 p-6">
        {/* Cabeçalho com filtros de ano e mês */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-8 relative">
            {years.map((year) => (
              <div key={year} className="flex flex-col items-center">
                <div
                  className={`text-xl font-bold mb-2 cursor-pointer ${
                    selectedYear === year ? "text-blue-400" : "text-white"
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </div>
                <div className="border-t-2 w-24 border-white/70"></div>

                {year === selectedYear && (
                  <div className="relative">
                    <button
                      className="mt-2 px-4 py-1 rounded bg-blue-600 flex items-center"
                      onClick={() => setShowMonthSelector(!showMonthSelector)}
                    >
                      {selectedMonth} ▼
                    </button>

                    {showMonthSelector && (
                      <div className="absolute left-0 mt-1 bg-gray-800 rounded shadow-lg z-10 w-32">
                        {months.map((month) => (
                          <div
                            key={month}
                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedMonth(month);
                              setShowMonthSelector(false);
                            }}
                          >
                            {month}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="bg-white text-black px-4 py-2 rounded font-semibold">
            Login
          </button>
        </div>

        {/* Conteúdo principal com gráfico e filtros */}
        <div className="flex flex-col lg:flex-row">
          {/* Gráfico de pizza */}
          <div className="w-full lg:w-2/3">
            <svg viewBox="0 0 600 600" className="w-full">
              {sectorData.length > 0 ? (
                sectorData.map((sector, index) => (
                  <g key={index}>
                    <path
                      d={sector.path}
                      fill={getCategoryColor(sector.category)}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={sector.textX}
                      y={sector.textY}
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {sector.category}
                    </text>
                    <text
                      x={sector.valueX}
                      y={sector.valueY}
                      textAnchor="middle"
                      fill="white"
                      fontSize="18"
                      fontWeight="bold"
                    >
                      R${Math.round(sector.value)}
                    </text>
                  </g>
                ))
              ) : (
                <text
                  x="300"
                  y="300"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                >
                  Sem dados para o período selecionado
                </text>
              )}
            </svg>
          </div>

          {/* Painel lateral de filtros */}
          <div className="w-full lg:w-1/3 pl-0 lg:pl-8 mt-6 lg:mt-0">
            <div className="mb-8">
              <h3 className="text-xl mb-4">Categorias – Filtro:</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`p-2 rounded cursor-pointer ${
                      selectedCategory === category
                        ? "bg-white text-black font-bold"
                        : "hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de lançamentos */}
        <div className="mt-8">
          <h3 className="text-xl mb-4">Lançamentos {selectedMonth}:</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-3 px-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSort("date")}
                    >
                      <span>Data</span>
                      <span className="ml-1">
                        {sortBy === "date" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                        {sortBy !== "date" && "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSort("value")}
                    >
                      <span>Valor</span>
                      <span className="ml-1">
                        {sortBy === "value" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                        {sortBy !== "value" && "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSort("category")}
                    >
                      <span>Categoria</span>
                      <span className="ml-1">
                        {sortBy === "category" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                        {sortBy !== "category" && "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSort("description")}
                    >
                      <span>Descrição</span>
                      <span className="ml-1">
                        {sortBy === "description" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                        {sortBy !== "description" && "↕"}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">{transaction.date}</td>
                      <td className="py-3 px-4">
                        R${transaction.value.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: getCategoryColor(
                              transaction.category
                            ),
                          }}
                        ></span>
                        {transaction.category}
                      </td>
                      <td className="py-3 px-4">{transaction.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-700">
                    <td colSpan="4" className="py-6 text-center text-gray-400">
                      Nenhuma transação encontrada para o período e filtros
                      selecionados
                    </td>
                  </tr>
                )}

                {/* Linhas extras para preencher espaço se necessário */}
                {filteredTransactions.length > 0 &&
                  filteredTransactions.length < 5 &&
                  Array.from({ length: 5 - filteredTransactions.length }).map(
                    (_, index) => (
                      <tr
                        key={`empty-${index}`}
                        className="border-b border-gray-700"
                      >
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                      </tr>
                    )
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
