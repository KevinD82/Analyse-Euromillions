import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import './styles.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [grids, setGrids] = useState([]);

  const normalizeKeys = (obj) => {
    const newObj = {};
    for (let key in obj) {
      const normalized = key.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '').toLowerCase();
      newObj[normalized] = obj[key];
    }
    return newObj;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        const normalizedData = json.map(row => normalizeKeys(row));
        setData(normalizedData);
        setError('');
      } catch (err) {
        setError('Erreur lors de la lecture du fichier. Vérifiez le format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchLatestDraws = async () => {
    try {
      // Placeholder API (à remplacer par une source réelle)
      const response = await fetch('https://euromillions.api.pedromealha.dev');
      const json = await response.json();
      const normalizedData = json.map(row => normalizeKeys(row));
      setData(normalizedData);
      if (normalizedData.length > 0) {
        alert(`Dernier tirage : ${normalizedData[0].date}`);
      }
    } catch (err) {
      setError('Impossible de récupérer les tirages en ligne.');
    }
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

  const renderCharts = () => {
    if (!data) return null;

    const allNums = [];
    const allStars = [];
    data.forEach(row => {
      ['num1','num2','num3','num4','num5'].forEach(k => allNums.push(row[k]));
      ['etoile1','etoile2'].forEach(k => allStars.push(row[k]));
    });

    const numCounts = {};
    allNums.forEach(n => numCounts[n] = (numCounts[n]||0)+1);
    const starCounts = {};
    allStars.forEach(s => starCounts[s] = (starCounts[s]||0)+1);

    const pairs = allNums.filter(n => n % 2 === 0).length;
    const impairs = allNums.length - pairs;

    const sums = data.map(row => ['num1','num2','num3','num4','num5'].reduce((acc,k)=>acc+(row[k]||0),0));
    const gaps = data.map(row => {
      const nums = ['num1','num2','num3','num4','num5'].map(k=>row[k]);
      return Math.max(...nums)-Math.min(...nums);
    });

    const ranges = { '0-9':0,'10-19':0,'20-29':0,'30-39':0,'40-50':0 };
    allNums.forEach(n => {
      if(n<=9) ranges['0-9']++; else if(n<=19) ranges['10-19']++; else if(n<=29) ranges['20-29']++; else if(n<=39) ranges['30-39']++; else ranges['40-50']++;
    });

    const numChart = {
      labels: Object.keys(numCounts),
      datasets: [{ label: 'Fréquence des numéros', data: Object.values(numCounts), backgroundColor: 'rgba(54,162,235,0.6)' }]
    };
    const starChart = {
      labels: Object.keys(starCounts),
      datasets: [{ label: 'Fréquence des étoiles', data: Object.values(starCounts), backgroundColor: 'rgba(255,99,132,0.6)' }]
    };
    const pairChart = {
      labels: ['Pairs','Impairs'],
      datasets: [{ label: 'Répartition pair/impair', data: [pairs, impairs], backgroundColor: ['rgba(75,192,192,0.6)','rgba(255,206,86,0.6)'] }]
    };
    const rangeChart = {
      labels: Object.keys(ranges),
      datasets: [{ label: 'Répartition par dizaines', data: Object.values(ranges), backgroundColor: 'rgba(153,102,255,0.6)' }]
    };

    return (
      <div>
        <h2>Analyses</h2>
        <Bar data={numChart} />
        <Bar data={starChart} />
        <Bar data={pairChart} />
        <Bar data={rangeChart} />
        <p>Somme moyenne des numéros: {Math.round(sums.reduce((a,b)=>a+b,0)/sums.length)}</p>
        <p>Écart moyen entre numéros: {Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length)}</p>
      </div>
    );
  };

  return (
    <div className='container'>
      <h1>EuroMillions Analyst Complet</h1>
      <input type='file' accept='.xlsx,.csv' onChange={handleFileUpload} />
      <button onClick={fetchLatestDraws}>Mettre à jour les tirages</button>
      {error && <p style={{color:'red'}}>{error}</p>}
      {data && <p>{data.length} tirages chargés</p>}
      <button onClick={generateGrids}>Générer 5 grilles optimisées</button>
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
