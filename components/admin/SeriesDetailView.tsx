"use client";
import { ArrowLeft, Calendar, Clock, Link as LinkIcon, PlayCircle, Edit, Plus, Layers } from "lucide-react";
import Link from "next/link";
import { styles, formatDate } from "./shared";

export default function SeriesDetailView({ series }: { series: any }) {
  const episodes: any[] = series.episodes || [];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/panel/kajian/series" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, textDecoration: "none", marginBottom: 12, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Kembali ke Kelola Series
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: "#EDE9FE", color: "#7C3AED" }}>{series.category}</span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{episodes.length} Episode</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={22} color="#7C3AED" /> {series.title}
            </h1>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>{series.ustadz}</p>
            {series.description && <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 8, maxWidth: 500 }}>{series.description}</p>}
          </div>
          <Link href={`/panel/kajian/create`} style={{ ...styles.primaryBtn, textDecoration: 'none' }}>
            <Plus size={18} /> Tambah Episode
          </Link>
        </div>
      </div>

      {series.image && (
        <div style={{ height: 200, borderRadius: 20, overflow: "hidden", marginBottom: 24, background: "#F8FAFC" }}>
          <img src={series.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        </div>
      )}

      <div style={styles.card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 16, padding: "0 0 12px", borderBottom: "1px solid #F1F5F9" }}>
          Daftar Episode
        </h2>
        {episodes.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Belum ada episode</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Tambah kajian baru dengan memilih series ini</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {episodes.map((ep: any) => (
              <div key={ep.id} style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #F1F5F9", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#7C3AED" }}>{ep.episode_number || '?'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{ep.title}</h3>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} /> {formatDate(ep.date)}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} /> {ep.time_display}
                    </span>
                    {ep.url_zoom && (
                      <a href={ep.url_zoom} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                        <LinkIcon size={12} /> Zoom
                      </a>
                    )}
                    {ep.url_youtube && (
                      <a href={ep.url_youtube} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#DC2626", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                        <PlayCircle size={12} /> YouTube
                      </a>
                    )}
                  </div>
                  {ep.description && <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6, lineHeight: 1.5 }}>{ep.description}</p>}
                </div>
                <Link href={`/panel/kajian/${ep.id}/edit`} style={{ ...styles.actionBtnEdit, textDecoration: "none" }} title="Edit Episode">
                  <Edit size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
