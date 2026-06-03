import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ── Page config ──────────────────────────────────────────────────────────
st.set_page_config(
    page_title="SmartDiet Dashboard",
    page_icon="🥗",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ───────────────────────────────────────────────────────────
st.markdown("""
<style>
    .main { background-color: #F8F7F3; }
    .metric-card {
        background: white;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        border: 0.5px solid #E0DDD6;
        text-align: center;
    }
    .metric-num  { font-size: 28px; font-weight: 600; color: #0F6E56; }
    .metric-label{ font-size: 12px; color: #888780; margin-top: 4px; }
    .section-title {
        font-size: 18px; font-weight: 600;
        color: #2C2C2A; margin: 1.5rem 0 0.75rem;
        padding-bottom: 6px;
        border-bottom: 2px solid #1D9E75;
        display: inline-block;
    }
    .insight-box {
        background: #E1F5EE; border-left: 4px solid #1D9E75;
        border-radius: 0 8px 8px 0; padding: 0.75rem 1rem;
        color: #0F6E56; font-size: 13px; margin: 0.5rem 0 1rem;
    }
    [data-testid="stSidebar"] { background-color: #F1EFE8; }
    div[data-testid="metric-container"] { background: white; border-radius: 10px; padding: 0.75rem; }
</style>
""", unsafe_allow_html=True)

# ── Color palette ────────────────────────────────────────────────────────
CAT_COLORS = {
    "Meat & Poultry": "#185FA5",
    "Seafood":        "#1D9E75",
    "Dairy":          "#E9C46A",
    "Fruits":         "#D85A30",
    "Vegetables":     "#3BB273",
    "Grains & Carbs": "#BA7517",
    "Legumes":        "#7F77DD",
    "Nuts & Seeds":   "#888780",
    "Sweets & Snacks":"#E24B4A",
    "Eggs":           "#F0997B",
    "Others":         "#D3D1C7",
}

# ── Load & prep data ─────────────────────────────────────────────────────
# ── BMR / TDEE helpers ───────────────────────────────────────────────────
def hitung_bmr(berat, tinggi, usia, gender):
    base = 10*berat + 6.25*tinggi - 5*usia
    return base + 5 if gender == "Pria" else base - 161

AKTIVITAS = {
    "Sedentary (tidak olahraga)":       1.200,
    "Lightly active (1-3x/minggu)":     1.375,
    "Moderately active (3-5x/minggu)":  1.550,
    "Very active (6-7x/minggu)":        1.725,
    "Extra active (atlet/kerja fisik)": 1.900,
}

TUJUAN = {
    "Cut (Defisit -20%)": {"mult": 0.80, "protein": 0.35, "karbo": 0.35, "lemak": 0.30},
    "Maintain (Balance)": {"mult": 1.00, "protein": 0.30, "karbo": 0.40, "lemak": 0.30},
    "Bulk (Surplus +15%)": {"mult": 1.15, "protein": 0.25, "karbo": 0.50, "lemak": 0.25},
}

def kategorikan(nama):
    nama = str(nama).lower()
    if any(x in nama for x in ["chicken","beef","pork","lamb","turkey","duck","meat","veal","goose"]): return "Meat & Poultry"
    elif any(x in nama for x in ["salmon","tuna","fish","shrimp","cod","crab","lobster","sardine"]): return "Seafood"
    elif any(x in nama for x in ["milk","cheese","yogurt","butter","cream","dairy"]): return "Dairy"
    elif any(x in nama for x in ["apple","banana","orange","mango","grape","berry","fruit","lemon","melon"]): return "Fruits"
    elif any(x in nama for x in ["broccoli","spinach","carrot","tomato","potato","vegetable","lettuce","onion","pepper"]): return "Vegetables"
    elif any(x in nama for x in ["rice","bread","pasta","noodle","wheat","oat","flour","cereal","grain"]): return "Grains & Carbs"
    elif any(x in nama for x in ["bean","lentil","pea","legume","tofu","soy"]): return "Legumes"
    elif any(x in nama for x in ["almond","walnut","peanut","cashew","nut","seed"]): return "Nuts & Seeds"
    elif any(x in nama for x in ["cake","cookie","chocolate","candy","sugar","sweet","dessert"]): return "Sweets & Snacks"
    elif any(x in nama for x in ["egg"]): return "Eggs"
    else: return "Others"

# ── Load & prep data ─────────────────────────────────────────────────────
@st.cache_data
def load_data():
    df = pd.read_csv("cleaned_nutrition_dataset_per100g.csv")
    try:
        df2 = pd.read_csv("../machine-learning/nutrition_labeled.csv")
        label_cols = [c for c in df2.columns if c.startswith("is_") or c.startswith("allergen_")]
        df = df.merge(df2[["food_normalized"] + label_cols], on="food_normalized", how="left")
    except Exception:
        for col in ["is_vegetarian","is_vegan","is_halal","is_gluten_free","is_lactose_free","is_nut_free"]:
            df[col] = True
        for col in ["allergen_peanut","allergen_milk","allergen_egg","allergen_fish","allergen_shellfish","allergen_soy","allergen_wheat"]:
            df[col] = False
    df["category"] = df["food_normalized"].apply(kategorikan)
    df = df[
        (df["Calories (kcal per 100g)"] <= 900) &
        (df["Protein (g per 100g)"]    <= 100) &
        (df["Fat (g per 100g)"]        <= 100)
    ].copy()
    return df

df = load_data()

MAIN_CATS = [c for c in CAT_COLORS if c != "Others"]

# ════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.image("https://img.icons8.com/color/96/salad.png", width=56)
    st.title("SmartDiet")
    st.caption("Data Science Dashboard · v1.0")
    st.divider()

    st.subheader("📋 Profil User")
    berat   = st.number_input("Berat badan (kg)",   min_value=30,  max_value=200, value=70)
    tinggi  = st.number_input("Tinggi badan (cm)",  min_value=130, max_value=220, value=170)
    usia    = st.number_input("Usia (tahun)",        min_value=10,  max_value=80,  value=25)
    gender  = st.radio("Gender", ["Pria", "Wanita"], horizontal=True)
    aktivitas = st.selectbox("Tingkat Aktivitas", list(AKTIVITAS.keys()), index=2)
    tujuan    = st.selectbox("Tujuan Diet", list(TUJUAN.keys()), index=1)

    st.divider()
    st.subheader("🔍 Filter Dataset")
    sel_cats = st.multiselect(
        "Kategori Makanan",
        options=MAIN_CATS,
        default=MAIN_CATS,
    )
    pantangan = st.multiselect(
        "Pantangan Makan",
        options=["Vegetarian","Vegan","Halal","Gluten Free","Lactose Free","Nut Free"],
        default=[],
    )

# ── Hitung BMR / TDEE ────────────────────────────────────────────────────
bmr  = hitung_bmr(berat, tinggi, usia, gender)
tdee = bmr * AKTIVITAS[aktivitas]
cfg  = TUJUAN[tujuan]
kal_target = tdee * cfg["mult"]
protein_g  = kal_target * cfg["protein"] / 4
karbo_g    = kal_target * cfg["karbo"]   / 4
lemak_g    = kal_target * cfg["lemak"]   / 9

# ── Apply filters ────────────────────────────────────────────────────────
df_filtered = df[df["category"].isin(sel_cats)].copy() if sel_cats else df.copy()

pantangan_map = {
    "Vegetarian":  "is_vegetarian",
    "Vegan":       "is_vegan",
    "Halal":       "is_halal",
    "Gluten Free": "is_gluten_free",
    "Lactose Free":"is_lactose_free",
    "Nut Free":    "is_nut_free",
}
for p in pantangan:
    col = pantangan_map[p]
    if col in df_filtered.columns:
        df_filtered = df_filtered[df_filtered[col] == True]

# ════════════════════════════════════════════════════════════════════════
# MAIN CONTENT — Tabs
# ════════════════════════════════════════════════════════════════════════
st.markdown("## 🥗 SmartDiet Assistant — Data Science Dashboard")
st.caption(f"Dataset: **{len(df_filtered):,}** item makanan aktif · Filter: {len(sel_cats)} kategori · Pantangan: {', '.join(pantangan) if pantangan else 'Tidak ada'}")

tab1, tab2, tab3, tab4 = st.tabs([
    "🏠 Kebutuhan Nutrisi",
    "📊 Insight Dataset",
    "🍽️ Rekomendasi Makanan",
    "🔬 Eksplorasi Data",
])

# ════════════════════════════════════════════════════════════════════════
# TAB 1 — Kebutuhan Nutrisi (Fitur 4 + 5)
# ════════════════════════════════════════════════════════════════════════
with tab1:
    st.markdown('<p class="section-title">Hasil Kalkulasi BMR & TDEE</p>', unsafe_allow_html=True)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("BMR",          f"{bmr:,.0f} kcal/hari",  help="Basal Metabolic Rate — kalori minimum saat istirahat total")
    c2.metric("TDEE",         f"{tdee:,.0f} kcal/hari", help="Total Daily Energy Expenditure — kebutuhan kalori harian sesuai aktivitas")
    c3.metric("Kalori Target",f"{kal_target:,.0f} kcal", delta=f"{(cfg['mult']-1)*100:+.0f}% dari TDEE")
    c4.metric("Aktivitas",    f"×{AKTIVITAS[aktivitas]:.3f}", help="Activity Factor (PAL) yang digunakan")

    st.markdown('<div class="insight-box">Formula: <b>Mifflin-St Jeor (1990)</b> — BMR = (10 × berat) + (6.25 × tinggi) − (5 × usia) + (5 jika pria / −161 jika wanita) → TDEE = BMR × Activity Factor</div>', unsafe_allow_html=True)

    st.markdown('<p class="section-title">Distribusi Makronutrien Harian</p>', unsafe_allow_html=True)

    col_macro, col_detail = st.columns([1, 1])

    with col_macro:
        fig_donut = go.Figure(go.Pie(
            labels=["Protein", "Karbohidrat", "Lemak"],
            values=[protein_g * 4, karbo_g * 4, lemak_g * 9],
            hole=0.55,
            marker_colors=["#185FA5", "#E9C46A", "#D85A30"],
            textinfo="label+percent",
            textfont_size=13,
            hovertemplate="%{label}: %{value:.0f} kcal (%{percent})<extra></extra>",
        ))
        fig_donut.update_layout(
            title=dict(text=f"<b>{kal_target:,.0f} kcal/hari</b><br><sup>{tujuan}</sup>", x=0.5, font_size=14),
            showlegend=False, height=320,
            margin=dict(t=60, b=20, l=20, r=20),
            paper_bgcolor="white", plot_bgcolor="white",
        )
        fig_donut.add_annotation(
            text=f"<b>{kal_target:,.0f}</b><br>kcal",
            x=0.5, y=0.5, showarrow=False,
            font=dict(size=16, color="#2C2C2A"),
        )
        st.plotly_chart(fig_donut, use_container_width=True)

    with col_detail:
        st.markdown("#### Rincian per Makronutrien")
        macros = [
            ("🥩 Protein",      protein_g, "gram/hari", "#185FA5", cfg["protein"]*100),
            ("🌾 Karbohidrat",  karbo_g,   "gram/hari", "#E9C46A", cfg["karbo"]*100),
            ("🫒 Lemak",        lemak_g,   "gram/hari", "#D85A30", cfg["lemak"]*100),
        ]
        for label, val, unit, color, pct in macros:
            st.markdown(f"**{label}** — {val:.0f} {unit} ({pct:.0f}% kalori)")
            st.progress(int(pct), text="")
        st.markdown("")
        st.info(f"💡 **Catatan tujuan {tujuan}:**\n\n" + {
            "Cut (Defisit -20%)":  "Protein ditingkatkan ke 35% untuk mencegah muscle loss saat defisit.",
            "Maintain (Balance)":  "Distribusi seimbang 30/40/30 sesuai rekomendasi WHO untuk diet sehat.",
            "Bulk (Surplus +15%)": "Karbohidrat ditingkatkan ke 50% untuk mendukung energi latihan.",
        }[tujuan])

    # Comparison across all tujuan
    st.markdown('<p class="section-title">Perbandingan Kalori Target per Tujuan Diet</p>', unsafe_allow_html=True)

    comp_data = []
    for t, c in TUJUAN.items():
        kt = tdee * c["mult"]
        comp_data.append({
            "Tujuan": t, "Kalori Target": round(kt),
            "Protein (g)": round(kt*c["protein"]/4),
            "Karbo (g)":   round(kt*c["karbo"]/4),
            "Lemak (g)":   round(kt*c["lemak"]/9),
        })
    df_comp = pd.DataFrame(comp_data)

    fig_comp = go.Figure()
    for macro, color in [("Protein (g)", "#185FA5"), ("Karbo (g)", "#E9C46A"), ("Lemak (g)", "#D85A30")]:
        fig_comp.add_trace(go.Bar(
            name=macro, x=df_comp["Tujuan"], y=df_comp[macro],
            marker_color=color, text=df_comp[macro],
            textposition="inside", textfont_color="white",
        ))
    fig_comp.update_layout(
        barmode="stack", height=300,
        margin=dict(t=20, b=20, l=20, r=20),
        paper_bgcolor="white", plot_bgcolor="white",
        legend=dict(orientation="h", y=1.1),
        yaxis_title="Gram per hari",
    )
    st.plotly_chart(fig_comp, use_container_width=True)

# ════════════════════════════════════════════════════════════════════════
# TAB 2 — Insight Dataset
# ════════════════════════════════════════════════════════════════════════
with tab2:
    st.markdown('<p class="section-title">Ringkasan Dataset</p>', unsafe_allow_html=True)

    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Total Item", f"{len(df_filtered):,}")
    m2.metric("Rerata Kalori", f"{df_filtered['Calories (kcal per 100g)'].mean():.0f} kcal")
    m3.metric("Rerata Protein", f"{df_filtered['Protein (g per 100g)'].mean():.1f} g")
    m4.metric("Rerata Serat", f"{df_filtered['Dietary Fiber (g per 100g)'].mean():.1f} g")
    m5.metric("Kategori Aktif", len(df_filtered["category"].unique()))

    col_left, col_right = st.columns(2)

    with col_left:
        st.markdown("#### Distribusi Item per Kategori")
        cat_counts = df_filtered[df_filtered["category"] != "Others"]["category"].value_counts().reset_index()
        cat_counts.columns = ["Kategori", "Jumlah"]
        fig_cat = px.bar(
            cat_counts.sort_values("Jumlah"),
            x="Jumlah", y="Kategori", orientation="h",
            color="Kategori",
            color_discrete_map=CAT_COLORS,
            text="Jumlah",
        )
        fig_cat.update_traces(textposition="outside")
        fig_cat.update_layout(
            showlegend=False, height=380,
            margin=dict(t=10, b=10, l=10, r=40),
            paper_bgcolor="white", plot_bgcolor="white",
            xaxis_title="", yaxis_title="",
        )
        st.plotly_chart(fig_cat, use_container_width=True)

    with col_right:
        st.markdown("#### Rata-rata Kalori & Protein per Kategori")
        cat_agg = df_filtered[df_filtered["category"] != "Others"].groupby("category").agg(
            Kalori=("Calories (kcal per 100g)", "mean"),
            Protein=("Protein (g per 100g)", "mean"),
        ).round(1).reset_index().sort_values("Kalori", ascending=True)

        fig_bubble = px.scatter(
            cat_agg, x="Kalori", y="Protein",
            size="Protein", color="category",
            color_discrete_map=CAT_COLORS,
            text="category", size_max=40,
            labels={"Kalori": "Rata-rata Kalori (kcal/100g)", "Protein": "Rata-rata Protein (g/100g)"},
        )
        fig_bubble.update_traces(textposition="top center", textfont_size=9)
        fig_bubble.update_layout(
            showlegend=False, height=380,
            margin=dict(t=10, b=10, l=10, r=10),
            paper_bgcolor="white", plot_bgcolor="#FAFAF8",
        )
        st.plotly_chart(fig_bubble, use_container_width=True)

    # Label pantangan summary
    st.markdown('<p class="section-title">Distribusi Label Pantangan & Alergen</p>', unsafe_allow_html=True)

    col_p, col_a = st.columns(2)

    with col_p:
        st.markdown("#### Pantangan Makan")
        pant_cols = {"Vegetarian":"is_vegetarian","Vegan":"is_vegan","Halal":"is_halal",
                     "Gluten Free":"is_gluten_free","Lactose Free":"is_lactose_free","Nut Free":"is_nut_free"}
        pant_data = [{"Label": k, "Jumlah Aman": df_filtered[v].sum(), "Persen": f"{df_filtered[v].mean()*100:.1f}%"}
                     for k, v in pant_cols.items() if v in df_filtered.columns]
        df_pant = pd.DataFrame(pant_data)
        fig_pant = px.bar(df_pant, x="Label", y="Jumlah Aman",
                          text="Persen", color_discrete_sequence=["#1D9E75"])
        fig_pant.update_traces(textposition="outside")
        fig_pant.update_layout(height=280, margin=dict(t=10,b=10,l=10,r=10),
                                paper_bgcolor="white", plot_bgcolor="white",
                                xaxis_title="", yaxis_title="Jumlah Makanan Aman")
        st.plotly_chart(fig_pant, use_container_width=True)

    with col_a:
        st.markdown("#### Alergen yang Ditemukan")
        al_cols = {"Kacang Tanah":"allergen_peanut","Susu":"allergen_milk","Telur":"allergen_egg",
                   "Ikan":"allergen_fish","Shellfish":"allergen_shellfish","Kedelai":"allergen_soy","Gandum":"allergen_wheat"}
        al_data = [{"Alergen": k, "Jumlah": df_filtered[v].sum(), "Persen": f"{df_filtered[v].mean()*100:.1f}%"}
                   for k, v in al_cols.items() if v in df_filtered.columns]
        df_al = pd.DataFrame(al_data).sort_values("Jumlah", ascending=True)
        fig_al = px.bar(df_al, x="Jumlah", y="Alergen", orientation="h",
                        text="Persen", color_discrete_sequence=["#D85A30"])
        fig_al.update_traces(textposition="outside")
        fig_al.update_layout(height=280, margin=dict(t=10,b=10,l=10,r=50),
                              paper_bgcolor="white", plot_bgcolor="white",
                              xaxis_title="Jumlah Makanan Mengandung Alergen", yaxis_title="")
        st.plotly_chart(fig_al, use_container_width=True)

# ════════════════════════════════════════════════════════════════════════
# TAB 3 — Rekomendasi Makanan
# ════════════════════════════════════════════════════════════════════════
with tab3:
    st.markdown('<p class="section-title">Rekomendasi Berdasarkan Tujuan Diet & Profil Kamu</p>', unsafe_allow_html=True)

    st.markdown(f"""
    <div class="insight-box">
    Kalori target kamu: <b>{kal_target:,.0f} kcal/hari</b> ({tujuan}) ·
    Protein: <b>{protein_g:.0f}g</b> · Karbo: <b>{karbo_g:.0f}g</b> · Lemak: <b>{lemak_g:.0f}g</b>
    </div>
    """, unsafe_allow_html=True)

    rec_mode = st.radio(
        "Mode Rekomendasi",
        ["🥗 Weight Loss (kalori rendah, serat tinggi)",
         "💪 Muscle Gain (protein tinggi, efisien)",
         "⚖️ Balanced (seimbang semua nutrisi)"],
        horizontal=True,
    )

    n_rec = st.slider("Jumlah rekomendasi", 5, 20, 10)
    df_rec = df_filtered[df_filtered["category"] != "Others"].copy()

    if "Weight Loss" in rec_mode:
        df_rec = df_rec[
            (df_rec["Calories (kcal per 100g)"] < 150) &
            (df_rec["Dietary Fiber (g per 100g)"] >= 1) &
            (df_rec["Protein (g per 100g)"] >= 1)
        ].sort_values("Calories (kcal per 100g)").head(n_rec)
        x_col, y_col, color_col = "Calories (kcal per 100g)", "Dietary Fiber (g per 100g)", "category"
        title_chart = "Weight Loss: Kalori vs Serat"

    elif "Muscle Gain" in rec_mode:
        df_rec["protein_eff"] = (df_rec["Protein (g per 100g)"] / df_rec["Calories (kcal per 100g)"].replace(0, np.nan) * 100).fillna(0)
        df_rec = df_rec[
            (df_rec["Protein (g per 100g)"] >= 20) &
            (df_rec["Calories (kcal per 100g)"] < 400)
        ].sort_values("Protein (g per 100g)", ascending=False).head(n_rec)
        x_col, y_col, color_col = "Protein (g per 100g)", "Calories (kcal per 100g)", "category"
        title_chart = "Muscle Gain: Protein vs Kalori"

    else:
        df_rec["balance_score"] = (
            df_rec["Protein (g per 100g)"] / df_rec["Protein (g per 100g)"].max() * 0.35 +
            df_rec["Dietary Fiber (g per 100g)"] / df_rec["Dietary Fiber (g per 100g)"].max() * 0.35 +
            (1 - df_rec["Calories (kcal per 100g)"] / df_rec["Calories (kcal per 100g)"].max()) * 0.30
        )
        df_rec = df_rec.sort_values("balance_score", ascending=False).head(n_rec)
        x_col, y_col, color_col = "Protein (g per 100g)", "Dietary Fiber (g per 100g)", "category"
        title_chart = "Balanced: Protein vs Serat"

    col_chart, col_table = st.columns([1.2, 1])

    with col_chart:
        if len(df_rec) > 0:
            fig_rec = px.scatter(
                df_rec, x=x_col, y=y_col,
                color=color_col,
                color_discrete_map=CAT_COLORS,
                size="Calories (kcal per 100g)",
                size_max=25,
                hover_name="food",
                hover_data={
                    "Calories (kcal per 100g)": ":.1f",
                    "Protein (g per 100g)": ":.1f",
                    "Dietary Fiber (g per 100g)": ":.1f",
                    "category": True,
                },
                title=title_chart,
            )
            fig_rec.update_layout(
                height=420, margin=dict(t=40, b=20, l=20, r=20),
                paper_bgcolor="white", plot_bgcolor="#FAFAF8",
            )
            st.plotly_chart(fig_rec, use_container_width=True)
        else:
            st.warning("Tidak ada makanan yang memenuhi kriteria dengan filter saat ini.")

    with col_table:
        st.markdown("#### Daftar Rekomendasi")
        if len(df_rec) > 0:
            display_cols = ["food", "category", "Calories (kcal per 100g)", "Protein (g per 100g)", "Dietary Fiber (g per 100g)"]
            rename_map = {
                "food": "Makanan",
                "category": "Kategori",
                "Calories (kcal per 100g)": "Kalori",
                "Protein (g per 100g)": "Protein (g)",
                "Dietary Fiber (g per 100g)": "Serat (g)",
            }
            st.dataframe(
                df_rec[display_cols].rename(columns=rename_map).reset_index(drop=True),
                use_container_width=True, height=380,
                column_config={
                    "Kalori": st.column_config.NumberColumn(format="%.0f kcal"),
                    "Protein (g)": st.column_config.NumberColumn(format="%.1f g"),
                    "Serat (g)": st.column_config.NumberColumn(format="%.1f g"),
                }
            )

# ════════════════════════════════════════════════════════════════════════
# TAB 4 — Eksplorasi Data
# ════════════════════════════════════════════════════════════════════════
with tab4:
    st.markdown('<p class="section-title">Eksplorasi Interaktif Dataset</p>', unsafe_allow_html=True)

    col_x, col_y, col_size, col_cat = st.columns(4)
    num_cols = [
        "Calories (kcal per 100g)", "Protein (g per 100g)", "Fat (g per 100g)",
        "Carbohydrates (g per 100g)", "Dietary Fiber (g per 100g)", "Sugars (g per 100g)",
        "Sodium (mg per 100g)", "Calcium (mg per 100g)", "Iron (mg per 100g)",
        "Vitamin C (mg per 100g)",
    ]
    x_axis    = col_x.selectbox("Sumbu X",    num_cols, index=0)
    y_axis    = col_y.selectbox("Sumbu Y",    num_cols, index=1)
    size_col  = col_size.selectbox("Ukuran",  num_cols, index=3)
    cat_filter= col_cat.multiselect("Filter Kategori", MAIN_CATS, default=["Vegetables","Seafood","Meat & Poultry","Legumes","Fruits"])

    df_explore = df_filtered[df_filtered["category"].isin(cat_filter)].copy() if cat_filter else df_filtered.copy()
    df_explore = df_explore[df_explore[size_col] > 0]

    # Cap outliers untuk visualisasi
    for col in [x_axis, y_axis, size_col]:
        cap = df_explore[col].quantile(0.97)
        df_explore[col] = df_explore[col].clip(upper=cap)

    fig_explore = px.scatter(
        df_explore.sample(min(1000, len(df_explore)), random_state=42),
        x=x_axis, y=y_axis,
        color="category",
        color_discrete_map=CAT_COLORS,
        size=size_col, size_max=20,
        hover_name="food",
        opacity=0.75,
        title=f"{y_axis} vs {x_axis}",
    )
    fig_explore.update_layout(
        height=480, margin=dict(t=40, b=20, l=20, r=20),
        paper_bgcolor="white", plot_bgcolor="#FAFAF8",
        legend=dict(orientation="h", y=-0.15),
    )
    st.plotly_chart(fig_explore, use_container_width=True)

    st.caption(f"Menampilkan hingga 1.000 sample dari {len(df_explore):,} item. Outlier di-cap pada persentil ke-97 untuk keterbacaan visualisasi.")

    # Heatmap korelasi
    st.markdown("#### Korelasi Antar Nutrisi")
    corr_cols = ["Calories (kcal per 100g)","Protein (g per 100g)","Fat (g per 100g)",
                 "Carbohydrates (g per 100g)","Dietary Fiber (g per 100g)","Sugars (g per 100g)"]
    corr_labels = ["Kalori","Protein","Lemak","Karbo","Serat","Gula"]
    corr = df_explore[corr_cols].corr().round(2)

    fig_heatmap = px.imshow(
        corr, text_auto=True,
        x=corr_labels, y=corr_labels,
        color_continuous_scale="RdBu_r",
        zmin=-1, zmax=1,
        aspect="auto",
    )
    fig_heatmap.update_layout(
        height=380, margin=dict(t=20, b=20, l=20, r=20),
        paper_bgcolor="white",
        coloraxis_colorbar=dict(title="r"),
    )
    st.plotly_chart(fig_heatmap, use_container_width=True)

# ── Footer ───────────────────────────────────────────────────────────────
st.divider()
st.caption("SmartDiet Assistant · Data Science Dashboard · Dataset: USDA FoodData Central · Formula: Mifflin-St Jeor (1990)")
