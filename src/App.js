import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import './styles.css';

function App() {
  const [data, setData] = useState(null);
  const [grids, setGrids] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      setData(json);
    };
    reader.readAsBinaryString(file);
  };

  const generateGrids = () => {
    const numHot = [21, 42, 35, 29, 19];
    const numCold = [50, 46, 34, 30, 23];
    const starsFrequent = [2, 3, 5, 6, 8];
    const newGrids = [];
    for (let i = 0; i < 5; i++) {
      const grid = [];
      grid.push(numHot[Math.floor(Math.random() * numHot.length)]);
      grid.push(numCold[Math.floor(Math.random() * numCold.length)]);
      while (grid.length < 5) {
        const n = Math.floor(Math.random() * 50) + 1;
        if (!grid.includes(n)) grid.push(n);
      }
      grid.sort((a, b) => a - b);
      const stars = [];
      while (stars.length < 2) {
        const s = starsFrequent[Math.floor(Math.random() * starsFrequent.length)];
        if (!stars.includes(s)) stars.push(s);
      }
      newGrids.push({ grid, stars });
    }
    setGrids(newGrids);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    if (data) {
      const wsData = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, wsData, 'Tirages');
    }
    if (grids.length > 0) {
      const wsGrids = XLSX.utils.json_to_sheet(grids.map((g, i) => ({ Grille: i+1, Numéros: g.grid.join(', '), Étoiles: g.stars.join(', ') })));
      XLSX.utils.book_append_sheet(wb, wsGrids, 'Grilles');
    }
    XLSX.writeFile(wb, 'rapport_euromillions.xlsx');
  };

  const renderCharts = () => {
    if (!data) return null;
    const allNums = [];
    const allStars = [];
    data.forEach(row => {
      ['Num1','Num2','Num3','Num4','Num5'].forEach(k => allNums.push(row[k]));
      ['Étoile1','Étoile2'].forEach(k => allStars.push(row[k]));
    });
    const numCounts = {};
    allNums.forEach(n => numCounts[n] = (numCounts[n]||0)+1);
    const starCounts = {};
    allStars.forEach(s => starCounts[s] = (starCounts[s]||0)+1);

    const numChart = {
      labels: Object.keys(numCounts),
      datasets: [{ label: 'Fréquence des numéros', data: Object.values(numCounts), backgroundColor: 'rgba(54,162,235,0.6)' }]
    };
    const starChart = {
      labels: Object.keys(starCounts),
      datasets: [{ label: 'Fréquence des étoiles', data: Object.values(starCounts), backgroundColor: 'rgba(255,99,132,0.6)' }]
    };

    return (
      <div>
        <h2>Analyse des tirages</h2>
        <Bar data={numChart} />
        <Bar data={starChart} />
      </div>
    );
  };

  return (
    <div className='container'>
      <h1>EuroMillions Analyst Avancé</h1>
      <input type='file' accept='.xlsx,.csv' onChange={handleFileUpload} />
      {data && <p>{data.length} tirages chargés</p>}
      <button onClick={generateGrids}>Générer 5 grilles optimisées</button>
      <button onClick={exportExcel}>Télécharger le rapport Excel</button>
      {renderCharts()}
      {grids.length > 0 && (
        <div>
          <h2>Grilles générées :</h2>
          {grids.map((g, i) => (
            <p key={i}>Grille {i+1}: {g.grid.join(', ')} | Étoiles: {g.stars.join(', ')}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;