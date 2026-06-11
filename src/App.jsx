import React, { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Globe2, Loader2, Plus, SearchCheck, Sparkles, Target, Trash2, TrendingUp, UsersRound } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const starterCriteria = [
  { key: 'Fit B2B', label: "L'entreprise vend-elle surtout à d'autres entreprises ?", type: 'boolean' },
  { key: 'Client cible', label: 'Qui est le client idéal de cette entreprise ?', type: 'string' },
  { key: 'Signal budget', label: 'Le site montre-t-il un budget, des offres ou une intention d’achat ?', type: 'boolean' }
];

const typeLabels = {
  boolean: 'Oui / Non',
  string: 'Réponse courte',
  number: 'Score ou nombre'
};

function FieldRow({ field, index, update, remove }) {
  return (
    <div className="field-row">
      <input aria-label="nom du signal" value={field.key} onChange={e => update(index, { key: e.target.value })} placeholder="Fit B2B" />
      <select aria-label="format attendu" value={field.type} onChange={e => update(index, { type: e.target.value })}>
        <option value="boolean">Oui / Non</option>
        <option value="string">Réponse courte</option>
        <option value="number">Score ou nombre</option>
      </select>
      <input className="question" aria-label="question sales" value={field.label} onChange={e => update(index, { label: e.target.value })} placeholder="Ce que vous voulez savoir sur le prospect" />
      <button className="icon-btn" type="button" onClick={() => remove(index)} aria-label="supprimer le signal"><Trash2 size={16} /></button>
    </div>
  );
}

function formatAnswer(value) {
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'number') return value.toLocaleString('fr-FR');
  return value || 'Non déterminé';
}

function ResultCard({ result }) {
  if (!result) return null;
  const fields = Object.entries(result.analysis.fields || {});
  return (
    <section className="result-card ux-result" id="result">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">Compte rendu sales</span>
          <h2>{result.analysis.company_name || 'Prospect analysé'}</h2>
          <p>{result.analysis.summary}</p>
        </div>
      </div>
      <div className="summary-grid sales-summary">
        <div><span>Site analysé</span><strong>{result.analysis.url || result.extracted?.finalUrl}</strong></div>
        <div><span>Lecture rapide</span><strong>Signaux commerciaux prêts à utiliser</strong></div>
        <div><span>Prochaine étape</span><strong>Prioriser, qualifier, contacter</strong></div>
      </div>
      <div className="answer-grid">
        {fields.map(([key, item]) => (
          <article className="answer-card" key={key}>
            <div className="answer-top"><span>{item.title || key}</span><em>{Math.round((item.confidence || 0) * 100)}% sûr</em></div>
            <strong className={typeof item.answer === 'boolean' ? (item.answer ? 'yes' : 'no') : ''}>{formatAnswer(item.answer)}</strong>
            <p>{item.reasoning}</p>
            <ul>{(item.evidence || []).map((evidence, i) => <li key={i}>{evidence}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [url, setUrl] = useState('https://artikle.io');
  const [criteria, setCriteria] = useState(starterCriteria);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
        <a className="brand" href="#top" aria-label="Webbby home"><span className="logo"><SearchCheck size={22} /></span><span>Webbby</span></a>
        <div className="nav-links"><a href="#demo">Tester</a><a href="#features">Signaux</a><a href="#pricing">Offre</a><a href="#faq">FAQ</a></div>
        <a className="nav-cta" href="#demo">Qualifier un prospect <ArrowRight size={16} /></a>
      </nav>

      <section className="hero hero-simple" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14}/> Brief sales en 10 secondes</span>
          <h1>Un brief sales en 10 secondes.</h1>
          <p>Collez le site d'un prospect. Webbby lit la page et ressort les signaux qui comptent pour un commercial : fit B2B, profil acheteur, signaux d'achat, angle d'approche et preuves concrètes.</p>
          <div className="hero-actions">
            <a className="primary hero-cta-lg" href="#demo">Analyser un site <ArrowRight size={20}/></a>
          </div>
          <div className="proof-row">
            <span><CheckCircle2 size={16}/> Gratuit · Sans inscription</span>
            <span><Target size={16}/> Résultat en &lt; 10 secondes</span>
            <span><Globe2 size={16}/> Depuis n'importe quel site public</span>
          </div>
        </div>
      </section>

      <section className="trustbar">
        <div><strong>10 s</strong><span>pour qualifier un prospect</span></div>
        <div><strong>∞</strong><span>signaux personnalisables</span></div>
        <div><strong>1 page</strong><span>brief lisible pour l'équipe sales</span></div>
        <div><strong>0</strong><span>recherche manuelle</span></div>
      </section>

      <section className="demo" id="demo">
        <div className="section-head"><span className="eyebrow">Testez maintenant</span><h2>Qualifiez un prospect depuis son site</h2><p>Ajoutez les signaux que votre équipe utilise déjà pour décider qui contacter en priorité.</p></div>
        <form onSubmit={analyze} className="analyzer">
          <label>Site du prospect<input value={url} onChange={e => setUrl(e.target.value)} placeholder="Collez le site de votre prospect... ex: https://acme.com" required /></label>
          <div className="criteria-head"><div><strong>Signaux à vérifier</strong><span>Fit B2B, profil acheteur, signaux d'achat, angle d'approche, preuves.</span></div><button className="secondary small" type="button" onClick={() => setCriteria([...criteria, { key: '', label: '', type: 'string' }])}><Plus size={16}/>Ajouter un signal</button></div>
          <div className="field-list">{criteria.map((field, index) => <FieldRow key={index} field={field} index={index} update={update} remove={remove} />)}</div>
          {error && <div className="error">{error}</div>}
          <button className="primary submit" disabled={loading} type="submit">{loading ? <Loader2 className="spin" size={18}/> : <Sparkles size={18}/>} {loading ? 'Lecture du site…' : 'Analyser ce site'}</button>
          <p className="microcopy">Gratuit · Sans inscription · Résultat en moins de 10 secondes</p>
        </form>
        <ResultCard result={result} />
      </section>

      <section className="features" id="features">
        <div className="section-head"><span className="eyebrow">Pour les équipes sales</span><h2>Moins de recherche manuelle. Plus de bons messages.</h2></div>
        <div className="cards">
          <article><BriefcaseBusiness/><h3>Qualifiez le compte</h3><p>Comprenez rapidement si l’entreprise ressemble à votre client idéal.</p></article>
          <article><UsersRound/><h3>Trouvez le bon angle</h3><p>Repérez à qui elle vend, ce qu’elle promet et quel problème commercial elle met en avant.</p></article>
          <article><TrendingUp/><h3>Priorisez l’outreach</h3><p>Gardez les comptes avec des signaux forts et évitez les prospects trop flous.</p></article>
        </div>
      </section>

      <section className="how">
        <div><span>01</span><h3>Collez le site</h3><p>Un domaine, une landing page ou une page produit suffit pour démarrer.</p></div>
        <div><span>02</span><h3>Choisissez vos signaux</h3><p>Fit B2B, cible, budget, maturité, angle d’approche, urgence, concurrence.</p></div>
        <div><span>03</span><h3>Lisez le brief sales</h3><p>Vous obtenez des cartes claires avec réponse, confiance et preuves.</p></div>
      </section>

      <section className="pricing" id="pricing">
        <div className="section-head"><span className="eyebrow">Offre</span><h2>Un assistant de qualification pour votre pipeline.</h2></div>
        <div className="price-grid">
          <article><span>Starter</span><h3>Gratuit</h3><p>Tester la qualification manuelle compte par compte.</p><ul><li>Analyse d’un site</li><li>Signaux personnalisés</li><li>Brief sales lisible</li></ul></article>
          <article className="hot"><span>Pro</span><h3>Sur demande</h3><p>Pour traiter des listes de comptes et préparer l’outreach à grande échelle.</p><ul><li>Analyse en batch</li><li>Signaux d’équipe sauvegardés</li><li>Export CRM et workflows</li></ul></article>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="section-head"><span className="eyebrow">FAQ</span><h2>Questions fréquentes</h2></div>
        <details open><summary>À quoi sert Webbby pour un commercial ?</summary><p>À lire rapidement le site d’un prospect et ressortir les signaux qui aident à décider s’il faut le contacter, avec quel angle et quel niveau de priorité.</p></details>
        <details><summary>Est-ce que je peux personnaliser les signaux ?</summary><p>Oui. Vous pouvez demander exactement ce que votre équipe regarde déjà : cible, budget, stack, maturité, intention, segment, urgence ou concurrence.</p></details>
        <details><summary>Est-ce que Webbby remplace un commercial ?</summary><p>Non. Il prépare le terrain : recherche compte, qualification et brief avant l’appel ou l’email.</p></details>
        <details><summary>Que se passe-t-il si le site est trop pauvre ?</summary><p>Webbby vous le signale au lieu d’inventer. Le brief reste basé sur les éléments réellement visibles sur le site.</p></details>
      </section>

      <section className="final-cta"><h2>Un brief sales en 10 secondes, sans recherche manuelle.</h2><p>Collez un site → Webbby vous sort les signaux qui comptent. Gratuit, sans inscription.</p><a className="primary inverse" href="#demo">Analyser un site</a></section>
      <footer><strong>Webbby</strong><span>Qualification commerciale depuis les sites web publics</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
