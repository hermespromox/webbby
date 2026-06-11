import React, { useState, useCallback } from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Globe2, Loader2, Plus, SearchCheck, Sparkles, Target, Trash2, TrendingUp, UsersRound } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const T = {
  fr: {
    nav: { test: 'Tester', signals: 'Signaux', offer: 'Offre', faq: 'FAQ', cta: 'Qualifier un prospect' },
    hero: { eyebrow: 'Brief sales en 10 secondes', title: 'Un brief sales en 10 secondes.', desc: "Collez le site d'un prospect. Webbby lit la page et ressort les signaux qui comptent pour un commercial : fit B2B, profil acheteur, signaux d'achat, angle d'approche et preuves concrètes.", cta: 'Analyser un site' },
    proof: { free: 'Gratuit · Sans inscription', speed: 'Résultat en < 10 secondes', anywhere: "Depuis n'importe quel site public" },
    trustbar: { time: 'pour qualifier un prospect', signals: 'signaux personnalisables', page: "brief lisible pour l'équipe sales", manual: 'recherche manuelle' },
    demo: { eyebrow: 'Testez maintenant', title: 'Qualifiez un prospect depuis son site', desc: 'Ajoutez les signaux que votre équipe utilise déjà pour décider qui contacter en priorité.' },
    form: { urlLabel: 'Site du prospect', urlPlaceholder: 'Collez le site de votre prospect... ex: https://acme.com', signalsLabel: 'Signaux à vérifier', signalsHint: "Fit B2B, profil acheteur, signaux d'achat, angle d'approche, preuves.", addSignal: 'Ajouter un signal', submit: 'Analyser ce site', loading: 'Lecture du site…', microcopy: 'Gratuit · Sans inscription · Résultat en moins de 10 secondes', fieldPlaceholder: 'Ce que vous voulez savoir sur le prospect', fieldKeyPlaceholder: 'Fit B2B', errorDefault: 'Analyse impossible', errorUnknown: 'Erreur inconnue' },
    types: { boolean: 'Oui / Non', string: 'Réponse courte', number: 'Score ou nombre' },
    result: { eyebrow: 'Brief sales', site: 'Site :', signal: 'Signal', answer: 'Réponse', confidence: 'Confiance', yes: 'Oui', no: 'Non', unknown: 'Non déterminé', prospect: 'Prospect' },
    features: { eyebrow: 'Pour les équipes sales', title: 'Moins de recherche manuelle. Plus de bons messages.', c1title: 'Qualifiez le compte', c1desc: 'Comprenez rapidement si l’entreprise ressemble à votre client idéal.', c2title: 'Trouvez le bon angle', c2desc: 'Repérez à qui elle vend, ce qu’elle promet et quel problème commercial elle met en avant.', c3title: 'Priorisez l’outreach', c3desc: 'Gardez les comptes avec des signaux forts et évitez les prospects trop flous.' },
    how: { s1title: 'Collez le site', s1desc: 'Un domaine, une landing page ou une page produit suffit pour démarrer.', s2title: 'Choisissez vos signaux', s2desc: 'Fit B2B, cible, budget, maturité, angle d’approche, urgence, concurrence.', s3title: 'Lisez le brief sales', s3desc: 'Vous obtenez des cartes claires avec réponse, confiance et preuves.' },
    pricing: { eyebrow: 'Offre', title: 'Un assistant de qualification pour votre pipeline.', starter: 'Starter', starterPrice: 'Gratuit', starterDesc: 'Tester la qualification manuelle compte par compte.', starterL1: 'Analyse d’un site', starterL2: 'Signaux personnalisés', starterL3: 'Brief sales lisible', pro: 'Pro', proPrice: 'Sur demande', proDesc: 'Pour traiter des listes de comptes et préparer l’outreach à grande échelle.', proL1: 'Analyse en batch', proL2: 'Signaux d’équipe sauvegardés', proL3: 'Export CRM et workflows' },
    faq: { eyebrow: 'FAQ', title: 'Questions fréquentes', q1: 'À quoi sert Webbby pour un commercial ?', a1: 'À lire rapidement le site d’un prospect et ressortir les signaux qui aident à décider s’il faut le contacter, avec quel angle et quel niveau de priorité.', q2: 'Est-ce que je peux personnaliser les signaux ?', a2: 'Oui. Vous pouvez demander exactement ce que votre équipe regarde déjà : cible, budget, stack, maturité, intention, segment, urgence ou concurrence.', q3: 'Est-ce que Webbby remplace un commercial ?', a3: 'Non. Il prépare le terrain : recherche compte, qualification et brief avant l’appel ou l’email.', q4: 'Que se passe-t-il si le site est trop pauvre ?', a4: 'Webbby vous le signale au lieu d’inventer. Le brief reste basé sur les éléments réellement visibles sur le site.' },
    final: { title: 'Un brief sales en 10 secondes, sans recherche manuelle.', desc: 'Collez un site → Webbby vous sort les signaux qui comptent. Gratuit, sans inscription.', cta: 'Analyser un site' },
    footer: 'Qualification commerciale depuis les sites web publics',
    starterCriteria: [
      { key: 'Fit B2B', type: 'boolean', label: "L'entreprise vend-elle surtout à d'autres entreprises ?" },
      { key: 'Client cible', type: 'string', label: 'Qui est le client idéal de cette entreprise ?' },
      { key: 'Signal budget', type: 'boolean', label: 'Le site montre-t-il un budget, des offres ou une intention d’achat ?' }
    ]
  },
  en: {
    nav: { test: 'Try it', signals: 'Signals', offer: 'Pricing', faq: 'FAQ', cta: 'Qualify a prospect' },
    hero: { eyebrow: 'Sales brief in 10 seconds', title: 'A sales brief in 10 seconds.', desc: "Paste a prospect's site. Webbby reads the page and surfaces the signals that matter: B2B fit, buyer profile, purchase intent, approach angle, and hard evidence.", cta: 'Analyze a site' },
    proof: { free: 'Free · No signup', speed: 'Result in < 10 seconds', anywhere: 'From any public website' },
    trustbar: { time: 'to qualify a prospect', signals: 'customizable signals', page: 'readable brief for sales teams', manual: 'manual research' },
    demo: { eyebrow: 'Try it now', title: 'Qualify a prospect from their website', desc: 'Add the signals your team already uses to decide who to reach out to first.' },
    form: { urlLabel: 'Prospect website', urlPlaceholder: 'Paste your prospect\'s site... e.g. https://acme.com', signalsLabel: 'Signals to check', signalsHint: 'B2B fit, buyer profile, purchase signals, approach angle, evidence.', addSignal: 'Add a signal', submit: 'Analyze this site', loading: 'Reading website…', microcopy: 'Free · No signup · Results in under 10 seconds', fieldPlaceholder: 'What you want to know about this prospect', fieldKeyPlaceholder: 'B2B Fit', errorDefault: 'Analysis failed', errorUnknown: 'Unknown error' },
    types: { boolean: 'Yes / No', string: 'Short answer', number: 'Score or number' },
    result: { eyebrow: 'Sales brief', site: 'Site:', signal: 'Signal', answer: 'Answer', confidence: 'Confidence', yes: 'Yes', no: 'No', unknown: 'Undetermined', prospect: 'Prospect' },
    features: { eyebrow: 'For sales teams', title: 'Less manual research. Better outreach.', c1title: 'Qualify the account', c1desc: 'Quickly understand if the company matches your ideal customer profile.', c2title: 'Find the right angle', c2desc: 'Spot who they sell to, what they promise, and the business problem they highlight.', c3title: 'Prioritize outreach', c3desc: 'Focus on accounts with strong signals and skip vague prospects.' },
    how: { s1title: 'Paste the site', s1desc: 'A domain, landing page, or product page is all you need to get started.', s2title: 'Choose your signals', s2desc: 'B2B fit, target, budget, maturity, approach angle, urgency, competition.', s3title: 'Read the sales brief', s3desc: 'Get clear cards with answer, confidence level, and evidence.' },
    pricing: { eyebrow: 'Plans', title: 'A qualification assistant for your pipeline.', starter: 'Starter', starterPrice: 'Free', starterDesc: 'Manual qualification, one account at a time.', starterL1: 'Single site analysis', starterL2: 'Custom signals', starterL3: 'Readable sales brief', pro: 'Pro', proPrice: 'On request', proDesc: 'Process account lists and prepare outreach at scale.', proL1: 'Batch analysis', proL2: 'Saved team signals', proL3: 'CRM export & workflows' },
    faq: { eyebrow: 'FAQ', title: 'Frequent questions', q1: 'What does Webbby do for a salesperson?', a1: 'It quickly reads a prospect\'s site and surfaces the signals that help decide whether to reach out, with what angle, and at what priority level.', q2: 'Can I customize the signals?', a2: 'Yes. You can ask for exactly what your team already checks: target audience, budget, tech stack, maturity, intent, segment, urgency, or competition.', q3: 'Does Webbby replace a salesperson?', a3: 'No. It does the groundwork: account research, qualification, and a brief before the call or email.', q4: 'What if the site has little content?', a4: "Webbby flags it instead of making things up. The brief stays grounded in what's actually visible on the site." },
    final: { title: 'A sales brief in 10 seconds, with zero manual research.', desc: 'Paste a site → Webbby pulls out the signals that matter. Free, no signup.', cta: 'Analyze a site' },
    footer: 'Sales qualification from public websites',
    starterCriteria: [
      { key: 'B2B Fit', type: 'boolean', label: 'Does this company primarily sell to other businesses?' },
      { key: 'Target customer', type: 'string', label: 'Who is this company\'s ideal customer?' },
      { key: 'Budget signal', type: 'boolean', label: 'Does the site show pricing, offers, or purchase intent?' }
    ]
  }
};

function FieldRow({ field, index, update, remove, t, types }) {
  return (
    <div className="field-row">
      <input aria-label="signal name" value={field.key} onChange={e => update(index, { key: e.target.value })} placeholder={t.fieldKeyPlaceholder} />
      <select aria-label="expected format" value={field.type} onChange={e => update(index, { type: e.target.value })}>
        <option value="boolean">{types.boolean}</option>
        <option value="string">{types.string}</option>
        <option value="number">{types.number}</option>
      </select>
      <input className="question" aria-label="sales question" value={field.label} onChange={e => update(index, { label: e.target.value })} placeholder={t.fieldPlaceholder} />
      <button className="icon-btn" type="button" onClick={() => remove(index)} aria-label="remove signal"><Trash2 size={16} /></button>
    </div>
  );
}

function formatAnswer(value, t) {
  if (typeof value === 'boolean') return value ? t.yes : t.no;
  if (typeof value === 'number') return value.toLocaleString('fr-FR');
  return value || t.unknown;
}

function ResultCard({ result, t }) {
  if (!result) return null;
  const fields = Object.entries(result.analysis.fields || {});
  return (
    <section className="result-card" id="result">
      <div className="result-head">
        <span className="eyebrow">{t.result.eyebrow}</span>
        <h2>{result.analysis.company_name || t.result.prospect}</h2>
        <p className="result-summary">{result.analysis.summary}</p>
      </div>
      <div className="result-meta">
        <span>{t.result.site} {result.analysis.url || result.extracted?.finalUrl}</span>
      </div>
      <table className="signal-table">
        <thead><tr><th>{t.result.signal}</th><th>{t.result.answer}</th><th>{t.result.confidence}</th></tr></thead>
        <tbody>
          {fields.map(([key, item]) => (
            <tr key={key}>
              <td className="sig-label">{item.title || key}</td>
              <td className={`sig-answer ${typeof item.answer === 'boolean' ? (item.answer ? 'yes' : 'no') : ''}`}>
                {formatAnswer(item.answer, t.result)}
              </td>
              <td className="sig-conf">
                <span className="conf-bar"><span className="conf-fill" style={{width: `${Math.round((item.confidence || 0)*100)}%`}} /></span>
                {Math.round((item.confidence || 0)*100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function App() {
  const [lang, setLang] = useState(() => {
    if (typeof localStorage !== 'undefined') return localStorage.getItem('webbby_lang') || 'fr';
    return 'fr';
  });
  const [url, setUrl] = useState('https://artikle.io');
  const [criteria, setCriteria] = useState(T[lang].starterCriteria);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const switchLang = useCallback((l) => {
    setLang(l);
    if (typeof localStorage !== 'undefined') localStorage.setItem('webbby_lang', l);
    setCriteria(T[l].starterCriteria);
  }, []);

  const t = T[lang];

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
      if (!response.ok || !payload.ok) throw new Error(payload.error || payload.detail || t.form.errorDefault);
      setResult(payload);
      setTimeout(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      setError(err.message || t.form.errorUnknown);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Webbby home"><span className="logo"><SearchCheck size={22} /></span><span>Webbby</span></a>
        <div className="nav-links"><a href="#demo">{t.nav.test}</a><a href="#features">{t.nav.signals}</a><a href="#pricing">{t.nav.offer}</a><a href="#faq">{t.nav.faq}</a></div>
        <div className="nav-right">
          <div className="lang-toggle">
            <button className={lang === 'fr' ? 'active' : ''} onClick={() => switchLang('fr')} aria-label="Français">FR</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => switchLang('en')} aria-label="English">EN</button>
          </div>
          <a className="nav-cta" href="#demo">{t.nav.cta} <ArrowRight size={16} /></a>
        </div>
      </nav>

      <section className="hero hero-simple" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14}/> {t.hero.eyebrow}</span>
          <h1>{t.hero.title}</h1>
          <p>{t.hero.desc}</p>
          <div className="hero-actions">
            <a className="primary hero-cta-lg" href="#demo">{t.hero.cta} <ArrowRight size={20}/></a>
          </div>
          <div className="proof-row">
            <span><CheckCircle2 size={16}/> {t.proof.free}</span>
            <span><Target size={16}/> {t.proof.speed}</span>
            <span><Globe2 size={16}/> {t.proof.anywhere}</span>
          </div>
        </div>
      </section>

      <section className="trustbar">
        <div><strong>10 s</strong><span>{t.trustbar.time}</span></div>
        <div><strong>∞</strong><span>{t.trustbar.signals}</span></div>
        <div><strong>1 page</strong><span>{t.trustbar.page}</span></div>
        <div><strong>0</strong><span>{t.trustbar.manual}</span></div>
      </section>

      <section className="demo" id="demo">
        <div className="section-head"><span className="eyebrow">{t.demo.eyebrow}</span><h2>{t.demo.title}</h2><p>{t.demo.desc}</p></div>
        <form onSubmit={analyze} className="analyzer">
          <label>{t.form.urlLabel}<input value={url} onChange={e => setUrl(e.target.value)} placeholder={t.form.urlPlaceholder} required /></label>
          <div className="criteria-head"><div><strong>{t.form.signalsLabel}</strong><span>{t.form.signalsHint}</span></div><button className="secondary small" type="button" onClick={() => setCriteria([...criteria, { key: '', label: '', type: 'string' }])}><Plus size={16}/>{t.form.addSignal}</button></div>
          <div className="field-list">{criteria.map((field, index) => <FieldRow key={index} field={field} index={index} update={update} remove={remove} t={t.form} types={t.types} />)}</div>
          {error && <div className="error">{error}</div>}
          <button className="primary submit" disabled={loading} type="submit">{loading ? <Loader2 className="spin" size={18}/> : <Sparkles size={18}/>} {loading ? t.form.loading : t.form.submit}</button>
          <p className="microcopy">{t.form.microcopy}</p>
        </form>
        <ResultCard result={result} t={t} />
      </section>

      <section className="features" id="features">
        <div className="section-head"><span className="eyebrow">{t.features.eyebrow}</span><h2>{t.features.title}</h2></div>
        <div className="cards">
          <article><BriefcaseBusiness/><h3>{t.features.c1title}</h3><p>{t.features.c1desc}</p></article>
          <article><UsersRound/><h3>{t.features.c2title}</h3><p>{t.features.c2desc}</p></article>
          <article><TrendingUp/><h3>{t.features.c3title}</h3><p>{t.features.c3desc}</p></article>
        </div>
      </section>

      <section className="how">
        <div><span>01</span><h3>{t.how.s1title}</h3><p>{t.how.s1desc}</p></div>
        <div><span>02</span><h3>{t.how.s2title}</h3><p>{t.how.s2desc}</p></div>
        <div><span>03</span><h3>{t.how.s3title}</h3><p>{t.how.s3desc}</p></div>
      </section>

      <section className="pricing" id="pricing">
        <div className="section-head"><span className="eyebrow">{t.pricing.eyebrow}</span><h2>{t.pricing.title}</h2></div>
        <div className="price-grid">
          <article><span>{t.pricing.starter}</span><h3>{t.pricing.starterPrice}</h3><p>{t.pricing.starterDesc}</p><ul><li>{t.pricing.starterL1}</li><li>{t.pricing.starterL2}</li><li>{t.pricing.starterL3}</li></ul></article>
          <article className="hot"><span>{t.pricing.pro}</span><h3>{t.pricing.proPrice}</h3><p>{t.pricing.proDesc}</p><ul><li>{t.pricing.proL1}</li><li>{t.pricing.proL2}</li><li>{t.pricing.proL3}</li></ul></article>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="section-head"><span className="eyebrow">{t.faq.eyebrow}</span><h2>{t.faq.title}</h2></div>
        <details open><summary>{t.faq.q1}</summary><p>{t.faq.a1}</p></details>
        <details><summary>{t.faq.q2}</summary><p>{t.faq.a2}</p></details>
        <details><summary>{t.faq.q3}</summary><p>{t.faq.a3}</p></details>
        <details><summary>{t.faq.q4}</summary><p>{t.faq.a4}</p></details>
      </section>

      <section className="final-cta"><h2>{t.final.title}</h2><p>{t.final.desc}</p><a className="primary inverse" href="#demo">{t.final.cta}</a></section>
      <footer><strong>Webbby</strong><span>{t.footer}</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
