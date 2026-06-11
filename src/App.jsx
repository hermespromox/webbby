import React, { useMemo, useState } from 'react';
import { ArrowRight, Braces, CheckCircle2, Copy, Globe2, KeyRound, Loader2, Plus, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const starterCriteria = [
  { key: 'is_b2b', label: "Est-ce que l'entreprise vend principalement à d'autres entreprises ?", type: 'boolean' },
  { key: 'target_customer', label: 'Décris le client cible principal.', type: 'string' },
  { key: 'pricing_visible', label: 'Est-ce que des prix ou plans tarifaires sont visibles ?', type: 'boolean' }
];

function FieldRow({ field, index, update, remove }) {
  return (
    <div className="field-row">
      <input aria-label="clé JSON" value={field.key} onChange={e => update(index, { key: e.target.value })} placeholder="is_b2b" />
      <select aria-label="type de réponse" value={field.type} onChange={e => update(index, { type: e.target.value })}>
        <option value="boolean">boolean</option>
        <option value="string">string</option>
        <option value="number">number</option>
      </select>
      <input className="question" aria-label="question d'analyse" value={field.label} onChange={e => update(index, { label: e.target.value })} placeholder="Question à analyser" />
      <button className="icon-btn" type="button" onClick={() => remove(index)} aria-label="supprimer le critère"><Trash2 size={16} /></button>
    </div>
  );
}

function formatAnswer(value) {
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'number') return value.toLocaleString('fr-FR');
  return value || 'Non déterminé';
}

function ResultCard({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const text = JSON.stringify(result.analysis, null, 2);
  const fields = Object.entries(result.analysis.fields || {});
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <section className="result-card ux-result" id="result">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">Résultat lisible</span>
          <h2>{result.analysis.company_name || 'Analyse du site'}</h2>
          <p>{result.analysis.summary}</p>
        </div>
        <button className="secondary small" type="button" onClick={copy}><Copy size={16} />{copied ? 'JSON copié' : 'Copier le JSON'}</button>
      </div>
      <div className="summary-grid">
        <div><span>Site analysé</span><strong>{result.analysis.url || result.extracted?.finalUrl}</strong></div>
        <div><span>Modèle</span><strong>GPT-5.4 Nano · reasoning xhigh</strong></div>
        <div><span>Extraction</span><strong>{result.extracted?.chars?.toLocaleString('fr-FR')} caractères</strong></div>
      </div>
      <div className="answer-grid">
        {fields.map(([key, item]) => (
          <article className="answer-card" key={key}>
            <div className="answer-top"><code>{key}</code><span>{Math.round((item.confidence || 0) * 100)}% confiance</span></div>
            <strong className={typeof item.answer === 'boolean' ? (item.answer ? 'yes' : 'no') : ''}>{formatAnswer(item.answer)}</strong>
            <p>{item.reasoning}</p>
            <ul>{(item.evidence || []).map((evidence, i) => <li key={i}>{evidence}</li>)}</ul>
          </article>
        ))}
      </div>
      <details className="raw-json">
        <summary>Voir la réponse JSON brute</summary>
        <pre>{text}</pre>
      </details>
    </section>
  );
}

function App() {
  const [url, setUrl] = useState('https://artikle.io');
  const [criteria, setCriteria] = useState(starterCriteria);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const schemaPreview = useMemo(() => {
    const fields = Object.fromEntries(criteria.filter(c => c.key).map(c => [c.key, { answer: c.type, confidence: 'number', evidence: ['string'] }]));
    return JSON.stringify({ url: 'string', company_name: 'string', summary: 'string', fields }, null, 2);
  }, [criteria]);

  function update(index, patch) {
    setCriteria(items => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function remove(index) {
    setCriteria(items => items.filter((_, i) => i !== index));
  }

  async function analyze(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, criteria })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || payload.detail || 'Analyse impossible');
      setResult(payload);
      setTimeout(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Webbby home"><span className="logo"><Braces size={22} /></span><span>Webbby</span></a>
        <div className="nav-links"><a href="#demo">Démo</a><a href="#features">Fonctions</a><a href="#pricing">Prix</a><a href="#faq">FAQ</a></div>
        <a className="nav-cta" href="#demo">Analyser <ArrowRight size={16} /></a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14}/> Website intelligence → JSON</span>
          <h1>Transformez n'importe quel site web en analyse structurée.</h1>
          <p>Webbby prend une URL, vos critères key/value, puis force OpenRouter à répondre en JSON Schema strict : booléens, textes, scores, preuves et confiance.</p>
          <div className="hero-actions"><a className="primary" href="#demo">Lancer une analyse <ArrowRight size={18}/></a><a className="secondary" href="#features">Voir le fonctionnement</a></div>
          <div className="proof-row"><span><CheckCircle2 size={16}/> JSON validable</span><span><ShieldCheck size={16}/> Clé serveur uniquement</span><span><Globe2 size={16}/> Extraction site live</span></div>
        </div>
        <div className="hero-panel">
          <div className="panel-top"><span></span><span></span><span></span></div>
          <pre>{schemaPreview}</pre>
        </div>
      </section>

      <section className="trustbar">
        <div><strong>12</strong><span>critères max par run</span></div>
        <div><strong>30k</strong><span>caractères extraits</span></div>
        <div><strong>strict</strong><span>OpenRouter JSON Schema</span></div>
        <div><strong>0</strong><span>clé exposée côté client</span></div>
      </section>

      <section className="features" id="features">
        <div className="section-head"><span className="eyebrow">Pourquoi Webbby</span><h2>Un vrai petit moteur d'analyse, pas un prompt bricolé.</h2></div>
        <div className="cards">
          <article><KeyRound/><h3>Secrets protégés</h3><p>La clé OpenRouter reste dans les variables d'environnement Vercel, jamais dans le navigateur.</p></article>
          <article><Braces/><h3>JSON Schema strict</h3><p>Chaque critère devient une propriété structurée avec réponse, confiance, preuves et raisonnement court.</p></article>
          <article><Globe2/><h3>Site live</h3><p>L'API récupère le HTML, extrait le texte exploitable, puis demande au modèle d'étayer ses réponses.</p></article>
        </div>
      </section>

      <section className="how">
        <div><span>01</span><h3>Collez une URL</h3><p>Ajoutez le site à qualifier : SaaS, cabinet, marketplace, média, etc.</p></div>
        <div><span>02</span><h3>Définissez vos keys</h3><p>Exemple : <code>is_b2b</code>, <code>target_customer</code>, <code>pricing_visible</code>.</p></div>
        <div><span>03</span><h3>Exportez le JSON</h3><p>Copiez la sortie pour enrichir un CRM, un scoring ou un workflow d'automatisation.</p></div>
      </section>

      <section className="demo" id="demo">
        <div className="section-head"><span className="eyebrow">Démo live</span><h2>Analysez votre premier site</h2><p>Ajoutez, renommez ou supprimez les champs. Les noms deviennent les clés JSON finales.</p></div>
        <form onSubmit={analyze} className="analyzer">
          <label>URL du site web<input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" required /></label>
          <div className="criteria-head"><div><strong>Critères key/value</strong><span>Chaque ligne devient un champ JSON structuré.</span></div><button className="secondary small" type="button" onClick={() => setCriteria([...criteria, { key: '', label: '', type: 'string' }])}><Plus size={16}/>Ajouter</button></div>
          <div className="field-list">{criteria.map((field, index) => <FieldRow key={index} field={field} index={index} update={update} remove={remove} />)}</div>
          {error && <div className="error">{error}</div>}
          <button className="primary submit" disabled={loading} type="submit">{loading ? <Loader2 className="spin" size={18}/> : <Sparkles size={18}/>} {loading ? 'Analyse en cours…' : 'Analyser le site'}</button>
        </form>
        <ResultCard result={result} />
      </section>

      <section className="pricing" id="pricing">
        <div className="section-head"><span className="eyebrow">Offre</span><h2>Simple pour démarrer, extensible ensuite.</h2></div>
        <div className="price-grid">
          <article><span>Starter</span><h3>Gratuit</h3><p>Tester l'analyse URL + critères manuels.</p><ul><li>Démo live</li><li>Export JSON</li><li>Critères personnalisés</li></ul></article>
          <article className="hot"><span>Pro</span><h3>Sur demande</h3><p>Pour brancher Webbby à un CRM, un scrapeur ou une base prospects.</p><ul><li>Batch URLs</li><li>Schémas sauvegardés</li><li>Webhooks/API</li></ul></article>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="section-head"><span className="eyebrow">FAQ</span><h2>Questions fréquentes</h2></div>
        <details open><summary>Est-ce que la clé OpenRouter est visible ?</summary><p>Non. Elle est lue uniquement par la fonction serverless Vercel.</p></details>
        <details><summary>Pourquoi JSON Schema plutôt qu'un prompt JSON ?</summary><p>Le schéma force la structure et rend la sortie beaucoup plus fiable pour l'automatisation.</p></details>
        <details><summary>Peut-on ajouter d'autres critères que is_b2b ?</summary><p>Oui. Ajoutez vos propres clés, questions et types : boolean, string ou number.</p></details>
        <details><summary>Que se passe-t-il si le site bloque l'extraction ?</summary><p>L'API renvoie une erreur claire si elle ne récupère pas assez de texte exploitable.</p></details>
      </section>

      <section className="final-cta"><h2>URL + critères → JSON exploitable.</h2><p>Un MVP sérieux pour qualifier des entreprises sans copier-coller dans un chat.</p><a className="primary inverse" href="#demo">Essayer Webbby</a></section>
      <footer><strong>Webbby</strong><span>Built with the warm orange design system · OpenRouter structured outputs</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
