import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";

// ==========================================
// 1. CONFIGURAÇÃO DO BANCO DE DADOS (FIREBASE)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC6KH3zMKK5as7-5qthqv_WeKX1IobhmtE",
  authDomain: "meu-album-2026-4d5d2.firebaseapp.com",
  projectId: "meu-album-2026-4d5d2",
  storageBucket: "meu-album-2026-4d5d2.firebasestorage.app",
  messagingSenderId: "1097875804967",
  appId: "1:1097875804967:web:a101700ff9b46b1c538f02",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 2. LISTA OFICIAL DE SELEÇÕES (48 PAÍSES)
// ==========================================
const listaPaises = [
  { id: 'MEX', nome: ' - México', code: 'mx' },
  { id: 'RSA', nome: ' - África do Sul', code: 'za' },
  { id: 'KOR', nome: ' - Coreia do Sul', code: 'kr' },
  { id: 'CZE', nome: ' - República Tcheca', code: 'cz' },
  { id: 'CAN', nome: ' - Canadá', code: 'ca' },
  { id: 'BIH', nome: ' - Bósnia e Herzegovina', code: 'ba' },
  { id: 'QAT', nome: ' - Catar', code: 'qa' },
  { id: 'SUI', nome: ' - Suíça', code: 'ch' },
  { id: 'BRA', nome: ' - Brasil', code: 'br' },
  { id: 'MAR', nome: ' - Marrocos', code: 'ma' },
  { id: 'HAI', nome: ' - Haiti', code: 'ht' },
  { id: 'SCO', nome: ' - Escócia', code: 'gb-sct' },
  { id: 'USA', nome: ' - Estados Unidos', code: 'us' },
  { id: 'PAR', nome: ' - Paraguai', code: 'py' },
  { id: 'AUS', nome: ' - Austrália', code: 'au' },
  { id: 'TUR', nome: ' - Turquia', code: 'tr' },
  { id: 'GER', nome: ' - Alemanha', code: 'de' },
  { id: 'CUW', nome: ' - Curaçao', code: 'cw' },
  { id: 'CIV', nome: ' - Costa do Marfim', code: 'ci' },
  { id: 'ECU', nome: ' - Equador', code: 'ec' },
  { id: 'NED', nome: ' - Holanda', code: 'nl' },
  { id: 'JPN', nome: ' - Japão', code: 'jp' },
  { id: 'SWE', nome: ' - Suécia', code: 'se' },
  { id: 'BEL', nome: ' - Bélgica', code: 'be' },
  { id: 'EGY', nome: ' - Egito', code: 'eg' },
  { id: 'IRN', nome: ' - Irã', code: 'ir' },
  { id: 'NZL', nome: ' - Nova Zelândia', code: 'nz' },
  { id: 'ESP', nome: ' - Espanha', code: 'es' },
  { id: 'CPV', nome: ' - Cabo Verde', code: 'cv' },
  { id: 'KSA', nome: ' - Arábia Saudita', code: 'sa' },
  { id: 'URU', nome: ' - Uruguai', code: 'uy' },
  { id: 'FRA', nome: ' - França', code: 'fr' },
  { id: 'SEN', nome: ' - Senegal', code: 'sn' },
  { id: 'IRQ', nome: ' - Iraque', code: 'iq' },
  { id: 'NOR', nome: ' - Noruega', code: 'no' },
  { id: 'ARG', nome: ' - Argentina', code: 'ar' },
  { id: 'ALG', nome: ' - Argélia', code: 'dz' },
  { id: 'AUT', nome: ' - Áustria', code: 'at' },
  { id: 'JOR', nome: ' - Jordânia', code: 'jo' },
  { id: 'POR', nome: ' - Portugal', code: 'pt' },
  { id: 'COD', nome: ' - R. D. do Congo', code: 'cd' },
  { id: 'UZB', nome: ' - Uzbequistão', code: 'uz' },
  { id: 'COL', nome: ' - Colômbia', code: 'co' },
  { id: 'TUN', nome: ' - Tunísia', code: 'tn' },
  { id: 'ENG', nome: ' - Inglaterra', code: 'gb-eng' },
  { id: 'PAN', nome: ' - Panamá', code: 'pa' },
  { id: 'CRO', nome: ' - Croácia', code: 'hr' },
  { id: 'GHA', nome: ' - Gana', code: 'gh' }
];

// ==========================================
// 3. CÓDIGO DA INTERFACE E LÓGICA DO APP
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [telaAtual, setTelaAtual] = useState('lista'); 
  const [paisAberto, setPaisAberto] = useState(null);
  const [meuAlbum, setMeuAlbum] = useState({});

  useEffect(() => {
    const desligarMonitor = onAuthStateChanged(auth, (loggedUser) => {
      setUser(loggedUser);
      if (!loggedUser) setMeuAlbum({});
    });
    return () => desligarMonitor();
  }, []);

  useEffect(() => {
    if (!user) return;
    const documentoDoUsuario = doc(db, "usuarios_figurinhas", user.uid);
    const escutarBanco = onSnapshot(documentoDoUsuario, (snapshot) => {
      if (snapshot.exists()) setMeuAlbum(snapshot.data());
    });
    return () => escutarBanco();
  }, [user]);

  const totalFigurinhasNoAlbum = listaPaises.length * 20;
  
  const dectectarFigurinhasColadas = () => {
    let coladas = 0;
    listaPaises.forEach(p => {
      for (let i = 1; i <= 20; i++) {
        if (meuAlbum[`${p.id}-${i}`] === true) coladas++;
      }
    });
    return coladas;
  };

  const quantasEuTenhoGeral = dectectarFigurinhasColadas();
  const quantasFaltamGeral = totalFigurinhasNoAlbum - quantasEuTenhoGeral;
  const porcentagemProgresso = Math.round((quantasEuTenhoGeral / totalFigurinhasNoAlbum) * 100) || 0;

  const totalRepetidasGeral = Object.keys(meuAlbum)
    .filter(key => key.endsWith('-rep'))
    .reduce((sum, key) => sum + (Number(meuAlbum[key]) || 0), 0);

  const contarFigurinhasDoPais = (paisId) => {
    let tenho = 0;
    let repetidas = 0;
    for (let i = 1; i <= 20; i++) {
      if (meuAlbum[`${paisId}-${i}`] === true) tenho++;
      const qtdRep = Number(meuAlbum[`${paisId}-${i}-rep`]) || 0;
      repetidas += qtdRep;
    }
    return { tenho, faltam: 20 - tenho, repetidas };
  };

  const clicarNoNumero = async (paisId, numero) => {
    if (!user) return;
    const UrbanKey = `${paisId}-${numero}`;
    const novoEstado = !meuAlbum[UrbanKey];
    const albumAtualizado = { ...meuAlbum, [UrbanKey]: novoEstado };
    
    await setDoc(doc(db, "usuarios_figurinhas", user.uid), albumAtualizado);
  };

  const alterarRepetida = async (paisId, numero, operacao) => {
    if (!user) return;
    const apiKey = `${paisId}-${numero}-rep`;
    const qtdAtual = Number(meuAlbum[apiKey]) || 0;
    
    let novaQtd = operacao === 'mais' ? qtdAtual + 1 : qtdAtual - 1;
    if (novaQtd < 0) novaQtd = 0;

    const albumAtualizado = { ...meuAlbum, [apiKey]: novaQtd };
    await setDoc(doc(db, "usuarios_figurinhas", user.uid), albumAtualizado);
  };

  // --- TELA DE LOGIN ---
  if (!user) {
    return (
      <div id="tela-login">
        <div className="login-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="assets/album.png" 
            alt="Álbum Oficial Copa 2026"
            style={{ width: '130px', height: 'auto', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 6px 16px rgba(0,0,0,0.6)' }}
          />
          <h1>Registro de Figurinhas 2026</h1>
          <p>Entre com seu e-mail. Suas marcações ficam salvas de forma individual sem misturar com ninguém!</p>
          <button onClick={() => signInWithPopup(auth, provider)} className="btn btn-primary">
            <i className="fa-brands fa-google"></i> Entrar com Conta Google
          </button>
        </div>
      </div>
    );
  }

  // --- TELA 1: LISTA INICIAL DE SELEÇÕES ---
  if (telaAtual === 'lista') {
    return (
      <div>
        <header>
          <div className="header-container">
            <div className="user-info">
              <i className="fa-solid fa-user"></i>
              <span>{user.displayName || "Usuário"}</span>
            </div>
            <button onClick={() => signOut(auth)} className="btn-logout">
              <i className="fa-solid fa-right-from-bracket"></i> Sair
            </button>
          </div>
        </header>

        <div className="main-container" style={{ maxWidth: '1200px' }}>
          {/* Dashboard de Progresso */}
          <div className="dashboard-progresso">
            <div className="dashboard-header">
              <h2><i className="fa-solid fa-chart-line"></i> Seu Progresso ({porcentagemProgresso}%)</h2>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${porcentagemProgresso}%` }}></div>
            </div>
            <div className="cards-stats">
              <div className="stat-card total">
                <div className="label">Total</div>
                <div className="value">{totalFigurinhasNoAlbum}</div>
              </div>
              <div className="stat-card tenho">
                <div className="label">Tenho</div>
                <div className="value">{quantasEuTenhoGeral}</div>
              </div>
              <div className="stat-card faltam">
                <div className="label">Faltam</div>
                <div className="value">{quantasFaltamGeral}</div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setTelaAtual('repetidas')}
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '24px', background: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700' }}
          >
            <span>🔄 Ver Minhas Repetidas ({totalRepetidasGeral})</span>
          </button>

          <h2 className="text-gray-400 font-bold text-xs tracking-wider mb-4 uppercase">Seleções (Toque para abrir)</h2>
          
          <div className="grid-paises">
            {listaPaises.map((pais) => {
              const { tenho, repetidas } = contarFigurinhasDoPais(pais.id);
              const completo = tenho === 20;
              const porcentagemPais = (tenho / 20) * 100;
              return (
                <div 
                  key={pais.id}
                  onClick={() => { setPaisAberto(pais); setTelaAtual('pais'); }}
                  className={`pais-card ${completo ? 'completo' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '90px' }}
                >
                  <div className="pais-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                    
                    {/* Bloco da Esquerda: Bandeira + Nome + Sigla */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '0' }}>
                      <img 
                        src={`https://flagcdn.com/w40/${pais.code}.png`} 
                        alt={`Bandeira de ${pais.nome}`}
                        style={{ width: '32px', height: 'auto', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', flexShrink: '0' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                        <span className="pais-nome" style={{ fontSize: '1.1rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                          {pais.nome.replace(' - ', '')}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', opacity: '0.4', textTransform: 'uppercase' }}>
                          {pais.id}
                        </span>
                      </div>
                    </div>

                    {/* Bloco da Direita: Contador fixo */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: '0', minWidth: '55px' }}>
                      <span className="pais-badge" style={{ whiteSpace: 'nowrap' }}>{tenho} / 20</span>
                      {repetidas > 0 ? (
                        <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '700', marginTop: '2px', whiteSpace: 'nowrap' }}>+{repetidas} rep</span>
                      ) : (
                        <span style={{ fontSize: '10px', opacity: '0', marginTop: '2px' }}>-</span>
                      )}
                    </div>

                  </div>
                  
                  <div className="mini-progress-bg" style={{ marginTop: 'auto' }}>
                    <div className="mini-progress-bar" style={{ width: `${porcentagemPais}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- TELA 2: LISTA DE NÚMEROS DE CADA PAÍS ---
  if (telaAtual === 'pais' && paisAberto) {
    const { tenho: localTenho, faltam: localFaltam, repetidas: localRepetidas } = contarFigurinhasDoPais(paisAberto.id);
    const vinteNumeros = Array.from({ length: 20 }, (_, i) => i + 1);

    return (
      <div>
        <header>
          <div className="header-container">
            <button onClick={() => setTelaAtual('lista')} className="btn-logout" style={{ borderColor: 'var(--cor-primaria)', color: 'var(--cor-primaria)' }}>
              <i className="fa-solid fa-arrow-left"></i> Voltar para a Lista
            </button>
          </div>
        </header>

        <div className="main-container" style={{ maxWidth: '500px' }}>
          <div className="pais-card completo" style={{ cursor: 'default', marginBottom: '24px', padding: '20px' }}>
            <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src={`https://flagcdn.com/w80/${paisAberto.code}.png`} 
                alt={`Bandeira de ${paisAberto.nome}`}
                style={{ width: '64px', height: 'auto', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }}
              />
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{paisAberto.nome.replace(' - ', '')}</h2>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px', fontSize: '0.75rem', fontWeight: '700' }}>
                  <span style={{ opacity: '0.5', color: '#fff' }}>Sigla: {paisAberto.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '0.75rem', fontWeight: '700', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--cor-sucesso)', background: 'var(--cor-sucesso-bg)', padding: '2px 8px', borderRadius: '6px' }}>Tenho: {localTenho}</span>
                  <span style={{ color: 'var(--cor-perigo)', background: 'rgba(239, 68, 68, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>Faltam: {localFaltam}</span>
                  {localRepetidas > 0 && (
                    <span style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>Repetidas: {localRepetidas}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-gray-400 font-bold text-xs tracking-wider mb-4 uppercase">Clique no número para colar ou gerencie as repetidas:</h3>
          
          <div className="grid-figurinhas" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {vinteNumeros.map((num) => {
              const marcado = meuAlbum[`${paisAberto.id}-${num}`] === true;
              const qtdRepetida = Number(meuAlbum[`${paisAberto.id}-${num}-rep`]) || 0;
              
              return (
                <div 
                  key={num} 
                  style={{ background: 'var(--bg-card)', borderRadius: '12px', border: marcado ? '2px solid var(--cor-sucesso)' : '1px solid #2e2e36', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}
                >
                  <button
                    onClick={() => clicarNoNumero(paisAberto.id, num)}
                    className={`figurinha-btn ${marcado ? 'marcado' : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', height: 'auto', padding: '6px 0', border: 'none', background: marcado ? 'var(--cor-sucesso)' : 'transparent', width: '100%' }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{num}</span>
                    <span style={{ fontSize: '8px', fontWeight: '600', opacity: '0.6', textTransform: 'uppercase' }}>
                      {num === 1 ? 'Escudo' : num === 13 ? 'Time' : 'Jogador'}
                    </span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px 6px' }}>
                    <button 
                      onClick={() => alterarRepetida(paisAberto.id, num, 'menos')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', padding: '0 6px' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: qtdRepetida > 0 ? '#3b82f6' : 'var(--texto-secundario)' }}>
                      {qtdRepetida} rep
                    </span>
                    <button 
                      onClick={() => alterarRepetida(paisAberto.id, num, 'mais')}
                      style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', padding: '0 6px' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- TELA 3: PÁGINA EXCLUSIVA SÓ PARA REPETIDAS ---
  if (telaAtual === 'repetidas') {
    const listaRepetidasAgrupadas = listaPaises.map(pais => {
      const itemsDoPais = [];
      for (let num = 1; num <= 20; num++) {
        const qtd = Number(meuAlbum[`${pais.id}-${num}-rep`]) || 0;
        if (qtd > 0) {
          itemsDoPais.push({ num, qtd });
        }
      }
      return { ...pais, itens: itemsDoPais };
    }).filter(pais => pais.itens.length > 0);

    return (
      <div>
        <header>
          <div className="header-container">
            <button onClick={() => setTelaAtual('lista')} className="btn-logout" style={{ borderColor: 'var(--cor-primaria)', color: 'var(--cor-primaria)' }}>
              <i className="fa-solid fa-arrow-left"></i> Voltar para o Álbum
            </button>
          </div>
        </header>

        <div className="main-container" style={{ maxWidth: '500px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3b82f6' }}>🔄 Banco de Repetidas</h2>
            <p style={{ fontSize: '0.85rem', opacity: '0.7', marginTop: '4px' }}>Aqui você vê todas as figurinhas que tem sobrando para trocar!</p>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '10px', color: '#fff' }}>{totalRepetidasGeral}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#3b82f6' }}>Total de Figurinhas</span>
          </div>

          <h3 className="text-gray-400 font-bold text-xs tracking-wider mb-4 uppercase">Minhas Sobras por País:</h3>

          {listaRepetidasAgrupadas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--texto-secundario)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed #2e2e36' }}>
              <p style={{ fontSize: '1.2rem' }}>🤷‍♂️ Nenhuma repetida encontrada.</p>
              <p style={{ fontSize: '0.8rem', opacity: '0.6', marginTop: '4px' }}>Adicione figurinhas repetidas entrando na página de qualquer seleção.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {listaRepetidasAgrupadas.map(pais => (
                <div key={pais.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid #2e2e36' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                    <img 
                      src={`https://flagcdn.com/w40/${pais.code}.png`} 
                      alt={`Bandeira de ${pais.nome}`}
                      style={{ width: '28px', height: 'auto', borderRadius: '3px' }}
                    />
                    <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{pais.nome.replace(' - ', '')}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', opacity: '0.4' }}>({pais.id})</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {pais.itens.map(item => (
                      <div 
                        key={item.num} 
                        style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: '800' }}>Nº {item.num}</span>
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '800', marginTop: '2px', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                          {item.qtd}x rep
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}