import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, collection, getDocs, addDoc, updateDoc, query, where, getDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import imagemAlbum from './assets/album.png';

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
  { id: 'MEX', nome: 'México', code: 'mx' },
  { id: 'RSA', nome: 'África do Sul', code: 'za' },
  { id: 'KOR', nome: 'Coreia do Sul', code: 'kr' },
  { id: 'CZE', nome: 'República Tcheca', code: 'cz' },
  { id: 'CAN', nome: 'Canadá', code: 'ca' },
  { id: 'BIH', nome: 'Bósnia e Herzegovina', code: 'ba' },
  { id: 'QAT', nome: 'Catar', code: 'qa' },
  { id: 'SUI', nome: 'Suíça', code: 'ch' },
  { id: 'BRA', nome: 'Brasil', code: 'br' },
  { id: 'MAR', nome: 'Marrocos', code: 'ma' },
  { id: 'HAI', nome: 'Haiti', code: 'ht' },
  { id: 'SCO', nome: 'Escócia', code: 'gb-sct' },
  { id: 'USA', nome: 'Estados Unidos', code: 'us' },
  { id: 'PAR', nome: 'Paraguai', code: 'py' },
  { id: 'AUS', nome: 'Austrália', code: 'au' },
  { id: 'TUR', nome: 'Turquia', code: 'tr' },
  { id: 'GER', nome: 'Alemanha', code: 'de' },
  { id: 'CUW', nome: 'Curaçao', code: 'cw' },
  { id: 'CIV', nome: 'Costa do Marfim', code: 'ci' },
  { id: 'ECU', nome: 'Equador', code: 'ec' },
  { id: 'NED', nome: 'Holanda', code: 'nl' },
  { id: 'JPN', nome: 'Japão', code: 'jp' },
  { id: 'SWE', nome: 'Suécia', code: 'se' },
  { id: 'TUN', nome: 'Tunísia', code: 'tn' },
  { id: 'BEL', nome: 'Bélgica', code: 'be' },
  { id: 'EGY', nome: 'Egito', code: 'eg' },
  { id: 'IRN', nome: 'Irã', code: 'ir' },
  { id: 'NZL', nome: 'Nova Zelândia', code: 'nz' },
  { id: 'ESP', nome: 'Espanha', code: 'es' },
  { id: 'CPV', nome: 'Cabo Verde', code: 'cv' },
  { id: 'KSA', nome: 'Arábia Saudita', code: 'sa' },
  { id: 'URU', nome: 'Uruguai', code: 'uy' },
  { id: 'FRA', nome: 'França', code: 'fr' },
  { id: 'SEN', nome: 'Senegal', code: 'sn' },
  { id: 'IRQ', nome: 'Iraque', code: 'iq' },
  { id: 'NOR', nome: 'Noruega', code: 'no' },
  { id: 'ARG', nome: 'Argentina', code: 'ar' },
  { id: 'ALG', nome: 'Argélia', code: 'dz' },
  { id: 'AUT', nome: 'Áustria', code: 'at' },
  { id: 'JOR', nome: 'Jordânia', code: 'jo' },
  { id: 'POR', nome: 'Portugal', code: 'pt' },
  { id: 'COD', nome: 'R. D. do Congo', code: 'cd' },
  { id: 'UZB', nome: 'Uzbequistão', code: 'uz' },
  { id: 'COL', nome: 'Colômbia', code: 'co' },
  { id: 'ENG', nome: 'Inglaterra', code: 'gb-eng' },
  { id: 'CRO', nome: 'Croácia', code: 'hr' },
  { id: 'GHA', nome: 'Gana', code: 'gh' },
  { id: 'PAN', nome: 'Panamá', code: 'pa' }
];
const vinteNumeros = Array.from({ length: 20 }, (_, i) => i + 1);

// ==========================================
// 3. CÓDIGO DA INTERFACE E LÓGICA DO APP
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [telaAtual, setTelaAtual] = useState('lista'); 
  const [meuAlbum, setMeuAlbum] = useState({});
  const [albunsAlheios, setAlbunsAlheios] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [historicoTrocas, setHistoricoTrocas] = useState([]);
  const [filtroDashboard, setFiltroDashboard] = useState('todos'); // 'todos' | 'tenho' | 'faltam'
  
  const [idAnfitriao, setIdAnfitriao] = useState(null);
  const [dadosAnfitriao, setDadosAnfitriao] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const idConvite = params.get('convite');
      if (idConvite) {
        setIdAnfitriao(idConvite);
      }
    }
  }, []);

  useEffect(() => {
    const desligarMonitor = onAuthStateChanged(auth, (loggedUser) => {
      setUser(loggedUser);
      if (!loggedUser) {
        setMeuAlbum({});
        setAlbunsAlheios([]);
        setNotificacoes([]);
        setHistoricoTrocas([]);
        setDadosAnfitriao(null);
      }
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

  useEffect(() => {
    if (!user || !idAnfitriao) return;
    
    const buscarAnfitriao = async () => {
      try {
        const docRef = doc(db, "compartilhamentos_publicos", idAnfitriao);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setDadosAnfitriao(snap.data());
          setTelaAtual('visualizar_convite');
        }
      } catch (err) {
        console.error("Erro ao buscar dados do convite:", err);
      }
    };
    buscarAnfitriao();
  }, [user, idAnfitriao]);

  useEffect(() => {
    if (!user) return;
    const qAvisos = query(
      collection(db, "pedidos_trocas"),
      where("deUid", "==", user.uid),
      where("status", "==", "aceito")
    );

    const escutarAvisosReversos = onSnapshot(qAvisos, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const dadosPedido = change.doc.data();
          alert(`🎉 Sucesso! O pedido da figurinha ${dadosPedido.paisId} Nº ${dadosPedido.numero} foi aceito e ela já foi colada automaticamente no seu álbum!`);
          
          const pedidoRef = doc(db, "pedidos_trocas", change.doc.id);
          updateDoc(pedidoRef, { status: "arquivado_sucesso" });
        }
      });
    });

    return () => escutarAvisosReversos();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Escuta requisições pendentes
    const qPendentes = query(
      collection(db, "pedidos_trocas"), 
      where("paraUid", "==", user.uid),
      where("status", "==", "pendente")
    );
    
    const escutarPedidos = onSnapshot(qPendentes, (snapshot) => {
      const listaPedidos = [];
      snapshot.forEach((doc) => {
        listaPedidos.push({ id: doc.id, ...doc.data() });
      });
      setNotificacoes(listaPedidos);
    });

    // Escuta histórico duplo direto do banco (Ações concluídas)
    const qHistorico = query(
      collection(db, "pedidos_trocas"),
      where("paraUid", "==", user.uid),
      where("status", "in", ["aceito", "recusado", "arquivado_sucesso", "recusado_sem_estoque"])
    );

    const escutarHistorico = onSnapshot(qHistorico, (snapshot) => {
      const listaHistorico = [];
      snapshot.forEach((doc) => {
        listaHistorico.push({ id: doc.id, ...doc.data() });
      });
      setHistoricoTrocas(listaHistorico);
    });
    
    return () => {
      escurarPedidos();
      escutarHistorico();
    };
  }, [user]);

  const carregarAlbunsDoApp = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "compartilhamentos_publicos"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== user?.uid) {
          lista.push({ uid: doc.id, ...doc.data() });
        }
      });
      setAlbunsAlheios(lista);
      setTelaAtual('comunidade');
    } catch (e) {
      console.error("Erro ao carregar trocas: ", e);
    }
  };

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
    return { tenho, repetidas };
  };

  const obtenerDadosRepetidas = (albumData = meuAlbum) => {
    return listaPaises.map(pais => {
      const itemsDoPais = [];
      for (let num = 1; num <= 20; num++) {
        const qtd = Number(albumData[`${pais.id}-${num}-rep`]) || 0;
        if (qtd > 0) itemsDoPais.push({ num, qtd });
      }
      return { ...pais, itens: itemsDoPais };
    }).filter(pais => pais.itens.length > 0);
  };

  const obterRepetidasFiltradasParaMim = (albumAnfitriao) => {
    return listaPaises.map(pais => {
      const itensQueMeFaltam = [];
      for (let num = 1; num <= 20; num++) {
        const qtdRepetidaAmigo = Number(albumAnfitriao[`${pais.id}-${num}-rep`]) || 0;
        const euJaTenhoColada = meuAlbum[`${pais.id}-${num}`] === true;
        
        if (qtdRepetidaAmigo > 0 && !euJaTenhoColada) {
          itensQueMeFaltam.push({ num, qtd: qtdRepetidaAmigo });
        }
      }
      return { ...pais, itens: itensQueMeFaltam };
    }).filter(pais => pais.itens.length > 0);
  };

  const salvarNoBancoCompleto = async (novoAlbum) => {
    if (!user) return;
    await setDoc(doc(db, "usuarios_figurinhas", user.uid), novoAlbum);
    await setDoc(doc(db, "compartilhamentos_publicos", user.uid), {
      nomeDono: user.displayName || "Amigo",
      album: novoAlbum,
      atualizadoEm: new Date().toISOString()
    });
  };

  const clicarNoNumero = async (paisId, numero) => {
    const UrbanKey = `${paisId}-${numero}`;
    const novoEstado = !meuAlbum[UrbanKey];
    const albumAtualizado = { ...meuAlbum, [UrbanKey]: novoEstado };
    await salvarNoBancoCompleto(albumAtualizado);
  };

  const alterarRepetida = async (paisId, numero, operacao) => {
    const apiKey = `${paisId}-${numero}-rep`;
    const qtdAtual = Number(meuAlbum[apiKey]) || 0;
    
    let novaQtd = operacao === 'mais' ? qtdAtual + 1 : qtdAtual - 1;
    if (novaQtd < 0) novaQtd = 0;

    const albumAtualizado = { ...meuAlbum, [apiKey]: novaQtd };
    await salvarNoBancoCompleto(albumAtualizado);
  };

  const sinalizarInteresse = async (donoUid, donoNome, itemPais, itemNum) => {
    try {
      await addDoc(collection(db, "pedidos_trocas"), {
        deUid: user.uid,
        deNome: user.displayName || "Alguém",
        paraUid: donoUid,
        paraNome: donoNome,
        paisId: itemPais,
        numero: itemNum,
        status: "pendente",
        dataCriacao: new Date().toISOString()
      });
      alert(`Pedido enviado! O ${donoNome} recebeu o alerta no app para te passar a figurinha ${itemPais} ${itemNum}.`);
    } catch(e) {
      console.error(e);
    }
  };

  const responderTroca = async (pedidoId, acao, paisId, numero, deUid) => {
    try {
      const pedidoRef = doc(db, "pedidos_trocas", pedidoId);
      
      if (acao === 'aceitar') {
        const apiKey = `${paisId}-${numero}-rep`;
        const qtdAtual = Number(meuAlbum[apiKey]) || 0;
        
        if (qtdAtual <= 0) {
          alert("Você não tem mais essa figurinha repetida no seu estoque!");
          await updateDoc(pedidoRef, { status: "recusado_sem_estoque" });
          setNotificacoes(prev => prev.filter(p => p.id !== pedidoId));
          return;
        }

        const meuAlbumAtualizado = { ...meuAlbum, [apiKey]: qtdAtual - 1 };
        await salvarNoBancoCompleto(meuAlbumAtualizado);

        const amigoAlbumRef = doc(db, "usuarios_figurinhas", deUid);
        const amigoCompartilhadoRef = doc(db, "compartilhamentos_publicos", deUid);
        
        const snapAmigo = await getDoc(amigoAlbumRef);
        let albumAmigoDados = snapAmigo.exists() ? snapAmigo.data() : {};
        
        const chaveFigurinhaComum = `${paisId}-${numero}`;
        albumAmigoDados[chaveFigurinhaComum] = true;

        await setDoc(amigoAlbumRef, albumAmigoDados);
        await updateDoc(amigoCompartilhadoRef, {
          album: albumAmigoDados,
          atualizadoEm: new Date().toISOString()
        });

        await updateDoc(pedidoRef, { status: "aceito" });
        setNotificacoes(prev => prev.filter(p => p.id !== pedidoId));
        alert(`✔ Troca processada! A figurinha ${paisId} Nº ${numero} foi retirada das suas repetidas e colada no álbum do seu amigo.`);
      } else {
        await updateDoc(pedidoRef, { status: "recusado" });
        setNotificacoes(prev => prev.filter(p => p.id !== pedidoId));
        alert("Troca recusada.");
      }
    } catch(e) {
      console.error("Erro ao processar troca bivalente: ", e);
    }
  };

  const compartirWhatsApp = () => {
    const repetidas = obtenerDadosRepetidas();
    if (repetidas.length === 0) {
      alert("Nenhuma repetida encontrada.");
      return;
    }
    const linkConvite = `${window.location.origin}${window.location.pathname}?convite=${user.uid}`;
    
    let texto = `👋 Minhas REPETIDAS do Álbum da Copa 2026:\n\n`;
    repetidas.forEach(p => {
      const listaNums = p.itens.map(i => `${i.num}(${i.qtd}x)`).join(', ');
      texto += `📌 *${p.nome}* [${p.id}]: ${listaNums}\n`;
    });
    texto += `\n🤝 Quer alguma? Entra no app pelo meu link de convite e clica em pedir:\n${linkConvite}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const copiarLinkDireto = () => {
    const linkConvite = `${window.location.origin}${window.location.pathname}?convite=${user.uid}`;
    navigator.clipboard.writeText(linkConvite);
    alert("Link de convite pessoal copiado!");
  };

  // --- TELA DE LOGIN ---
  if (!user) {
    return (
      <div id="tela-login">
        <div className="login-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
          <img src={imagemAlbum} alt="Álbum" style={{ width: '130px', borderRadius: '12px', marginBottom: '16px' }}/>
          <h1>Registro de Figurinhas 2026</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, textAlign: 'center', marginBottom: '16px' }}>
            {idAnfitriao ? "Você recebeu um convite de troca! Entre para ver." : "Organize e gerencie suas trocas em tempo real."}
          </p>
          <button onClick={() => signInWithPopup(auth, provider)} className="btn btn-primary">Entrar com Conta Google</button>
        </div>
      </div>
    );
  }

  // --- TELA 5: TELA EXCLUSIVA DO LINK DE CONVITE ---
  if (telaAtual === 'visualizar_convite' && dadosAnfitriao) {
    const repFiltradasParaAmigo = obterRepetidasFiltradasParaMim(dadosAnfitriao.album);
    return (
      <div>
        <header>
          <div className="header-container">
            <button onClick={() => setTelaAtual('lista')} className="btn-logout" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>
              Ir Para Meu Álbum Pessoal
            </button>
          </div>
        </header>

        <div className="main-container" style={{ maxWidth: '600px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
            <h2>👋 Olá, {user.displayName}!</h2>
            <p style={{ fontSize: '0.9rem', opacity: '0.8', marginTop: '4px' }}>
              Você está vendo o estoque de <b>{dadosAnfitriao.nomeDono}</b>.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', marginTop: '6px' }}>
              🔍 O app filtrou e está mostrando APENAS as repetidas dele que FALTAM no seu álbum!
            </p>
          </div>
          
          {repFiltradasParaAmigo.length === 0 ? (
            <p style={{ opacity: 0.5, textAlign: 'center', padding: '20px' }}>
              😎 Boa! O {dadosAnfitriao.nomeDono} não tem nenhuma repetida que esteja faltando no seu álbum. Você já tem todas essas!
            </p>
          ) : (
            repFiltradasParaAmigo.map(pais => (
              <div key={pais.id} style={{ background: '#1f1f2e', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{pais.nome} ({pais.id})</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {pais.itens.map(item => (
                    <button key={item.num} onClick={() => sinalizarInteresse(idAnfitriao, dadosAnfitriao.nomeDono, pais.id, item.num)} style={{ background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                      Nº {item.num} ({item.qtd}x) 🤝 Pedir
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- TELA 6: CENTRAL DE SOLICITAÇÕES PENDENTES DE TROCA COM BOTÃO DE HISTÓRICO FIXO ---
  if (telaAtual === 'gerenciar_pedidos') {
    return (
      <div>
        <header>
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setTelaAtual('lista')} className="btn-logout" style={{ borderColor: '#10b981', color: '#10b981' }}>
              ← Voltar para Meu Álbum
            </button>
            <button onClick={() => setTelaAtual('historico')} className="btn" style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
              📜 Ver Histórico Completo
            </button>
          </div>
        </header>

        <div className="main-container" style={{ maxWidth: '600px' }}>
          <h2 style={{ color: '#10b981', marginBottom: '8px' }}>📩 Solicitações de Troca Pendentes</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '24px' }}>
            Abaixo estão os pedidos ativos feitos pelos seus amigos.
          </p>

          {notificacoes.length === 0 ? (
            <div style={{ background: '#1f1f2e', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px dashed #2e2e36', marginBottom: '32px' }}>
              <p style={{ opacity: 0.5 }}>Nenhuma solicitação pendente no momento!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {notificacoes.map((pedido) => (
                <div key={pedido.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#1f1f2e', padding: '16px', borderRadius: '14px', border: '1px solid #2e2e36' }}>
                  <div style={{ fontSize: '0.95rem' }}>
                    👤 Amigo: <b style={{ color: '#fff' }}>{pedido.deNome}</b>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
                    Pediu a figurinha: <b style={{ color: '#3b82f6' }}>{pedido.paisId} — Nº {pedido.numero}</b>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button onClick={() => responderTroca(pedido.id, 'aceitar', pedido.paisId, pedido.numero, pedido.deUid)} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      ✔ Aceitar e Colar no Álbum dele
                    </button>
                    <button onClick={() => responderTroca(pedido.id, 'recusar', pedido.paisId, pedido.numero, pedido.deUid)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ color: '#a1a1aa', marginBottom: '12px', fontSize: '1.1rem' }}>📜 Transações Recentes</h3>
          {historicoTrocas.length === 0 ? (
            <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Nenhuma transação concluída recentemente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historicoTrocas.slice(0, 5).map((hist) => {
                const foiAceito = hist.status === 'aceito' || hist.status === 'arquivado_sucesso';
                return (
                  <div key={hist.id} style={{ background: '#14141f', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${foiAceito ? '#10b98133' : '#ef444433'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#fff', display: 'block' }}>Para: <b>{hist.deNome}</b></span>
                      <small style={{ color: '#a1a1aa' }}>{hist.paisId} - Nº {hist.numero}</small>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: foiAceito ? '#10b981' : '#ef4444', background: foiAceito ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                      {foiAceito ? 'ACEITO' : hist.status === 'recusado_sem_estoque' ? 'SEM ESTOQUE' : 'RECUSADO'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TELA 7: TELA EXCLUSIVA DO HISTÓRICO DE TROCAS ---
  if (telaAtual === 'historico') {
    return (
      <div>
        <header>
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setTelaAtual('lista')} className="btn-logout" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
              ← Voltar para Meu Álbum
            </button>
            <button onClick={() => setTelaAtual('gerenciar_pedidos')} className="btn" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
              📩 Ver Pedidos Pendentes
            </button>
          </div>
        </header>
        <div className="main-container" style={{ maxWidth: '600px' }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '8px' }}>📜 Histórico Geral de Transações</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '24px' }}>
            Registro completo de todas as requisições resolvidas e processadas por você.
          </p>

          {historicoTrocas.length === 0 ? (
            <div style={{ background: '#1f1f2e', borderRadius: '12px', padding: '32px', textAlign: 'center', border: '1px dashed #2e2e36' }}>
              <p style={{ opacity: 0.4 }}>Nenhuma transação registrada no histórico.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historicoTrocas.map((hist) => {
                const foiAceito = hist.status === 'aceito' || hist.status === 'arquivado_sucesso';
                return (
                  <div key={hist.id} style={{ background: '#14141f', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${foiAceito ? '#10b98133' : '#ef444433'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>Solicitante: <b>{hist.deNome}</b></span>
                      <small style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Item: {hist.paisId} — Nº {hist.numero}</small>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: foiAceito ? '#10b981' : '#ef4444', background: foiAceito ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '5px 10px', borderRadius: '6px' }}>
                      {foiAceito ? 'CONCLUÍDO' : hist.status === 'recusado_sem_estoque' ? 'ESTOQUE ESGOTADO' : 'RECUSADO'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TELA 1: LISTA TOTAL DAS SELEÇÕES (TELA INICIAL) ---
  if (telaAtual === 'lista') {
    return (
      <div>
        <header>
          <div className="header-container">
            <div className="user-info"><span>{user.displayName || "Usuário"}</span></div>
            <button onClick={() => signOut(auth)} className="btn-logout">Sair</button>
          </div>
        </header>

        <div className="main-container" style={{ maxWidth: '1200px' }}>
          
          {/* Alerta de Notificação Ativa */}
          {notificacoes.length > 0 && (
            <div 
              onClick={() => setTelaAtual('gerenciar_pedidos')}
              style={{ background: '#111827', border: '2px solid #10b981', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📢</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff' }}>
                  Você tem <span style={{ color: '#10b981', fontSize: '1.1rem' }}>{notificacoes.length}</span> {notificacoes.length === 1 ? 'nova solicitação' : 'novas solicitações'} de troca pendentes!
                </span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                Ver Pedidos →
              </span>
            </div>
          )}

          {/* Dashboard */}
          <div className="dashboard-progresso">
            <h2> Seu Progresso ({porcentagemProgresso}%)</h2>
            <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${porcentagemProgresso}%` }}></div></div>
            
            <div className="cards-stats" style={{ cursor: 'pointer' }}>
              <div onClick={() => setFiltroDashboard('todos')} className={`stat-card total ${filtroDashboard === 'todos' ? 'active-filter' : ''}`} style={{ border: filtroDashboard === 'todos' ? '2px solid #fff' : '2px solid transparent', padding: '8px', borderRadius: '10px' }}>
                <div className="label">Total (Ver Todas)</div>
                <div className="value">{totalFigurinhasNoAlbum}</div>
              </div>
              <div onClick={() => setFiltroDashboard('tenho')} className={`stat-card tenho ${filtroDashboard === 'tenho' ? 'active-filter' : ''}`} style={{ border: filtroDashboard === 'tenho' ? '2px solid #10b981' : '2px solid transparent', padding: '8px', borderRadius: '10px' }}>
                <div className="label">Já Tenho</div>
                <div className="value">{quantasEuTenhoGeral}</div>
              </div>
              <div onClick={() => setFiltroDashboard('faltam')} className={`stat-card faltam ${filtroDashboard === 'faltam' ? 'active-filter' : ''}`} style={{ border: filtroDashboard === 'faltam' ? '2px solid #ef4444' : '2px solid transparent', padding: '8px', borderRadius: '10px' }}>
                <div className="label">Faltam Coletar</div>
                <div className="value">{quantasFaltamGeral}</div>
              </div>
            </div>
          </div>

          {/* MENU DE CONTROLE PRINCIPAL COM BOTÃO DE HISTÓRICO TOTALMENTE VISÍVEL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            <button onClick={() => setTelaAtual('repetidas')} className="btn btn-primary" style={{ background: '#3b82f6', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
              🔄 Minhas Repetidas ({totalRepetidasGeral})
            </button>
            <button onClick={carregarAlbunsDoApp} className="btn btn-primary" style={{ background: '#8b5cf6', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
              👥 Ver Trocas do App
            </button>
            <button onClick={() => setTelaAtual('historico')} className="btn btn-primary" style={{ background: '#f59e0b', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
              📜 Histórico de Trocas ({historicoTrocas.length})
            </button>
          </div>

          {/* LISTAGEM ÚNICA COM FILTRAGEM DINÂMICA EM TEMPO REAL */}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {listaPaises.map((pais) => {
              const { tenho, repetidas } = contarFigurinhasDoPais(pais.id);
              
              const numerosFiltrados = vinteNumeros.filter(num => {
                const jaPossui = meuAlbum[`${pais.id}-${num}`] === true;
                if (filtroDashboard === 'tenho') return jaPossui;
                if (filtroDashboard === 'faltam') return !jaPossui;
                return true; 
              });

              if (numerosFiltrados.length === 0) return null;

              return (
                <div key={pais.id} style={{ background: '#1f1f2e', borderRadius: '16px', padding: '20px', border: '1px solid #2e2e36' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={`https://flagcdn.com/w40/${pais.code}.png`} style={{ width: '36px', borderRadius: '4px' }} alt={pais.nome}/>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>{pais.nome}</span>
                        <span style={{ fontSize: '0.8rem', opacity: '0.5', fontWeight: '700', textTransform: 'uppercase', marginTop: '6px' }}>ID: {pais.id}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: tenho === 20 ? '#10b981' : '#2a2a3a', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>{tenho} / 20</span>
                      {repetidas > 0 && <span style={{ fontSize: '11px', color: '#3b82f6', display: 'block', marginTop: '6px', fontWeight: 'bold' }}>+{repetidas} rep</span>}
                    </div>
                  </div>

                  {/* Grid de Figurinhas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {numerosFiltrados.map((num) => {
                      const marcado = meuAlbum[`${pais.id}-${num}`] === true;
                      const qtdRepetida = Number(meuAlbum[`${pais.id}-${num}-rep`]) || 0;
                      return (
                        <div key={num} style={{ background: '#14141f', padding: '8px', borderRadius: '10px', border: marcado ? '2px solid #10b981' : '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button 
                            onClick={() => clicarNoNumero(pais.id, num)} 
                            style={{ width: '100%', background: marcado ? '#10b981' : 'transparent', color: '#fff', border: 'none', padding: '6px 0', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}
                          >
                            {num}
                          </button>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '6px' }}>
                            <button onClick={() => alterarRepetida(pais.id, num, 'menos')} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                            <span style={{ fontSize: '0.75rem', color: qtdRepetida > 0 ? '#3b82f6' : '#888', fontWeight: 'bold' }}>{qtdRepetida}r</span>
                            <button onClick={() => alterarRepetida(pais.id, num, 'mais')} style={{ color: '#10b981', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                          </div>
                        </div>
                      );
                    })}
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
    return (
      <div>
        <header>
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setTelaAtual('lista')} className="btn-logout">Voltar para o Álbum</button>
            <button onClick={() => setTelaAtual('historico')} className="btn-logout" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>📜 Ver Histórico</button>
          </div>
        </header>
        <div className="main-container" style={{ maxWidth: '500px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button onClick={compartirWhatsApp} style={{ width: '100%', background: '#25D366', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              Compartilhar no WhatsApp com Link
            </button>
            <button onClick={copiarLinkDireto} style={{ width: '100%', background: '#3b82f6', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              🔗 Copiar Meu Link de Convite Direto
            </button>
          </div>

          {obtenerDadosRepetidas(meuAlbum).map(pais => (
            <div key={pais.id} style={{ background: '#1f1f2e', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
              <h4>{pais.nome}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {pais.itens.map(item => (
                  <div key={item.num} style={{ background: '#111', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                    <span>Nº {item.num}</span><br/><small style={{ color: '#3b82f6' }}>{item.qtd}x</small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- TELA 4: VER COMPARTILHAMENTO DE OUTRAS PESSOAS NO APP (ATUALIZADA E FILTRADA) ---
  if (telaAtual === 'comunidade') {
    return (
      <div>
        <header>
          <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setTelaAtual('lista')} className="btn-logout">Voltar para o Álbum</button>
            <button onClick={() => setTelaAtual('historico')} className="btn-logout" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>📜 Ver Histórico</button>
          </div>
        </header>
        <div className="main-container" style={{ maxWidth: '600px' }}>
          
          {albunsAlheios.length === 0 ? (
            <p style={{ opacity: 0.5, textAlign: 'center' }}>Nenhum outro amigo compartilhou figurinhas ainda.</p>
          ) : (
            (() => {
              let temAlgumResultado = false;
              const conteudoFiltrado = albunsAlheios.map((amigo) => {
                const repFiltradasParaMim = obterRepetidasFiltradasParaMim(amigo.album);
                
                if (repFiltradasParaMim.length === 0) return null;
                
                temAlgumResultado = true;
                return (
                  <div key={amigo.uid} style={{ background: '#1f1f2e', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid #2e2e36' }}>
                    <h3 style={{ color: '#8b5cf6', margin: '0 0 12px 0' }}>📦 Álbum de {amigo.nomeDono}</h3>
                    {repFiltradasParaMim.map(pais => (
                      <div key={pais.id} style={{ marginBottom: '10px', background: '#111', padding: '10px', borderRadius: '8px' }}>
                        <span><b>{pais.nome}</b>:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                          {pais.itens.map(item => (
                            <button key={item.num} onClick={() => sinalizarInteresse(amigo.uid, amigo.nomeDono, pais.id, item.num)} style={{ background: '#1e1b4b', border: '1px solid #4338ca', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                              Nº {item.num} ({item.qtd}x) 🤝 Pedir
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });

              return temAlgumResultado ? conteudoFiltrado : (
                <p style={{ opacity: 0.5, textAlign: 'center', padding: '24px' }}>
                  🙌 Nenhum dos seus amigos no app tem alguma figurinha repetida que esteja faltando para você no momento!
                </p>
              );
            })()
          )}
        </div>
      </div>
    );
  }

  return null;
}
