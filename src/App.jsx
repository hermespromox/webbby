import React, { useState, useCallback } from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Globe2, Loader2, Plus, SearchCheck, Sparkles, Target, Trash2, TrendingUp, UsersRound } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const T = {
  fr: {
    nav: { test: 'Tester', useCases: 'Cas d’usage', integrations: 'Intégrations', offer: 'Tarifs', faq: 'FAQ', contact: 'Nous contacter', cta: 'Qualifier un prospect' },
    hero: { eyebrow: 'Webbby AI · Brief sales en 10 secondes', title: 'Webbby AI transforme un site en brief sales.', desc: "À partir du site d'un prospect, Webbby AI ressort les signaux qui comptent pour un commercial : fit B2B, profil acheteur, signaux d'achat, angle d'approche et priorités.", cta: 'Analyser un site' },
    proof: { free: '200+ utilisateurs', speed: 'Résultat en < 10 secondes', anywhere: "Depuis n'importe quel site public" },
    trustbar: { users: 'utilisateurs', time: 'pour qualifier un prospect', signals: 'signaux personnalisables', page: "brief lisible pour l'équipe sales", manual: 'recherche manuelle' },
    demo: { eyebrow: 'Testez Webbby AI', title: 'Qualifiez un prospect à partir de son site', desc: 'Ajoutez les signaux que votre équipe utilise déjà pour décider qui contacter en priorité.' },
    form: { urlLabel: 'Site du prospect', urlPlaceholder: 'Site du prospect... ex: https://acme.com', signalsLabel: 'Signaux à vérifier', signalsHint: "Fit B2B, profil acheteur, signaux d'achat, angle d'approche, preuves.", addSignal: 'Ajouter un signal', submit: 'Analyser ce site', loading: 'Lecture du site…', microcopy: 'Gratuit · Sans inscription · Résultat en moins de 10 secondes', fieldPlaceholder: 'Ce que vous voulez savoir sur le prospect', fieldKeyPlaceholder: 'Fit B2B', errorDefault: 'Analyse impossible', errorUnknown: 'Erreur inconnue' },
    types: { boolean: 'Oui / Non', string: 'Réponse courte', number: 'Score ou nombre' },
    result: { eyebrow: 'Brief sales Webbby AI', site: 'Site :', signal: '', answer: 'Insights', confidence: 'Confiance', yes: 'Oui', no: 'Non', unknown: 'Non déterminé', prospect: 'Prospect' },
    features: { eyebrow: 'Webbby AI pour les équipes sales', title: 'Moins de recherche manuelle. Plus de bons messages.', c1title: 'Qualifiez le compte', c1desc: 'Comprenez rapidement si l’entreprise ressemble à votre client idéal.', c2title: 'Trouvez le bon angle', c2desc: 'Repérez à qui elle vend, ce qu’elle promet et quel problème commercial elle met en avant.', c3title: 'Priorisez l’outreach', c3desc: 'Gardez les comptes avec des signaux forts et évitez les prospects trop flous.' },
    useCases: { eyebrow: 'Cas d’usage', title: 'Là où Webbby AI fait gagner du temps.', desc: 'Des briefs actionnables pour chaque moment où une équipe sales doit comprendre un compte vite.', aTitle: 'Préparer une campagne outbound', aDesc: 'Qualifiez 1 000 boîtes, repérez les bons comptes et adaptez les angles avant d’envoyer.', bTitle: 'Enrichir un CRM', bDesc: 'Ajoutez des insights lisibles aux comptes : cible, fit B2B, clients, international, priorités.', cTitle: 'Prioriser une liste de prospects', cDesc: 'Classez les comptes selon vos signaux réels, pas selon une note opaque.', dTitle: 'Préparer un call ou un email', dDesc: 'Obtenez en quelques secondes le contexte, les preuves et l’angle commercial à utiliser.' },
    integrations: { eyebrow: 'Intégrations', title: 'Pensé pour vos workflows sales.', desc: 'Webbby AI peut alimenter vos outils existants avec les mêmes signaux : CRM, tableurs, exports et automatisations.', a: 'HubSpot', b: 'Salesforce', c: 'Pipedrive', d: 'Google Sheets', e: 'Airtable', f: 'CSV export', g: 'Make', h: 'Zapier', note: 'Besoin d’une intégration précise ? Contact sales et on la branche sur votre workflow.' },
    how: { s1title: 'À partir du site', s1desc: 'Un domaine, une landing page ou une page produit suffit pour démarrer.', s2title: 'Choisissez vos signaux', s2desc: 'Fit B2B, cible, budget, maturité, angle d’approche, urgence, concurrence.', s3title: 'Lisez le brief sales', s3desc: 'Vous obtenez un tableau clair avec réponse, confiance et priorités commerciales.' },
    pricing: { eyebrow: 'Tarifs', title: 'Des tarifs simples pour qualifier plus de comptes.', starter: 'Starter', starterPrice: '4,99€', starterUnit: '/ 1 000 boîtes', starterDesc: 'Pour tester un segment ou préparer une première campagne.', starterL1: '1 000 sites analysés', starterL2: 'Signaux personnalisés', starterL3: 'Historique des recherches', pro: 'Growth', proPrice: '9,99€', proUnit: '/ mois', proDesc: 'Pour qualifier jusqu’à 10 000 boîtes par mois.', proL1: '10 000 sites / mois', proL2: 'Signaux d’équipe sauvegardés', proL3: 'Export CRM et workflows', enterprise: 'Scale', enterprisePrice: 'Contact sales', enterpriseDesc: 'Pour volumes plus élevés, intégrations et workflows sur mesure.', enterpriseL1: 'Plus de 10 000 boîtes', enterpriseL2: 'Support prioritaire', enterpriseL3: 'Intégrations CRM' },
    faq: { eyebrow: 'FAQ', title: 'Questions fréquentes', q1: 'À quoi sert Webbby AI pour un commercial ?', a1: 'À lire rapidement le site d’un prospect et ressortir les signaux qui aident à décider s’il faut le contacter, avec quel angle et quel niveau de priorité.', q2: 'Est-ce que je peux personnaliser les signaux ?', a2: 'Oui. Vous pouvez demander exactement ce que votre équipe regarde déjà : cible, budget, stack, maturité, intention, segment, urgence ou concurrence.', q3: 'Est-ce que Webbby remplace un commercial ?', a3: 'Non. Il prépare le terrain : recherche compte, qualification et brief avant l’appel ou l’email.', q4: 'Que se passe-t-il si le site est trop pauvre ?', a4: 'Webbby vous le signale au lieu d’inventer. Le brief reste basé sur les éléments réellement visibles sur le site.' },
    trust: { eyebrow: 'Adopté par les équipes sales', title: 'Trusted by 200+ users', desc: 'SDR, fondateurs et équipes growth utilisent Webbby pour transformer des sites web publics en briefs commerciaux exploitables.' },
    testimonials: { eyebrow: 'Témoignages', title: 'Ce que les équipes gagnent avec Webbby', a: 'On passe de 15 minutes de recherche à un brief clair en quelques secondes. Parfait avant une séquence outbound.', an: 'Camille R.', ar: 'Head of Sales, SaaS B2B', b: 'Le plus utile : les signaux sont personnalisables. On analyse exactement les critères de notre ICP.', bn: 'Nassim B.', br: 'Growth Lead', c: 'Simple, rapide, pas de dashboard inutile. Je colle le site, je récupère l’angle d’approche.', cn: 'Laura M.', cr: 'Founder' },
    contact: { eyebrow: 'Contact sales', title: 'Besoin de plus de 10 000 boîtes ?', desc: 'Dites-nous votre volume, vos signaux et votre workflow. On vous répond directement par email.', name: 'Nom / société', email: 'Email pro', volume: 'Volume souhaité', message: 'Ce que vous voulez analyser', submit: 'Contacter sales', loading: 'Envoi…', success: 'Demande envoyée. On vous répond vite.', error: 'Impossible d’envoyer la demande.' },
    final: { title: 'Webbby AI crée un brief sales en 10 secondes.', desc: 'À partir d’un site → Webbby AI vous sort les signaux qui comptent. À partir de 4,99€.', cta: 'Analyser un site' },
    footer: 'Qualification commerciale depuis les sites web publics',
    starterCriteria: [
      { key: 'Assurance', type: 'boolean', label: 'Est-ce que cette entreprise est une assurance ?' },
      { key: 'Produits', type: 'string', label: "Si c'est une assurance, quels produits vend-elle ?" },
      { key: 'Spécialisée', type: 'boolean', label: 'Est-ce une assurance spécialisée dans un type de produit ?' },
      { key: 'Portail client', type: 'string', label: 'Ont-ils un portail dédié avec un espace client ?' }
    ]
  },
  en: {
    nav: { test: 'Try it', useCases: 'Use cases', integrations: 'Integrations', offer: 'Pricing', faq: 'FAQ', contact: 'Contact us', cta: 'Qualify a prospect' },
    hero: { eyebrow: 'Webbby AI · Sales brief in 10 seconds', title: 'Webbby AI turns a website into a sales brief.', desc: "From a prospect's website, Webbby AI surfaces the signals that matter: B2B fit, buyer profile, purchase intent, approach angle, and sales priorities.", cta: 'Analyze a site' },
    proof: { free: 'Trusted by 200+ users', speed: 'Result in < 10 seconds', anywhere: 'From any public website' },
    trustbar: { users: 'users', time: 'to qualify a prospect', signals: 'customizable signals', page: 'readable brief for sales teams', manual: 'manual research' },
    demo: { eyebrow: 'Try Webbby AI', title: 'Qualify a prospect from their website', desc: 'Add the signals your team already uses to decide who to reach out to first.' },
    form: { urlLabel: 'Prospect website', urlPlaceholder: 'Prospect website... e.g. https://acme.com', signalsLabel: 'Signals to check', signalsHint: 'B2B fit, buyer profile, purchase signals, approach angle, evidence.', addSignal: 'Add a signal', submit: 'Analyze this site', loading: 'Reading website…', microcopy: 'Free · No signup · Results in under 10 seconds', fieldPlaceholder: 'What you want to know about this prospect', fieldKeyPlaceholder: 'B2B Fit', errorDefault: 'Analysis failed', errorUnknown: 'Unknown error' },
    types: { boolean: 'Yes / No', string: 'Short answer', number: 'Score or number' },
    result: { eyebrow: 'Webbby AI sales brief', site: 'Site:', signal: '', answer: 'Insights', confidence: 'Confidence', yes: 'Yes', no: 'No', unknown: 'Undetermined', prospect: 'Prospect' },
    features: { eyebrow: 'Webbby AI for sales teams', title: 'Less manual research. Better outreach.', c1title: 'Qualify the account', c1desc: 'Quickly understand if the company matches your ideal customer profile.', c2title: 'Find the right angle', c2desc: 'Spot who they sell to, what they promise, and the business problem they highlight.', c3title: 'Prioritize outreach', c3desc: 'Focus on accounts with strong signals and skip vague prospects.' },
    useCases: { eyebrow: 'Use cases', title: 'Where Webbby AI saves real sales time.', desc: 'Actionable briefs for every moment where a sales team needs to understand an account fast.', aTitle: 'Prepare an outbound campaign', aDesc: 'Qualify 1,000 companies, spot the right accounts, and adapt angles before sending.', bTitle: 'Enrich a CRM', bDesc: 'Add readable insights to accounts: target, B2B fit, customers, international presence, priorities.', cTitle: 'Prioritize a prospect list', cDesc: 'Rank accounts based on your real signals, not a black-box score.', dTitle: 'Prepare a call or email', dDesc: 'Get the context, proof points, and sales angle to use in seconds.' },
    integrations: { eyebrow: 'Integrations', title: 'Built for your sales workflows.', desc: 'Webbby AI can feed your existing tools with the same signals: CRM, spreadsheets, exports, and automations.', a: 'HubSpot', b: 'Salesforce', c: 'Pipedrive', d: 'Google Sheets', e: 'Airtable', f: 'CSV export', g: 'Make', h: 'Zapier', note: 'Need a specific integration? Contact sales and we’ll plug it into your workflow.' },
    how: { s1title: 'Start from the site', s1desc: 'A domain, landing page, or product page is all you need to get started.', s2title: 'Choose your signals', s2desc: 'B2B fit, target, budget, maturity, approach angle, urgency, competition.', s3title: 'Read the sales brief', s3desc: 'Get a clear table with answers, confidence, and sales priorities.' },
    pricing: { eyebrow: 'Pricing', title: 'Simple pricing to qualify more accounts.', starter: 'Starter', starterPrice: '€4.99', starterUnit: '/ 1,000 companies', starterDesc: 'For testing a segment or preparing a first campaign.', starterL1: '1,000 websites analyzed', starterL2: 'Custom signals', starterL3: 'Search history', pro: 'Growth', proPrice: '€9.99', proUnit: '/ month', proDesc: 'Qualify up to 10,000 companies per month.', proL1: '10,000 sites / month', proL2: 'Saved team signals', proL3: 'CRM export & workflows', enterprise: 'Scale', enterprisePrice: 'Contact sales', enterpriseDesc: 'For higher volumes, integrations, and custom workflows.', enterpriseL1: 'More than 10,000 companies', enterpriseL2: 'Priority support', enterpriseL3: 'CRM integrations' },
    faq: { eyebrow: 'FAQ', title: 'Frequent questions', q1: 'What does Webbby AI do for a salesperson?', a1: 'It quickly reads a prospect\'s site and surfaces the signals that help decide whether to reach out, with what angle, and at what priority level.', q2: 'Can I customize the signals?', a2: 'Yes. You can ask for exactly what your team already checks: target audience, budget, tech stack, maturity, intent, segment, urgency, or competition.', q3: 'Does Webbby replace a salesperson?', a3: 'No. It does the groundwork: account research, qualification, and a brief before the call or email.', q4: 'What if the site has little content?', a4: "Webbby flags it instead of making things up. The brief stays grounded in what's actually visible on the site." },
    trust: { eyebrow: 'Adopted by sales teams', title: 'Trusted by 200+ users', desc: 'SDRs, founders, and growth teams use Webbby to turn public websites into actionable sales briefs.' },
    testimonials: { eyebrow: 'Testimonials', title: 'What teams get from Webbby', a: 'We went from 15 minutes of research to a clear brief in seconds. Perfect before outbound sequences.', an: 'Camille R.', ar: 'Head of Sales, B2B SaaS', b: 'The best part is custom signals. We analyze exactly the criteria that define our ICP.', bn: 'Nassim B.', br: 'Growth Lead', c: 'Simple, fast, no useless dashboard. I paste the site and get the outreach angle.', cn: 'Laura M.', cr: 'Founder' },
    contact: { eyebrow: 'Contact sales', title: 'Need more than 10,000 companies?', desc: 'Tell us your volume, signals, and workflow. We’ll reply directly by email.', name: 'Name / company', email: 'Work email', volume: 'Expected volume', message: 'What you want to analyze', submit: 'Contact sales', loading: 'Sending…', success: 'Request sent. We’ll reply soon.', error: 'Could not send the request.' },
    final: { title: 'Webbby AI creates a sales brief in 10 seconds.', desc: 'From a website → Webbby AI pulls out the signals that matter. Starts at €4.99.', cta: 'Analyze a site' },
    footer: 'Sales qualification from public websites',
    starterCriteria: [
      { key: 'Insurance', type: 'boolean', label: 'Is this company an insurance provider?' },
      { key: 'Products', type: 'string', label: 'If it is an insurance provider, what products does it sell?' },
      { key: 'Specialized', type: 'boolean', label: 'Is it specialized in one type of insurance product?' },
      { key: 'Customer portal', type: 'string', label: 'Do they have a dedicated customer portal or customer account area?' }
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

function formatAnswer(value, resultT, language = 'fr') {
  if (typeof value === 'boolean') return value ? resultT.yes : resultT.no;
  if (typeof value === 'number') return value.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR');
  return value || resultT.unknown;
}

function normalizeDisplayKey(key = '') {
  return String(key)
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .slice(0, 48);
}

function ResultCard({ result, t }) {
  if (!result) return null;
  const fields = Object.entries(result.analysis.fields || {});
  const responseLang = result.analysis.response_language || (t.result.yes === 'Yes' ? 'en' : 'fr');
  const resultT = T[responseLang]?.result || t.result;
  const criteriaLabels = Object.fromEntries((result.submittedCriteria || result.criteria || []).map(c => [normalizeDisplayKey(c.key), c.displayKey || c.key || c.label]));
  return (
    <section className="result-card" id="result">
      <div className="result-head">
        <span className="eyebrow">{resultT.eyebrow}</span>
        <h2>{result.analysis.company_name || resultT.prospect}</h2>
        <p className="result-summary">{result.analysis.summary}</p>
      </div>
      <div className="result-meta">
        <span>{resultT.site} {result.analysis.url || result.extracted?.finalUrl}</span>
      </div>
      <table className="signal-table">
        <thead><tr><th aria-label="signal"></th><th>{resultT.answer}</th><th>{resultT.confidence}</th></tr></thead>
        <tbody>
          {fields.map(([key, item]) => (
            <tr key={key}>
              <td className="sig-label">{criteriaLabels[key] || key}</td>
              <td className={`sig-answer ${typeof item.answer === 'boolean' ? (item.answer ? 'yes' : 'no') : ''}`}>
                {formatAnswer(item.answer, resultT, responseLang)}
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
  const [url, setUrl] = useState('https://bullebleue.fr');
  const [criteria, setCriteria] = useState(T[lang].starterCriteria);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [lead, setLead] = useState({ name: '', email: '', volume: '10 000+', message: '' });
  const [leadStatus, setLeadStatus] = useState('idle');

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
      setResult({ ...payload, submittedCriteria: criteria });
      setTimeout(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      setError(err.message || t.form.errorUnknown);
    } finally {
      setLoading(false);
    }
  }

  async function submitContact(event) {
    event.preventDefault();
    setLeadStatus('loading');
    try {
      const response = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, lang })
      });
      if (!response.ok) throw new Error('contact failed');
      setLeadStatus('success');
      setLead({ name: '', email: '', volume: '10 000+', message: '' });
    } catch {
      setLeadStatus('error');
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Webbby home"><span className="logo"><SearchCheck size={22} /></span><span>Webbby</span></a>
        <div className="nav-links"><a href="#demo">{t.nav.test}</a><a href="#use-cases">{t.nav.useCases}</a><a href="#integrations">{t.nav.integrations}</a><a href="#pricing">{t.nav.offer}</a><a href="#faq">{t.nav.faq}</a></div>
        <div className="nav-right">
          <a className="contact-link" href="#contact-sales">{t.nav.contact}</a>
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
        <div><strong>200+</strong><span>{t.trustbar.users}</span></div>
        <div><strong>10 s</strong><span>{t.trustbar.time}</span></div>
        <div><strong>∞</strong><span>{t.trustbar.signals}</span></div>
        <div><strong>0</strong><span>{t.trustbar.manual}</span></div>
      </section>

      <section className="trusted">
        <span>{t.trust.eyebrow}</span>
        <div><b>Outbound</b><b>RevOps</b><b>Founders</b><b>Agencies</b><b>B2B SaaS</b></div>
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

      <section className="use-cases" id="use-cases">
        <div className="section-head"><span className="eyebrow">{t.useCases.eyebrow}</span><h2>{t.useCases.title}</h2><p>{t.useCases.desc}</p></div>
        <div className="use-case-grid">
          <article><span>01</span><h3>{t.useCases.aTitle}</h3><p>{t.useCases.aDesc}</p></article>
          <article><span>02</span><h3>{t.useCases.bTitle}</h3><p>{t.useCases.bDesc}</p></article>
          <article><span>03</span><h3>{t.useCases.cTitle}</h3><p>{t.useCases.cDesc}</p></article>
          <article><span>04</span><h3>{t.useCases.dTitle}</h3><p>{t.useCases.dDesc}</p></article>
        </div>
      </section>

      <section className="integrations" id="integrations">
        <div className="integration-copy"><span className="eyebrow">{t.integrations.eyebrow}</span><h2>{t.integrations.title}</h2><p>{t.integrations.desc}</p><a className="secondary plan-cta" href="#contact-sales">{t.nav.contact}</a></div>
        <div className="integration-grid">
          {[t.integrations.a,t.integrations.b,t.integrations.c,t.integrations.d,t.integrations.e,t.integrations.f,t.integrations.g,t.integrations.h].map(name => <b key={name}>{name}</b>)}
        </div>
        <p className="integration-note">{t.integrations.note}</p>
      </section>

      <section className="pricing" id="pricing">
        <div className="section-head"><span className="eyebrow">{t.pricing.eyebrow}</span><h2>{t.pricing.title}</h2></div>
        <div className="price-grid three">
          <article><span>{t.pricing.starter}</span><h3>{t.pricing.starterPrice}<small>{t.pricing.starterUnit}</small></h3><p>{t.pricing.starterDesc}</p><ul><li>{t.pricing.starterL1}</li><li>{t.pricing.starterL2}</li><li>{t.pricing.starterL3}</li></ul><a className="secondary plan-cta" href="#demo">{t.hero.cta}</a></article>
          <article className="hot"><span>{t.pricing.pro}</span><h3>{t.pricing.proPrice}<small>{t.pricing.proUnit}</small></h3><p>{t.pricing.proDesc}</p><ul><li>{t.pricing.proL1}</li><li>{t.pricing.proL2}</li><li>{t.pricing.proL3}</li></ul><a className="primary plan-cta" href="#demo">{t.hero.cta}</a></article>
          <article><span>{t.pricing.enterprise}</span><h3>{t.pricing.enterprisePrice}</h3><p>{t.pricing.enterpriseDesc}</p><ul><li>{t.pricing.enterpriseL1}</li><li>{t.pricing.enterpriseL2}</li><li>{t.pricing.enterpriseL3}</li></ul><a className="secondary plan-cta" href="#contact-sales">Contact sales</a></article>
        </div>
      </section>

      <section className="testimonials">
        <div className="section-head"><span className="eyebrow">{t.testimonials.eyebrow}</span><h2>{t.testimonials.title}</h2></div>
        <div className="testimonial-grid">
          <article><p>“{t.testimonials.a}”</p><strong>{t.testimonials.an}</strong><span>{t.testimonials.ar}</span></article>
          <article><p>“{t.testimonials.b}”</p><strong>{t.testimonials.bn}</strong><span>{t.testimonials.br}</span></article>
          <article><p>“{t.testimonials.c}”</p><strong>{t.testimonials.cn}</strong><span>{t.testimonials.cr}</span></article>
        </div>
      </section>

      <section className="contact-sales" id="contact-sales">
        <div className="contact-copy"><span className="eyebrow">{t.contact.eyebrow}</span><h2>{t.contact.title}</h2><p>{t.contact.desc}</p></div>
        <form className="contact-form" onSubmit={submitContact}>
          <input aria-label={t.contact.name} value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} placeholder={t.contact.name} />
          <input aria-label={t.contact.email} type="email" required value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} placeholder={t.contact.email} />
          <input aria-label={t.contact.volume} value={lead.volume} onChange={e => setLead({ ...lead, volume: e.target.value })} placeholder={t.contact.volume} />
          <textarea aria-label={t.contact.message} required value={lead.message} onChange={e => setLead({ ...lead, message: e.target.value })} placeholder={t.contact.message} />
          <button className="primary" disabled={leadStatus === 'loading'} type="submit">{leadStatus === 'loading' ? t.contact.loading : t.contact.submit}</button>
          {leadStatus === 'success' && <p className="form-ok">{t.contact.success}</p>}
          {leadStatus === 'error' && <p className="form-error">{t.contact.error}</p>}
        </form>
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
