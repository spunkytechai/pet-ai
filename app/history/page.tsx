'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '@/components/app-nav'

type Item = { id:string; pet_id?:string; pet?:{id:string;name:string;species:string}|null; species:string; likely_intent:string; emotional_state:string; confidence:number; safety_flag:boolean; alternatives?:string[]; context_used?:string[]; created_at:string; model_version:string }

export default function HistoryPage() {
  const [history,setHistory]=useState<Item[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [petFilter,setPetFilter]=useState('all')
  const [view,setView]=useState<'timeline'|'patterns'>('timeline')

  useEffect(()=>{ fetch('/api/history',{credentials:'same-origin'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d?.error||'History could not be loaded.');setHistory(d.history??[])}).catch(e=>setError(e instanceof Error?e.message:'History could not be loaded.')).finally(()=>setLoading(false)) },[])

  const pets=useMemo(()=>Array.from(new Map(history.map(i=>[i.pet?.id??i.pet_id??i.pet?.name,i.pet])).values()).filter(Boolean),[history])
  const filtered=useMemo(()=>petFilter==='all'?history:history.filter(i=>(i.pet?.id??i.pet_id)===petFilter),[history,petFilter])
  const patterns=useMemo(()=>{const map=new Map<string,{name:string;species:string;counts:Record<string,number>;total:number;confidence:number}>();for(const i of filtered){const id=i.pet?.id??i.pet_id??'unknown';const p=map.get(id)??{name:i.pet?.name??'Pet',species:i.pet?.species??i.species,counts:{},total:0,confidence:0};p.counts[i.likely_intent]=(p.counts[i.likely_intent]??0)+1;p.total++;p.confidence+=Number(i.confidence||0);map.set(id,p)}return Array.from(map.values()).map(p=>({...p,top:Object.entries(p.counts).sort((a,b)=>b[1]-a[1])[0],confidence:p.confidence/p.total}))},[filtered])

  return <main className="app-page"><div className="container"><AppNav/>
    <section className="hero history-hero"><div className="eyebrow">Your pet memory</div><h1>A record of what you've learned together.</h1><p>See recurring observations across time while keeping every interpretation in its proper context.</p></section>
    <div className="history-toolbar"><div><strong>{filtered.length}</strong><span> interpretations</span></div><div className="history-controls"><select value={petFilter} onChange={e=>setPetFilter(e.target.value)}><option value="all">All pets</option>{pets.map(p=><option key={p!.id} value={p!.id}>{p!.name}</option>)}</select><button className={view==='timeline'?'active':''} onClick={()=>setView('timeline')}>Timeline</button><button className={view==='patterns'?'active':''} onClick={()=>setView('patterns')}>Patterns</button><span className="history-private">Private</span></div></div>
    {loading&&<div className="card"><p className="muted">Loading your pet memory…</p></div>}
    {error&&<div className="card"><p className="safety">{error}</p><Link className="secondary small" href="/login">Sign in again</Link></div>}
    {!loading&&!error&&history.length===0&&<div className="empty-state card"><div className="empty-icon">◒</div><h2>Your first signal is waiting.</h2><p className="muted">Record a sound and start building a private pattern history.</p><Link className="primary" href="/analyze">Analyze a sound →</Link></div>}
    {!loading&&!error&&history.length>0&&view==='patterns'&&<section className="memory-summary card"><div className="eyebrow">Pattern memory</div><h2>Recurring observations</h2><p className="muted">Frequency summaries are based only on recorded interpretations and do not establish diagnosis or intent.</p><div className="memory-grid">{patterns.map(p=><article key={p.name}><div className="eyebrow">{p.name} · {p.species}</div><strong>{p.top?.[0]??'No recurring pattern yet'}</strong><span>{p.top?.[1]??0} of {p.total} observations · average heuristic confidence {Math.round(p.confidence*100)}%</span><div className="pattern-bar"><i style={{width:`${Math.round(((p.top?.[1]??0)/p.total)*100)}%`}}/></div></article>)}</div></section>}
    {!loading&&!error&&history.length>0&&view==='timeline'&&<div className="history-list">{filtered.map(item=><article className="history-card" key={item.id}><div className="history-card-head"><div><div className="eyebrow">{item.pet?.name??'Pet'} · {item.pet?.species??item.species}</div><h2>{item.likely_intent}</h2></div><div className="history-confidence"><strong>{Math.round(Number(item.confidence)*100)}%</strong><span>heuristic confidence</span></div></div><p className="history-emotion">{item.emotional_state}</p><div className="history-details"><div><small>Other possibilities</small><p>{(item.alternatives??[]).join(' · ')||'None recorded'}</p></div><div><small>Context</small><p>{(item.context_used??[]).join(' · ')||'No context supplied'}</p></div></div>{item.safety_flag&&<div className="safety history-safety">Welfare attention was flagged for this interpretation.</div>}<div className="history-meta"><span>{new Date(item.created_at).toLocaleString()}</span><span>Model {item.model_version}</span></div></article>)}</div>}
  </div></main>
}
