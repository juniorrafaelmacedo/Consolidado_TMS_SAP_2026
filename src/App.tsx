/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clipboard, 
  Table as TableIcon, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';

interface DataRecord {
  id: string;
  date: string;
  value: number;
  docId: string;
  status: string;
  type: string;
  hash: string;
}

const SAMPLE_DATA = "2026-03-19 8.969999999999999 300420 0 NFSe C250CCD56 | 2026-03-19 6.859999999999999 301104 0 NFSe 7E36179BD | 2026-03-20 12.059999999999999 301918 0 NFSe CC7012531";

export default function App() {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const formatDateBR = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const data = useMemo(() => {
    if (!inputText.trim()) return [];
    
    return inputText.split('|')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map((part, index) => {
        const parts = part.split(/\s+/);
        const rawDate = parts[0] || '-';
        return {
          id: `record-${index}`,
          date: formatDateBR(rawDate),
          value: parseFloat(parts[1]) || 0,
          docId: parts[2] || '-',
          status: parts[3] || '-',
          type: parts[4] || '-',
          hash: parts[5] || '-'
        } as DataRecord;
      });
  }, [inputText]);

  const filteredData = useMemo(() => {
    return data.filter(record => 
      record.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.docId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const stats = useMemo(() => {
    const total = data.length;
    const totalValue = data.reduce((sum, r) => sum + r.value, 0);
    return { total, totalValue };
  }, [data]);

  const handleCopyCsv = () => {
    const headers = ['Data', 'Valor', 'ID Documento', 'Status', 'Tipo', 'Hash/Chave'];
    const rows = data.map(r => [r.date, r.value.toString(), r.docId, r.status, r.type, r.hash].join(';'));
    const csvContent = [headers.join(';'), ...rows].join('\n');
    
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <TableIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Consolidado TMS x SAP</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Processamento de Dados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInputText(SAMPLE_DATA)}
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block"
            >
              Carregar Exemplo
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-red-600 active:scale-95"
            >
              <Trash2 size={16} />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Input Section */}
          <section className="lg:col-span-5 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText size={18} className="text-indigo-500" />
                  Entrada de Dados Brutos
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  id="data-input"
                  className="h-64 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="Cole aqui os dados separados por | ..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  O sistema irá processar automaticamente os dados separados pelo caractere pipe (|) e gerar a base de dados estruturada.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Registros</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">{stats.total}</span>
                  <span className="text-xs text-slate-400">ítens</span>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Valor Acumulado</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
                  </span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7 flex flex-col space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Filtrar por ID, Hash ou Data..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                id="export-csv"
                onClick={handleCopyCsv}
                disabled={data.length === 0}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                   copied 
                   ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                   : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                }`}
              >
                {copied ? <CheckCircle2 size={18} /> : <Download size={18} />}
                <span>{copied ? 'Copiado para Excel/CSV' : 'Copiar CSV'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-700">Data</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Valor</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">ID Documento</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Tipo</th>
                      <th className="px-6 py-4 font-semibold text-slate-700">Hash/Chave</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {filteredData.length > 0 ? (
                        filteredData.map((record) => (
                          <motion.tr
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={record.id}
                            className="group hover:bg-slate-50 transition-colors"
                          >
                            <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600">
                              {record.date}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">
                              {record.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-medium text-slate-600 group-hover:bg-white transition-colors">
                                {record.docId}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10">
                                {record.type}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-[11px] text-slate-400">
                              {record.hash}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-24 text-center">
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                {inputText ? <AlertCircle size={32} /> : <Clipboard size={32} />}
                              </div>
                              <div className="max-w-[200px] text-slate-400">
                                {inputText 
                                  ? "Nenhum resultado encontrado para sua busca." 
                                  : "Aguardando entrada de dados para processamento."}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 italic px-2">
              <AlertCircle size={12} />
              Dica: Use o botão "Copiar CSV" para colar os dados diretamente no Excel utilizando o "V ponto e vírgula" ( ; ) como separador.
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            &copy; 2026 Consolidado TMS x SAP - Ferramenta de Organização de Base de Dados.
          </p>
        </div>
      </footer>
    </div>
  );
}

